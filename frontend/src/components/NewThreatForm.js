// frontend/src/components/NewThreatForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewThreatForm.css'; // Create this CSS file for styling

function NewThreatForm({ onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [relatedNodes, setRelatedNodes] = useState([]);
  const [availableNodes, setAvailableNodes] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    // Fetch all available nodes to associate with the new threat scenario
    const fetchAvailableNodes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
          params: { query: '', type: ['Technique', 'Tool', 'Tactic', 'DataSource', 'DataComponent'] },
        });
        if (isMounted) {
          setAvailableNodes(response.data);
        }
      } catch (error) {
        console.error('Error fetching available nodes:', error);
      }
    };

    fetchAvailableNodes();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('Name is required.');
      return;
    }

    let isMounted = true; // Flag to track if component is mounted

    try {
      // Create the new threat scenario
      const response = await axios.post(`${API_BASE_URL}/threat_scenarios`, { name, description });
      const newThreat = response.data;

      // Create relationships with selected related nodes
      if (relatedNodes.length > 0) {
        const relationshipPromises = relatedNodes.map((nodeId) =>
          axios.post(`${API_BASE_URL}/create_relationship`, {
            sourceId: newThreat.id,
            targetId: nodeId,
            relationship: 'USES_TECHNIQUE', // Adjust relationship type as needed
          })
        );
        await Promise.all(relationshipPromises);
      }

      if (isMounted) {
        // Notify the parent component
        onCreate({ ...newThreat, relatedNodes });

        // Reset form fields
        setName('');
        setDescription('');
        setRelatedNodes([]);
      }
    } catch (error) {
      console.error('Error creating threat scenario:', error);
      if (isMounted) {
        alert('Failed to create threat scenario.');
      }
    }

    // No need for cleanup here since it's a one-time operation
  };

  const handleRelatedNodesChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setRelatedNodes(selected);
  };

  return (
    <div className="new-threat-form">
      <h2>Create New Threat Scenario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="threat-name">Name:</label>
          <input
            type="text"
            id="threat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="threat-description">Description:</label>
          <textarea
            id="threat-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="related-nodes">Associate with:</label>
          <select
            id="related-nodes"
            multiple
            value={relatedNodes}
            onChange={handleRelatedNodesChange}
          >
            {availableNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name} ({node.labels.join(', ')})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create Threat Scenario</button>
      </form>
    </div>
  );
}

export default NewThreatForm;