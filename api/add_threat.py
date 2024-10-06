from py2neo import Graph, Node, Relationship
import uuid

# Connect to Neo4j
graph = Graph("bolt://neo4j:7687", auth=("neo4j", "password"))

# Create a new Threat Scenario node with a unique ID
threat_scenario = Node(
    "ThreatScenario",
    id=str(uuid.uuid4()),
    name="Data Exfiltration via Phishing Attack",
    description=(
        "An attacker sends phishing emails containing malicious attachments to employees. "
        "When opened, the attachment executes malware that exfiltrates sensitive data "
        "from the corporate network."
    )
)

# Merge the ThreatScenario node into the graph
graph.merge(threat_scenario, "ThreatScenario", "id")
print("Threat scenario added successfully.")

# List of Technique IDs to associate with the threat scenario
technique_ids = [
    "attack-pattern--fa477c76-162d-49aa-9e1d-1201a8eab72f",  # T1566.001: Spearphishing Attachment
    "attack-pattern--b8d2c292-985e-4afb-9d15-3dc7e986bb46",  # T1059.001: PowerShell
    "attack-pattern--0c7b5b88-8ff7-4a4d-aa9d-045f97d426f6",  # T1041: Exfiltration Over C2 Channel
    "attack-pattern--2b742742-28c3-4e1b-bab7-8350d6300fa7", # Spearphising Link (hope this works!!!!)
]

# Iterate over the list of Technique IDs and create relationships
for technique_id in technique_ids:
    technique = graph.nodes.match("Technique", id=technique_id).first()
    if technique:
        # Create a relationship between the ThreatScenario and Technique
        rel = Relationship(threat_scenario, "USES_TECHNIQUE", technique)
        graph.merge(rel)
        print(f"Relationship created between ThreatScenario and Technique: {technique['name']}")
    else:
        print(f"Technique with ID {technique_id} not found.")

print("All relationships processed.")