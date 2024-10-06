import React from 'react';

function NodeDetails({ node }) {
  if (!node) {
    return (
      <div className="node-details">
        <p>Select a node to see details.</p>
      </div>
    );
  }

  return (
    <div className="node-details">
      <h2>Node Details</h2>
      <p><strong>Name:</strong> {node.name}</p>
      <p><strong>Type:</strong> {node.group}</p>
      {/* Add more details as needed */}
    </div>
  );
}

export default NodeDetails;