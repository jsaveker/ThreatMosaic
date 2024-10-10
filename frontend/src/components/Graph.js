// frontend/src/components/Graph.js

import React, { useRef, useEffect } from 'react';
import Cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './Graph.css';

Cytoscape.use(coseBilkent);
Cytoscape.use(popper);

function Graph({ data, loading, fetchRelatedNodes }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);

  const getColorForGroup = (group) => {
    const colorMap = {
      ThreatScenario: '#ff7f0e',
      Technique: '#1f77b4',
      SubTechnique: '#aec7e8',
      Campaign: '#98df8a',
      Tool: '#ffbb78',
      Tactic: '#c5b0d5',
      DataSource: '#c49c94',
      DataComponent: '#f7b6d2',
      Mitigation: '#2ca02c',
    };
    return colorMap[group] || '#666';
  };

  useEffect(() => {
    if (loading || !cyRef.current || !data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) return;

    if (!cyInstanceRef.current) {
      cyInstanceRef.current = Cytoscape({
        container: cyRef.current,
        elements: [
          ...data.nodes.map((node) => ({
            data: { id: node.id, label: node.name, group: node.group },
          })),
          ...data.links.map((link) => ({
            data: { source: link.source, target: link.target, label: link.relationship },
          })),
        ],
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'background-color': (ele) => getColorForGroup(ele.data('group')),
              width: '40px',
              height: '40px',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              color: '#333',
            },
          },
          {
            selector: 'edge',
            style: {
              label: 'data(label)',
              width: 1.5,
              'line-color': '#999',
              'target-arrow-color': '#666',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'font-size': '8px',
              color: '#333',
              'text-background-color': '#ffffff',
              'text-background-opacity': 1,
            },
          },
        ],
        layout: {
          name: 'cose-bilkent',
          animate: 'end',
          padding: 50,
          nodeRepulsion: 10000,
          idealEdgeLength: 100,
          edgeElasticity: 0.5,
        },
        maxZoom: 2,
        minZoom: 0.5,
        userZoomingEnabled: true,
        userPanningEnabled: true,
      });

      // Tooltip creation with tippy.js on mouse hover
      cyInstanceRef.current.nodes().forEach((node) => {
        const tooltip = tippy(document.createElement('div'), {
          content: `${node.data('group')}: ${node.data('label')}`,
          trigger: 'mouseenter',
          allowHTML: true,
          arrow: true,
          theme: 'light',
        });
        node.on('mouseover', () => tooltip.show());
        node.on('mouseout', () => tooltip.hide());
      });

      // Expanding nodes on double-click and re-running layout for readability
      cyInstanceRef.current.on('dblclick', 'node', async (event) => {
        const node = event.target;
        const nodeId = node.data('id');

        if (fetchRelatedNodes) {
          const relatedData = await fetchRelatedNodes(nodeId);

          const newNodes = relatedData?.nodes || [];  // Safeguard: Default to empty array if undefined
          const newLinks = relatedData?.links || [];  // Safeguard: Default to empty array if undefined

          cyInstanceRef.current.batch(() => {
            const expandedElements = [
              ...newNodes.map((n) => ({
                data: { id: n.id, label: n.name, group: n.group },
              })),
              ...newLinks.map((link) => ({
                data: { source: link.source, target: link.target, label: link.relationship },
              })),
            ];

            cyInstanceRef.current.add(expandedElements);

            // Set colors for newly expanded nodes
            newNodes.forEach((n) => {
              const expandedNode = cyInstanceRef.current.getElementById(n.id);
              expandedNode.style('background-color', getColorForGroup(n.group));
            });
          });

          // Re-run the layout to adjust spacing and prevent overlap
          cyInstanceRef.current.layout({
            name: 'cose-bilkent',
            animate: 'end',
            padding: 50,
            nodeRepulsion: 10000,
            idealEdgeLength: 120,
            edgeElasticity: 0.5,
          }).run();
        }
      });
    }

    return () => {
      if (cyInstanceRef.current) {
        cyInstanceRef.current.removeListener('dblclick', 'node');
        cyInstanceRef.current.destroy();
        cyInstanceRef.current = null;
      }
    };
  }, [data, loading, fetchRelatedNodes]);

  return (
    <div className="graph-container" style={{ backgroundColor: 'transparent' }}>
      {loading ? <p>Loading...</p> : null}
      <div ref={cyRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default Graph;