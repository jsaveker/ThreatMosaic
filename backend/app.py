from flask import Flask, jsonify, request
from flask_cors import CORS
from py2neo import Graph, Node, Relationship
import uuid

app = Flask(__name__)
CORS(app)

# Connect to Neo4j
graph = Graph("bolt://neo4j:7687", auth=("neo4j", "password"))

@app.route('/api/threat_scenarios', methods=['GET'])
def get_threat_scenarios():
    query = """
    MATCH (ts:ThreatScenario)-[:USES_TECHNIQUE]->(t:Technique)
    RETURN ts, collect(t) as techniques
    """
    results = graph.run(query).data()
    data = []
    for record in results:
        ts_node = record['ts']
        ts = {
            'id': ts_node['id'],
            'name': ts_node['name'],
            'description': ts_node.get('description', ''),
            'techniques': []
        }
        for technique_node in record['techniques']:
            technique = {
                'id': technique_node['id'],
                'name': technique_node['name'],
                'description': technique_node.get('description', ''),
                'external_id': technique_node.get('external_id', '')
            }
            ts['techniques'].append(technique)
        data.append(ts)
    return jsonify(data)

@app.route('/api/search', methods=['GET'])
def search():
    try:
        # Retrieve query parameters
        query_param = request.args.get('query', '').strip()
        type_list = request.args.getlist('type')  # Accept multiple 'type' parameters

        app.logger.info(f"Received search request with query='{query_param}' and types={type_list}")

        # If no query is provided, return an empty list
        if not query_param:
            return jsonify([]), 200

        # If 'All Types' is selected (type_list contains an empty string), ignore type filtering
        if '' in type_list:
            type_list = []  # Empty list signifies no type filtering

        # Define valid types to prevent invalid queries
        valid_types = [
            'ThreatScenario',
            'Technique',
            'SubTechnique',
            'Campaign',
            'Tool',
            'Tactic',
            'DataSource',
            'DataComponent',
            'Mitigation'
        ]
        invalid_types = [t for t in type_list if t not in valid_types]

        # If there are invalid types, return a 400 error
        if invalid_types:
            app.logger.warning(f"Invalid types received: {invalid_types}")
            return jsonify({'error': f'Invalid types: {", ".join(invalid_types)}'}), 400

        # Define the Cypher query with case-insensitive and partial matching
        if type_list:
            # Apply type filtering
            cypher_query = """
                MATCH (n)
                WHERE ANY(label IN labels(n) WHERE label IN $types)
                AND toLower(n.name) CONTAINS toLower($searchTerm)
                RETURN n.id AS id, n.name AS name, labels(n) AS labels
            """
            params = {
                'types': type_list,
                'searchTerm': query_param
            }
        else:
            # No type filtering
            cypher_query = """
                MATCH (n)
                WHERE toLower(n.name) CONTAINS toLower($searchTerm)
                RETURN n.id AS id, n.name AS name, labels(n) AS labels
            """
            params = {
                'searchTerm': query_param
            }

        # Execute the Cypher query
        result = graph.run(cypher_query, params)
        nodes = []
        for record in result:
            node = {
                'id': record['id'],
                'name': record['name'],
                'labels': list(record['labels'])
            }
            nodes.append(node)
        app.logger.info(f"Found {len(nodes)} matching nodes.")
        return jsonify(nodes), 200

    except Exception as e:
        # Log the full exception traceback for easier debugging
        app.logger.exception("Error in /api/search:")
        return jsonify({'error': 'Internal server error.'}), 500

@app.route('/api/threat_scenarios', methods=['POST'])
def create_threat_scenario():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    threat_id = str(uuid.uuid4())

    ts_node = Node("ThreatScenario", id=threat_id, name=name, description=description)
    graph.create(ts_node)

    return jsonify({'id': threat_id, 'name': name, 'description': description}), 201

@app.route('/api/create_relationship', methods=['POST'])
def create_relationship():
    data = request.get_json()
    source_id = data.get('sourceId')
    target_id = data.get('targetId')
    relationship_type = data.get('relationship')

    if not source_id or not target_id or not relationship_type:
        return jsonify({'error': 'sourceId, targetId, and relationship are required'}), 400

    # Fetch the source and target nodes
    source_node = graph.nodes.match("ThreatScenario", id=source_id).first()
    if not source_node:
        source_node = graph.nodes.match(id=source_id).first()
    target_node = graph.nodes.match(id=target_id).first()

    if not source_node or not target_node:
        return jsonify({'error': 'Source or target node not found'}), 404

    # Create the relationship
    relationship = Relationship(source_node, relationship_type, target_node)
    graph.create(relationship)

    return jsonify({'message': f'Relationship {relationship_type} created between {source_id} and {target_id}'}), 201


@app.route('/api/related_nodes', methods=['GET'])
def get_related_nodes():
    node_id = request.args.get('nodeId', '')
    if not node_id:
        return jsonify({'error': 'nodeId parameter is required'}), 400

    # Fetch related nodes and their relationships
    cypher_query = """
    MATCH (n {id: $nodeId})-[r]->(m)
    RETURN m, type(r) as relationship
    UNION
    MATCH (m)-[r]->(n {id: $nodeId})
    RETURN m, type(r) as relationship
    """

    results = graph.run(cypher_query, nodeId=node_id).data()

    related_nodes = []
    related_links = []

    for record in results:
        related_node = record['m']
        relationship = record['relationship']
        related_nodes.append({
            'id': related_node['id'],
            'name': related_node['name'],
            'labels': list(related_node.labels)
        })
        # Add link from original node to related node with relationship type
        related_links.append({
            'source': node_id,
            'target': related_node['id'],
            'relationship': relationship
        })

    return jsonify({'nodes': related_nodes, 'links': related_links}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)