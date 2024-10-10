// frontend/src/components/Legend.js

import React from 'react';
import './Legend.css'; // Create this CSS file for legend styles

function Legend() {
  const nodeTypes = [
    { color: '#ff7f0e', label: 'Threat Scenario' },
    { color: '#1f77b4', label: 'Technique' },
    { color: '#aec7e8', label: 'Sub Technique' },
    { color: '#98df8a', label: 'Campaign' },
    { color: '#ffbb78', label: 'Tool' },
    { color: '#c5b0d5', label: 'Tactic' },
    { color: '#c49c94', label: 'Data Source' },
    { color: '#f7b6d2', label: 'Data Component' },
    { color: '#2ca02c', label: 'Mitigation' },
    { color: '#2ca02c', label: 'Detection' },
    // Add more node types as needed
  ];

  const relationshipTypes = [
    { color: '#999', label: 'USES_TECHNIQUE', style: 'solid' },
    { color: '#2ca02c', label: 'MITIGATES', style: 'dashed' },
    // Add more relationship types as needed
  ];

  return (
    <div className="legend">
      <h3>Legend</h3>
      <div className="legend-section">
        <h4>Node Types</h4>
        <ul>
          {nodeTypes.map((type) => (
            <li key={type.label}>
              <span
                className="legend-color"
                style={{ backgroundColor: type.color }}
              ></span>
              {type.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="legend-section">
        <h4>Relationship Types</h4>
        <ul>
          {relationshipTypes.map((rel) => (
            <li key={rel.label}>
              <span
                className="legend-line"
                style={{
                  backgroundColor: rel.color,
                  borderBottom: `2px ${rel.style} ${rel.color}`,
                }}
              ></span>
              {rel.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Legend;