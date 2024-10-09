// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './components/Graph';
import SearchBar from './components/SearchBar';
import Legend from './components/Legend';
import NodeDetails from './components/NodeDetails';
import NewThreatForm from './components/NewThreatForm';
import './styles.css';

function App() {
  // State to hold graph data (nodes and links)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // State to hold the currently selected node for details view
  const [selectedNode, setSelectedNode] = useState(null);

  // State to manage loading state for asynchronous operations
  const [loading, setLoading] = useState(false);

  // Base URL for the backend API
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

  // Fetch initial graph data on component mount
  useEffect(() => {
    fetchGraphData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch initial threat scenarios and their techniques
  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/threat_scenarios`);
      const data = transformData(response.data);
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      alert('Failed to fetch graph data.');
    } finally {
      setLoading(false);
    }
  };

  // Function to transform backend data into nodes and links
  const transformData = (data) => {
    const nodes = [];
    const links = [];

    data.forEach((ts) => {
      // Add Threat Scenario node
      nodes.push({ id: ts.id, name: ts.name, group: 'ThreatScenario' });

      ts.techniques.forEach((technique) => {
        // Add Technique node
        nodes.push({ id: technique.id, name: technique.name, group: 'Technique' });

        // Add link between Threat Scenario and Technique with relationship type
        links.push({
          source: ts.id,
          target: technique.id,
          relationship: 'USES_TECHNIQUE',
        });
      });
    });

    // Remove duplicate nodes by creating a Map with node IDs as keys
    const uniqueNodes = Array.from(new Map(nodes.map((node) => [node.id, node])).values());

    return { nodes: uniqueNodes, links };
  };

  // Handler for node click events
  const handleNodeClick = (node) => {
    console.log('App.js - Node clicked:', node);
    setSelectedNode(node);
  };

  // Handler for search functionality
  const handleSearch = async (query, types) => {
    if (!query) {
      // If query is empty, fetch the initial graph data
      fetchGraphData();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { query, type: types },
      });
      const data = transformSearchData(response.data);
      setGraphData(data);
    } catch (error) {
      console.error('Error searching the graph:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to transform search results into nodes (no links)
  const transformSearchData = (data) => {
    const nodes = data.map((node) => ({
      id: node.id,
      name: node.name,
      group: node.labels[0], // Assuming first label is the type
    }));
    // No links are returned in search results; you can extend this if needed
    return { nodes, links: [] };
  };

  // Handler for creating a new threat scenario
  const handleCreateThreat = async (threat) => {
    try {
      // Create the new threat scenario
      const response = await axios.post(`${API_BASE_URL}/threat_scenarios`, {
        name: threat.name,
        description: threat.description,
      });
      const newThreat = response.data;

      // Add the new Threat Scenario node to the graph
      setGraphData((prevData) => ({
        nodes: [
          ...prevData.nodes,
          { id: newThreat.id, name: newThreat.name, group: 'ThreatScenario' },
        ],
        links: prevData.links,
      }));

      // If there are related nodes to associate, create relationships
      if (threat.relatedNodes && threat.relatedNodes.length > 0) {
        // Create relationships for each selected related node
        const relationshipPromises = threat.relatedNodes.map((nodeId) =>
          axios.post(`${API_BASE_URL}/create_relationship`, {
            sourceId: newThreat.id,
            targetId: nodeId,
            relationship: 'USES_TECHNIQUE', // Adjust relationship type as needed
          })
        );

        // Wait for all relationship creations to complete
        await Promise.all(relationshipPromises);

        // Fetch related nodes to update the graph with new links
        threat.relatedNodes.forEach((nodeId) => {
          handleFetchRelatedNodes({ id: newThreat.id });
        });
      }

      alert('Threat Scenario created successfully!');
    } catch (error) {
      console.error('Error creating threat scenario:', error);
      alert('Failed to create Threat Scenario.');
    }
  };

  // Handler to fetch and display related nodes when a node is clicked
  const handleFetchRelatedNodes = async (node) => {
    // Prevent refetching if the node has already been expanded
    if (node.expanded) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/related_nodes`, {
        params: { nodeId: node.id },
      });

      const relatedNodes = response.data.nodes;
      const relatedLinks = response.data.links;

      setGraphData((prevData) => {
        const newNodes = [...prevData.nodes];
        const newLinks = [...prevData.links];

        // Add new related nodes if they don't already exist
        relatedNodes.forEach((relatedNode) => {
          if (!newNodes.find((n) => n.id === relatedNode.id)) {
            newNodes.push({
              id: relatedNode.id,
              name: relatedNode.name,
              group: relatedNode.labels[0], // Assuming first label is the type
              description: relatedNode.description || '', // Add description if available
            });
          }
        });

        // Add new links if they don't already exist
        relatedLinks.forEach((link) => {
          if (
            !newLinks.find(
              (l) => l.source === link.source && l.target === link.target
            )
          ) {
            newLinks.push({
              source: link.source,
              target: link.target,
              relationship: link.relationship,
            });
          }
        });

        return { nodes: newNodes, links: newLinks };
      });

      // Mark the node as expanded to prevent future refetching
      setGraphData((prevData) => ({
        nodes: prevData.nodes.map((n) =>
          n.id === node.id ? { ...n, expanded: true } : n
        ),
        links: prevData.links,
      }));
    } catch (error) {
      console.error('Error fetching related nodes:', error);
      alert('Failed to fetch related nodes.');
    }
  };

  return (
    <div className="App">
      <h1>Threat Mosaic - Graph</h1>
      <SearchBar onSearch={handleSearch} />
      <Legend />
      <div className="content">
        <div className="graph-container">
          <Graph
            data={graphData}
            onNodeClick={handleNodeClick}
            loading={loading}
            fetchRelatedNodes={handleFetchRelatedNodes}
          />
        </div>
        <div className="node-details-and-form">
          <div className="node-details-container">
            {selectedNode ? (
              <NodeDetails node={selectedNode} />
            ) : (
              <p>Select a node to see details</p>
            )}
          </div>
          <div className="create-threat-form-container">
            <NewThreatForm onCreate={handleCreateThreat} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;