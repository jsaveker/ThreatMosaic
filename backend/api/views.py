from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from py2neo import Graph, Node, Relationship
import uuid

# Connect to Neo4j
graph = Graph("bolt://neo4j:7687", auth=("neo4j", "password"))

@require_http_methods(["GET"])
def get_threat_scenarios(request):
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
    return JsonResponse(data, safe=False)

@require_http_methods(["GET"])
def search(request):
    query_param = request.GET.get('query', '').strip()
    type_list = request.GET.getlist('type', [])
    if '' in type_list:
        type_list = []

    valid_types = [
        'ThreatScenario', 'Technique', 'SubTechnique', 'Campaign', 
        'Tool', 'Tactic', 'DataSource', 'DataComponent', 'Mitigation'
    ]
    invalid_types = [t for t in type_list if t not in valid_types]
    if invalid_types:
        return JsonResponse({'error': f'Invalid types: {", ".join(invalid_types)}'}, status=400)

    cypher_query = """
        MATCH (n)
        WHERE ANY(label IN labels(n) WHERE label IN $types)
        AND toLower(n.name) CONTAINS toLower($searchTerm)
        RETURN n.id AS id, n.name AS name, labels(n) AS labels
    """ if type_list else """
        MATCH (n)
        WHERE toLower(n.name) CONTAINS toLower($searchTerm)
        RETURN n.id AS id, n.name AS name, labels(n) AS labels
    """
    params = {'types': type_list, 'searchTerm': query_param}
    results = graph.run(cypher_query, params).data()
    nodes = [{'id': record['id'], 'name': record['name'], 'labels': list(record['labels'])} for record in results]
    return JsonResponse(nodes, safe=False)

@require_http_methods(["POST"])
def create_threat_scenario(request):
    data = request.json
    name = data.get('name')
    description = data.get('description', '')
    threat_id = str(uuid.uuid4())
    ts_node = Node("ThreatScenario", id=threat_id, name=name, description=description)
    graph.create(ts_node)
    return JsonResponse({'id': threat_id, 'name': name, 'description': description}, status=201)

@require_http_methods(["POST"])
def create_relationship(request):
    data = request.json
    source_id, target_id, relationship_type = data.get('sourceId'), data.get('targetId'), data.get('relationship')
    if not source_id or not target_id or not relationship_type:
        return JsonResponse({'error': 'sourceId, targetId, and relationship are required'}, status=400)

    source_node = graph.nodes.match(id=source_id).first()
    target_node = graph.nodes.match(id=target_id).first()
    if not source_node or not target_node:
        return JsonResponse({'error': 'Source or target node not found'}, status=404)

    relationship = Relationship(source_node, relationship_type, target_node)
    graph.create(relationship)
    return JsonResponse({'message': f'Relationship {relationship_type} created between {source_id} and {target_id}'}, status=201)

import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)

import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def get_related_nodes(request):
    node_id = request.GET.get('nodeId', '')
    if not node_id:
        return JsonResponse({'error': 'nodeId parameter is required'}, status=400)

    cypher_query = """
    MATCH (n {id: $nodeId})-[r]->(m)
    RETURN m, type(r) as relationship
    UNION
    MATCH (m)-[r]->(n {id: $nodeId})
    RETURN m, type(r) as relationship
    """
    
    try:
        results = graph.run(cypher_query, nodeId=node_id).data()
        
        # Prepare nodes and links, with error handling for missing fields
        nodes = []
        for record in results:
            try:
                labels = list(record['m'].labels)  # Convert labels to a list to avoid subscript issues
                node_data = {
                    'id': record['m']['id'],
                    'name': record['m']['name'],
                    'group': labels[0] if labels else 'default',  # Use first label as group if available
                    'labels': labels
                }
                nodes.append(node_data)
            except KeyError as e:
                logger.error(f"Missing expected field in node data: {e}")
                continue  # Skip this record if fields are missing

        links = [
            {
                'source': node_id,
                'target': record['m']['id'],
                'relationship': record['relationship']
            }
            for record in results
        ]

        return JsonResponse({'nodes': nodes, 'links': links}, safe=False)

    except Exception as e:
        logger.error(f"Error fetching related nodes for node ID {node_id}: {e}")
        return JsonResponse({'error': f"Server error: {e}"}, status=500)