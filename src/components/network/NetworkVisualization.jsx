import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkVisualization = ({
  graph,
  highlightUser,
  onNodeClick,
  width = 800,
  height = 600
}) => {
  const graphRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Platform colors
  const platformColors = {
    sleeper: '#FFB800', // Sleeper orange
    espn: '#CD1E00',    // ESPN red
    both: '#6B46C1'     // Purple for users on both platforms
  };

  const getNodeColor = (node) => {
    if (node.id === highlightUser) return '#00FF00';
    if (node.id === selectedNode) return '#00BFFF';
    if (node.group === 2) return platformColors.both;
    return node.group === 0 ? platformColors.sleeper : platformColors.espn;
  };

  const getLinkColor = (link) => {
    const opacity = hoveredNode ? 
      (link.source === hoveredNode || link.target === hoveredNode ? 0.8 : 0.1) : 0.3;
    return `rgba(150, 150, 150, ${opacity})`;
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node.id);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const paintNode = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    // Draw node circle
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fill();

    // Draw node label with background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y - bckgDimensions[1] / 2,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText(label, node.x, node.y);
  };

  const drawLinkLabel = (link, ctx, globalScale) => {
    if (!hoveredNode || (link.source.id !== hoveredNode && link.target.id !== hoveredNode)) {
      return;
    }

    const start = link.source;
    const end = link.target;
    const textPos = {
      x: start.x + (end.x - start.x) / 2,
      y: start.y + (end.y - start.y) / 2
    };

    const label = `${link.sharedLeagues.length} league${link.sharedLeagues.length > 1 ? 's' : ''}`;
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Background
    const padding = 2;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      textPos.x - textWidth / 2 - padding,
      textPos.y - fontSize / 2 - padding,
      textWidth + padding * 2,
      fontSize + padding * 2
    );
    
    // Text
    ctx.fillStyle = 'black';
    ctx.fillText(label, textPos.x, textPos.y);
  };

  return (
    <div className="network-visualization relative">
      <div className="legend flex gap-4 mb-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.sleeper }}></span>
          Sleeper
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.espn }}></span>
          ESPN
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.both }}></span>
          Both Platforms
        </span>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ForceGraph2D
          ref={graphRef}
          graphData={graph}
          nodeId="id"
          nodeLabel="name"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={getLinkColor}
          linkWidth={link => link.value}
          linkCanvasObjectMode={() => 'after'}
          linkCanvasObject={drawLinkLabel}
          onNodeClick={handleNodeClick}
          onNodeHover={(node) => setHoveredNode(node?.id || null)}
          width={width}
          height={height}
          backgroundColor="#f3f4f6"
        />
      </div>
      
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h4 className="font-semibold text-lg mb-2">
            {graph.nodes.find(n => n.id === selectedNode)?.name}
          </h4>
          <p className="text-sm text-gray-600">
            Leagues: {graph.nodes.find(n => n.id === selectedNode)?.leagues.length}
          </p>
          <p className="text-sm text-gray-600">
            Connections: {graph.links.filter(l => 
              l.source === selectedNode || l.target === selectedNode
            ).length}
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;