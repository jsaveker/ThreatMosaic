from flask import Flask, jsonify
from flask_cors import CORS
from py2neo import Graph

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)