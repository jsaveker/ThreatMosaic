// frontend/src/components/Graph.js

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Graph.css'; // Ensure this CSS file exists for additional styles

function Graph({ data, onNodeClick, loading, fetchRelatedNodes }) {
  const svgRef = useRef();

  useEffect(() => {
    if (loading) return;
  
    // Select the SVG element
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove(); 
  
    // Set dimensions based on container's size
    svg
      .attr('width', '100%')
      .attr('height', '100%');
  
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    // Apply zoom behavior to the SVG
    svg.call(zoom);

    // Wrap all graph elements in a group for zooming
    const container = svg.append('g');

    // Define arrowheads for directed relationships
    container.append('defs').selectAll('marker')
      .data(['arrow']) // Differentiate if multiple types needed
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', d => d.color || '#999') // Optionally use color from data
      .style('stroke-opacity', 0.6)
      .style('stroke-width', '1.5px')
      .attr('marker-end', 'url(#arrow)'); // Add arrowhead

    // Draw link labels
    const linkLabels = container.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(data.links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .text(d => d.relationship)
      .style('font-size', '10px')
      .style('fill', '#555')
      .style('pointer-events', 'none'); // Make labels non-interactive

    // Initialize D3 force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      linkLabels
        .attr('x', (d) => (d.source.x + d.target.x) / 2)
        .attr('y', (d) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });

    // Draw nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        switch (d.group) {
          case 'ThreatScenario':
            return '#ff7f0e';
          case 'Technique':
            return '#1f77b4';
          case 'SubTechnique':
            return '#aec7e8';
          case 'Campaign':
            return '#98df8a';
          case 'Tool':
            return '#ffbb78';
          case 'Tactic':
            return '#c5b0d5';
          case 'DataSource':
            return '#c49c94';
          case 'DataComponent':
            return '#f7b6d2';
          case 'Mitigation':
            return '#2ca02c';
          default:
            return '#ccc';
        }
      })
      .style('stroke', '#333')
      .style('stroke-width', '1.5px')
      .call(drag()) // Attach drag behavior
      .on('click', (event, d) => {
        console.log('Graph.js - Node clicked:', d);
        onNodeClick(d);
        fetchRelatedNodes(d);
      })
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`<strong>${d.group}</strong>: ${d.name}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add labels
    const label = container.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .text((d) => d.name)
      .style('font-size', '10px')
      .style('fill', '#555');

    // Define tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('text-align', 'left')
      .style('width', 'auto')
      .style('height', 'auto')
      .style('padding', '8px')
      .style('font', '12px sans-serif')
      .style('background', 'lightsteelblue')
      .style('border', '0px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      linkLabels
        .attr('x', (d) => (d.source.x + d.target.x) / 2)
        .attr('y', (d) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });

    // Drag functionality
    function drag() {
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

    // Clean up tooltip and stop simulation on component unmount
    return () => {
      tooltip.remove();
      simulation.stop();
    };
  }, [data, loading, onNodeClick, fetchRelatedNodes]);

  return (
    <div className="graph-container">
      {loading ? <p>Loading...</p> : null}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default Graph;