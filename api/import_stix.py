import json
import logging
from py2neo import Graph, Node, Relationship
from stix2 import MemoryStore, Filter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Counters for summary
node_count = 0
relationship_count = 0
warning_count = 0

# Connect to Neo4j
graph = None
try:
    graph = Graph("bolt://neo4j:7687", auth=("neo4j", "password"))
    logger.info("Connected to Neo4j")
except Exception as e:
    logger.error(f"Failed to connect to Neo4j: {e}")
    exit(1)

# Path to the enterprise-attack.json file
stix_file = 'enterprise-attack.json'

# Load the STIX data using stix2
def load_stix_data(stix_file):
    logger.info(f"Loading STIX data from {stix_file}")
    try:
        with open(stix_file, 'r', encoding='utf-8') as f:
            bundle = json.load(f)
            stix_objects = bundle['objects']
            logger.info(f"Loaded {len(stix_objects)} STIX objects")
            return MemoryStore(stix_data=stix_objects)
    except Exception as e:
        logger.error(f"Error loading STIX data: {e}")
        exit(1)

# Function to determine label from type
def get_label_from_type(object_type):
    type_mapping = {
        'attack-pattern': 'Technique',
        'x-mitre-tactic': 'Tactic',
        'malware': 'Malware',
        'tool': 'Tool',
        'intrusion-set': 'IntrusionSet',
        'campaign': 'Campaign',
        'course-of-action': 'Mitigation',
        'mitigation': 'Mitigation',
        'x-mitre-data-component': 'DataComponent',
        'x-mitre-data-source': 'DataSource',
        'identity': 'Identity',
        'infrastructure': 'Infrastructure',
        'malware-analysis': 'MalwareAnalysis',
        'note': 'Note',
        'observed-data': 'ObservedData',
        'opinion': 'Opinion',
        'report': 'Report',
        'threat-actor': 'ThreatActor',
        'vulnerability': 'Vulnerability',
        'indicator': 'Indicator',
        'location': 'Location',
        'relationship': 'Relationship',
        # Add any new types discovered
    }
    if object_type:
        object_type_clean = object_type.strip().lower()
        label = type_mapping.get(object_type_clean, 'Unknown')
        if label == 'Unknown':
            logger.warning(f"Unknown object type encountered: '{object_type}'")
    else:
        label = 'Unknown'
        logger.warning("Encountered object with no type")
    return label

# Load the STIX data into a MemoryStore
stix_data = load_stix_data(stix_file)

# Get all objects from the MemoryStore
all_stix_objects = stix_data.query()

# Index objects by their 'id' for quick lookup
objects_by_id = {obj['id']: obj for obj in all_stix_objects if 'id' in obj}

# Function to create nodes from STIX objects
def create_nodes_from_stix(objects):
    global node_count
    for obj in objects:
        object_type = obj.get('type')
        if not object_type:
            logger.warning(f"Object with ID {obj.get('id')} has no 'type' field. Skipping.")
            continue  # Skip objects without a 'type' field
        label = get_label_from_type(object_type)
        try:
            node_properties = {
                'id': obj.get('id'),
                'name': obj.get('name', ''),
                'description': obj.get('description', ''),
                'revoked': obj.get('revoked', False),
                'deprecated': obj.get('x_mitre_deprecated', False),
                'stix_type': object_type,
            }
            # Add external_id for certain types
            if 'external_references' in obj:
                for ref in obj['external_references']:
                    if ref.get('source_name') == 'mitre-attack':
                        node_properties['external_id'] = ref.get('external_id')
            # Add x_mitre_shortname for Tactics
            if object_type == 'x-mitre-tactic':
                node_properties['short_name'] = obj.get('x_mitre_shortname', '')
            # Add version if available
            if 'x_mitre_version' in obj:
                node_properties['version'] = obj.get('x_mitre_version')
            node = Node(label, **node_properties)
            graph.merge(node, label, 'id')
            node_count += 1
            logger.info(f"Created/merged {label} node: {obj.get('name', '')}")
        except Exception as e:
            logger.error(f"Error creating node {obj.get('id', '')}: {e}")

# Create nodes
create_nodes_from_stix(all_stix_objects)

# Function to create relationships from STIX relationships
def create_relationships_from_stix(relationships):
    global relationship_count, warning_count
    for rel in relationships:
        if rel.get('type') == 'relationship':
            source_ref = rel.get('source_ref')
            target_ref = rel.get('target_ref')
            relationship_type = rel.get('relationship_type', '').upper()

            source_obj = objects_by_id.get(source_ref)
            target_obj = objects_by_id.get(target_ref)

            if not source_obj or not target_obj:
                warning_count += 1
                logger.warning(f"Source or target object not found for relationship: {source_ref} -> {relationship_type} -> {target_ref}")
                continue

            source_label = get_label_from_type(source_obj.get('type'))
            target_label = get_label_from_type(target_obj.get('type'))

            source_node = graph.nodes.match(source_label, id=source_ref).first()
            target_node = graph.nodes.match(target_label, id=target_ref).first()

            if source_node and target_node:
                try:
                    relationship = Relationship(source_node, relationship_type, target_node)
                    graph.merge(relationship)
                    relationship_count += 1
                    logger.info(f"Created/merged relationship {relationship_type} between {source_ref} and {target_ref}")
                except Exception as e:
                    warning_count += 1
                    logger.error(f"Error creating relationship {relationship_type} between {source_ref} and {target_ref}: {e}")
            else:
                warning_count += 1
                logger.warning(f"Source or target node not found in graph for relationship: {source_ref} ({source_label}) -> {relationship_type} -> {target_ref} ({target_label})")

# Create relationships between Data Sources and Data Components
def create_data_source_component_relationships(objects):
    global relationship_count, warning_count
    for obj in objects:
        if obj.get('type') == 'x-mitre-data-component':
            data_source_ref = obj.get('x_mitre_data_source_ref')
            if not data_source_ref:
                continue

            data_source_obj = objects_by_id.get(data_source_ref)
            if not data_source_obj:
                warning_count += 1
                logger.warning(f"Data Source object not found for Data Component: {obj.get('id')} -> {data_source_ref}")
                continue

            data_source_label = get_label_from_type(data_source_obj.get('type'))
            data_component_label = get_label_from_type(obj.get('type'))

            data_source_node = graph.nodes.match(data_source_label, id=data_source_ref).first()
            data_component_node = graph.nodes.match(data_component_label, id=obj.get('id')).first()

            if data_source_node and data_component_node:
                try:
                    relationship = Relationship(data_component_node, 'BELONGS_TO', data_source_node)
                    graph.merge(relationship)
                    relationship_count += 1
                    logger.info(f"Created/merged relationship BELONGS_TO between Data Component {obj.get('id')} and Data Source {data_source_ref}")
                except Exception as e:
                    warning_count += 1
                    logger.error(f"Error creating relationship BELONGS_TO between Data Component {obj.get('id')} and Data Source {data_source_ref}: {e}")
            else:
                warning_count += 1
                logger.warning(f"Data Source or Data Component node not found in graph for relationship: {obj.get('id')} -> {data_source_ref}")

# Get all relationships
relationship_filter = Filter('type', '=', 'relationship')
relationships = stix_data.query([relationship_filter])

# Create relationships
create_relationships_from_stix(relationships)

# Create relationships between Data Sources and Data Components
create_data_source_component_relationships(all_stix_objects)

# Summary logging
logger.info(f"Total nodes created or merged: {node_count}")
logger.info(f"Total relationships created or merged: {relationship_count}")
logger.info(f"Total warnings: {warning_count}")
