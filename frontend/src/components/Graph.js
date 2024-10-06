import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function Graph({ data, onNodeClick, loading }) {
  const svgRef = useRef();

  useEffect(() => {
    if (loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = svg.attr('width') || 960;
    const height = svg.attr('height') || 600;

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link');

    // Draw nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => (d.group === 'ThreatScenario' ? '#ff7f0e' : '#1f77b4'))
      .call(drag(simulation))
      .on('click', (event, d) => {
        onNodeClick(d);
      });

    // Add labels
    const label = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .text((d) => d.name);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [data, loading, onNodeClick]);

  return (
    <div className="graph-container">
      {loading ? <p>Loading...</p> : null}
      <svg ref={svgRef} width="960" height="600"></svg>
    </div>
  );
}

export default Graph;