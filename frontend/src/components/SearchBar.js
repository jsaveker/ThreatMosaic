// frontend/src/components/SearchBar.js

import React, { useState } from 'react';
import './SearchBar.css'; // Create this CSS file for styling

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState([]);

  const nodeTypes = [
    { label: 'All Types', value: '' },
    { label: 'Threat Scenario', value: 'ThreatScenario' },
    { label: 'Technique', value: 'Technique' },
    { label: 'Sub Technique', value: 'SubTechnique' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Tool', value: 'Tool' },
    { label: 'Tactic', value: 'Tactic' },
    { label: 'Data Source', value: 'DataSource' },
    { label: 'Data Component', value: 'DataComponent' },
    { label: 'Mitigation', value: 'Mitigation' },
    // Add more node types as needed
  ];

  const handleSearch = () => {
    onSearch(query, types);
  };

  const handleReset = () => {
    setQuery('');
    setTypes([]);
    onSearch('', []);
  };

  const handleTypeChange = (e) => {
    const { options } = e.target;
    const selectedTypes = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        selectedTypes.push(options[i].value);
      }
    }
    setTypes(selectedTypes);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search nodes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select multiple value={types} onChange={handleTypeChange}>
        {nodeTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default SearchBar;