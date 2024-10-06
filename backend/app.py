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
    query_param = request.args.get('query', '')
    if not query_param:
        return jsonify([])

    # Search for nodes matching the query
    query = """
    MATCH (n)
    WHERE n.name CONTAINS $searchTerm
    RETURN n
    """
    results = graph.run(query, searchTerm=query_param).data()
    
    nodes = []
    for record in results:
        node = record['n']
        nodes.append({
            'id': node['id'],
            'name': node['name'],
            'labels': list(node.labels)
        })
    return jsonify(nodes)

@app.route('/api/threat_scenarios', methods=['POST'])
def create_threat_scenario():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    threat_id = str(uuid.uuid4())

    ts_node = Node("ThreatScenario", id=threat_id, name=name, description=description)
    graph.create(ts_node)

    return jsonify({'id': threat_id, 'name': name, 'description': description}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)