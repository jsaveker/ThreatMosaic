// frontend/src/App.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Graph from './components/Graph';
import SearchBar from './components/SearchBar';
import Legend from './components/Legend';
import NodeDetails from './components/NodeDetails';
import NewThreatForm from './components/NewThreatForm';
import './styles.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [filteredData, setFilteredData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar toggle state
  const [visibility, setVisibility] = useState({
    ThreatScenario: true,
    Technique: true,
    SubTechnique: true,
    Campaign: true,
    Tool: true,
    Tactic: true,
    DataSource: true,
    DataComponent: true,
    Mitigation: true,
  });
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/threat_scenarios`);
      const data = transformData(response.data);
      setGraphData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      alert('Failed to fetch graph data.');
    } finally {
      setLoading(false);
    }
  };

  const transformData = (data) => {
    const nodes = [];
    const links = [];
    data.forEach((ts) => {
      nodes.push({ id: ts.id, name: ts.name, group: 'ThreatScenario' });
      ts.techniques.forEach((technique) => {
        nodes.push({ id: technique.id, name: technique.name, group: 'Technique' });
        links.push({
          source: ts.id,
          target: technique.id,
          relationship: 'USES_TECHNIQUE',
        });
      });
    });
    const uniqueNodes = Array.from(new Map(nodes.map((node) => [node.id, node])).values());
    return { nodes: uniqueNodes, links };
  };

  const fetchRelatedNodes = async (nodeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/related_nodes`, {
        params: { nodeId },
      });
  
      const newNodes = response.data?.nodes || []; // Fallback to empty array if undefined
      const newLinks = response.data?.links || []; // Fallback to empty array if undefined
  
      // Only update graphData and filteredData if new nodes or links were fetched
      if (newNodes.length > 0 || newLinks.length > 0) {
        setGraphData((prevData) => ({
          nodes: [
            ...prevData.nodes,
            ...newNodes.filter((n) => !prevData.nodes.some((p) => p.id === n.id)),
          ],
          links: [
            ...prevData.links,
            ...newLinks.filter(
              (l) => !prevData.links.some((p) => p.source === l.source && p.target === l.target)
            ),
          ],
        }));
  
        // Apply the visibility filter immediately to update filteredData
        applyVisibilityFilter(newNodes, newLinks);
      }
    } catch (error) {
      console.error('Error fetching related nodes:', error);
    }
  };

  const applyVisibilityFilter = (newNodes = [], newLinks = []) => {
    const filteredNodes = newNodes.filter((node) => visibility[node.group]);
    const filteredLinks = newLinks.filter((link) =>
      filteredNodes.some((node) => node.id === link.source || node.id === link.target)
    );
  
    setFilteredData((prevData) => ({
      nodes: [...(prevData?.nodes || []), ...filteredNodes],
      links: [...(prevData?.links || []), ...filteredLinks],
    }));
  };

  const handleSearch = async (query, types) => {
    if (!query) {
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
      setFilteredData(data);
    } catch (error) {
      console.error('Error searching the graph:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const transformSearchData = (data) => {
    const nodes = data.map((node) => ({
      id: node.id,
      name: node.name,
      group: node.labels[0],
    }));
    return { nodes, links: [] };
  };

  const handleCreateThreat = async (threat) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/threat_scenarios`, {
        name: threat.name,
        description: threat.description,
      });
      const newThreat = response.data;

      setGraphData((prevData) => ({
        nodes: [...prevData.nodes, { id: newThreat.id, name: newThreat.name, group: 'ThreatScenario' }],
        links: prevData.links,
      }));

      if (threat.relatedNodes && threat.relatedNodes.length > 0) {
        const relationshipPromises = threat.relatedNodes.map((nodeId) =>
          axios.post(`${API_BASE_URL}/create_relationship`, {
            sourceId: newThreat.id,
            targetId: nodeId,
            relationship: 'USES_TECHNIQUE',
          })
        );
        await Promise.all(relationshipPromises);

        threat.relatedNodes.forEach((nodeId) => {
          fetchRelatedNodes({ id: newThreat.id });
        });
      }

      alert('Threat Scenario created successfully!');
    } catch (error) {
      console.error('Error creating threat scenario:', error);
      alert('Failed to create Threat Scenario.');
    }
  };

  const toggleNodeVisibility = (newVisibility) => {
    setVisibility(newVisibility);
    const filteredNodes = graphData.nodes.filter((node) => newVisibility[node.group]);
    const filteredLinks = graphData.links.filter(
      (link) =>
        filteredNodes.some((node) => node.id === link.source) &&
        filteredNodes.some((node) => node.id === link.target)
    );
    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  };

  return (
    <div className="App">
      <h1>Threat Mosaic - Graph</h1>
      <SearchBar onSearch={handleSearch} onToggleVisibility={toggleNodeVisibility} />
      <Legend />
      <button onClick={() => setShowSidebar((prev) => !prev)} className="toggle-sidebar-btn">
        {showSidebar ? 'Hide Details' : 'Show Details'}
      </button>
      <div className="content">
        <div className="graph-container">
          <Graph
            data={filteredData}
            loading={loading}
            fetchRelatedNodes={fetchRelatedNodes}
          />
        </div>
        {showSidebar && (
          <div className="sidebar">
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
        )}
      </div>
    </div>
  );
}

export default App;