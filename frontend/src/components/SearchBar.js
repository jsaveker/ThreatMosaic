// frontend/src/components/SearchBar.js

import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onToggleVisibility }) {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState([]);
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

  const nodeTypes = [
    { label: 'Threat Scenario', value: 'ThreatScenario' },
    { label: 'Technique', value: 'Technique' },
    { label: 'Sub Technique', value: 'SubTechnique' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Tool', value: 'Tool' },
    { label: 'Tactic', value: 'Tactic' },
    { label: 'Data Source', value: 'DataSource' },
    { label: 'Data Component', value: 'DataComponent' },
    { label: 'Mitigation', value: 'Mitigation' },
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

  const handleVisibilityChange = (type) => {
    const newVisibility = { ...visibility, [type]: !visibility[type] };
    setVisibility(newVisibility);
    onToggleVisibility(newVisibility);
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

      <div className="visibility-controls">
        <h4>Toggle Node Types</h4>
        {nodeTypes.map((type) => (
          <label key={type.value}>
            <input
              type="checkbox"
              checked={visibility[type.value]}
              onChange={() => handleVisibilityChange(type.value)}
            />
            {type.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;