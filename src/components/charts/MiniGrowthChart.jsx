import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../../contexts/ThemeContext';

const MiniGrowthChart = ({ data = [], className = '' }) => {
  const svgRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove();

      const margin = { top: 5, right: 5, bottom: 5, left: 5 };
      const width = 150 - margin.left - margin.right;
      const height = 60 - margin.top - margin.bottom;

      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Generate sample data if none provided or if data is empty
      const sampleData = data && data.length > 0 ? data : Array.from({ length: 30 }, (_, i) => ({
        x: i,
        y: 1000 + (Math.random() * 200 - 50) + (i * 15) // Upward trend with variation
      }));

      // Validate data
      if (!sampleData || sampleData.length < 2) {
        console.warn('MiniGrowthChart: Insufficient data points');
        return;
      }

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, sampleData.length - 1])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(sampleData, d => d.y))
      .range([height, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'growth-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', height);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.8);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.1);

    // Add area
    const area = d3
      .area()
      .x((d, i) => xScale(i))
      .y0(height)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Generate area path with error handling
    const areaPath = area(sampleData);
    if (areaPath && areaPath !== null) {
      g.append('path')
        .datum(sampleData)
        .attr('fill', 'url(#growth-gradient)')
        .attr('d', areaPath);
    }

    // Generate line path with error handling
    const linePath = line(sampleData);
    if (linePath && linePath !== null) {
      g.append('path')
        .datum(sampleData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('d', linePath);
    }

    // Add final dot
    const lastPoint = sampleData[sampleData.length - 1];
    if (lastPoint && lastPoint.y !== undefined) {
      g.append('circle')
        .attr('cx', xScale(sampleData.length - 1))
        .attr('cy', yScale(lastPoint.y))
        .attr('r', 3)
        .attr('fill', '#10b981');
    }
    } catch (error) {
      console.error('MiniGrowthChart: Error rendering chart', error);
    }

  }, [data, isDark]);

  return (
    <svg ref={svgRef} className={className}></svg>
  );
};

export default MiniGrowthChart;