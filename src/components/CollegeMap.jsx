import React, { useState, useRef, useEffect } from 'react';

// Color palette for colleges
const collegeColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

const CollegeMap = ({ colleges, onCollegeClick, loading = false, selectedState = null, stateMapData = {} }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCollege, setHoveredCollege] = useState(null);
  const svgRef = useRef(null);

  // Handle zoom
  const handleZoom = (delta) => {
    setScale((prevScale) => Math.max(0.5, Math.min(3, prevScale + delta)));
  };

  // Handle drag
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.classList.contains('map-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  // Reset view
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Calculate statistics
  const totalColleges = colleges.length;
  const totalFraternities = colleges.reduce((sum, college) => sum + college.fraternities.length, 0);
  const avgFraternitySize = totalFraternities > 0
    ? Math.round(colleges.reduce((sum, college) => 
        sum + college.fraternities.reduce((fSum, frat) => fSum + frat.memberCount, 0), 0
      ) / totalFraternities)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Statistics Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="text-lg font-semibold mb-2">Statistics</h3>
        <div className="space-y-1 text-sm">
          <p>Total Colleges: <span className="font-bold">{totalColleges}</span></p>
          <p>Total Fraternities: <span className="font-bold">{totalFraternities}</span></p>
          <p>Avg Fraternity Size: <span className="font-bold">{avgFraternitySize}</span></p>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10 space-y-2">
        <button
          onClick={() => handleZoom(0.2)}
          className="w-10 h-10 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="w-10 h-10 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
        >
          ⟲
        </button>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 600"
        className="cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* SVG Filter Definitions */}
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
          {/* Map Background Image - US or State */}
          {selectedState && stateMapData[selectedState] ? (
            <image
              href={stateMapData[selectedState].imageUrl}
              x={stateMapData[selectedState].bounds.x}
              y={stateMapData[selectedState].bounds.y}
              width={stateMapData[selectedState].bounds.width}
              height={stateMapData[selectedState].bounds.height}
              opacity="0.3"
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <>
              <rect x="0" y="0" width="1200" height="600" fill="white" stroke="black" strokeWidth="3" />
              <image
                href="https://simplemaps.com/static/svg/us/us.svg"
                x="50"
                y="50"
                width="1100"
                height="500"
                opacity="1"
                preserveAspectRatio="xMidYMid meet"
              />
            </>
          )}

          {/* College Markers */}
          {colleges.map((college, index) => {
            // Use consistent color based on college name or index
            const colorIndex = college.name ? 
              college.name.charCodeAt(0) % collegeColors.length : 
              index % collegeColors.length;
            const color = collegeColors[colorIndex];
            
            return (
              <circle
                key={college.id}
                cx={college.coordinates.x}
                cy={college.coordinates.y}
                r={hoveredCollege?.id === college.id ? "12" : "8"}
                fill={color}
                fillOpacity="1"
                stroke="black"
                strokeWidth={hoveredCollege?.id === college.id ? "2.5" : "2"}
                className="cursor-pointer transition-all"
                filter={hoveredCollege?.id === college.id ? "url(#dropShadow)" : "none"}
                onMouseEnter={() => setHoveredCollege(college)}
                onMouseLeave={() => setHoveredCollege(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCollegeClick?.(college);
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredCollege && (
        <div
          className="absolute bg-white rounded-lg shadow-xl p-4 z-20 pointer-events-none"
          style={{
            left: `${(hoveredCollege.coordinates.x * scale) + position.x + 30}px`,
            top: `${(hoveredCollege.coordinates.y * scale) + position.y - 20}px`,
            maxWidth: '300px',
          }}
        >
          <h4 className="font-bold text-lg mb-1">{hoveredCollege.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{hoveredCollege.location}</p>
          <div className="border-t pt-2">
            <p className="text-sm font-semibold mb-1">
              Fraternities ({hoveredCollege.fraternities.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {hoveredCollege.fraternities.map((frat, index) => (
                <div key={index} className="text-xs flex justify-between">
                  <span>{frat.name}</span>
                  <span className="text-gray-600">{frat.memberCount} members</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeMap;