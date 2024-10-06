import React, { useState } from 'react';

function NewThreatForm({ onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name) {
      alert('Name is required.');
      return;
    }
    onCreate({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <div className="new-threat-form">
      <h2>Create New Threat Scenario</h2>
      <input
        type="text"
        placeholder="Threat Scenario Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea><br />
      <button onClick={handleSubmit}>Create Threat Scenario</button>
    </div>
  );
}

export default NewThreatForm;