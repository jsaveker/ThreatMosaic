import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './components/Graph';
import SearchBar from './components/SearchBar';
import NodeDetails from './components/NodeDetails';
import NewThreatForm from './components/NewThreatForm';
import './styles.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch initial graph data
  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/threat_scenarios');
      const data = transformData(response.data);
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
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
        links.push({ source: ts.id, target: technique.id });
      });
    });

    // Remove duplicate nodes
    const uniqueNodes = Array.from(new Map(nodes.map((node) => [node.id, node])).values());

    return { nodes: uniqueNodes, links };
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleSearch = async (query) => {
    if (!query) {
      fetchGraphData();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      const data = transformSearchData(response.data);
      setGraphData(data);
    } catch (error) {
      console.error('Error searching the graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformSearchData = (data) => {
    // Assuming data is an array of nodes
    return { nodes: data, links: [] };
  };

  const handleCreateThreat = async (threat) => {
    try {
      const response = await axios.post('/api/threat_scenarios', threat);
      // Update graph with new threat scenario
      setGraphData((prevData) => ({
        nodes: [...prevData.nodes, { id: response.data.id, name: response.data.name, group: 'ThreatScenario' }],
        links: prevData.links,
      }));
    } catch (error) {
      console.error('Error creating threat scenario:', error);
    }
  };

  return (
    <div className="App">
      <h1>Threat Detection Graph</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="content">
        <Graph data={graphData} onNodeClick={handleNodeClick} loading={loading} />
        <NodeDetails node={selectedNode} />
      </div>
      <NewThreatForm onCreate={handleCreateThreat} />
    </div>
  );
}

export default App;