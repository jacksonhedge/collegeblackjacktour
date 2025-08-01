import React, { useState, useRef, useEffect } from 'react';

const CollegeMap = ({ colleges, onCollegeClick, loading = false }) => {
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
        <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
          {/* US Map Background */}
          <rect
            className="map-background"
            x="0"
            y="0"
            width="1200"
            height="600"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="2"
          />
          
          {/* Simplified US Map Outline */}
          <g className="states">
            <path
              d="M 150 250 C 150 200, 200 150, 300 150 L 900 150 C 1000 150, 1050 170, 1100 200 L 1100 250 L 1050 280 L 1100 320 L 1100 400 C 1100 450, 1050 480, 1000 480 L 900 500 L 800 520 L 700 500 L 600 520 L 500 500 L 400 480 L 300 450 C 200 450, 150 400, 150 350 Z"
              fill="#f3f4f6"
              stroke="#6b7280"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* Florida */}
            <path
              d="M 900 480 L 920 520 L 900 550 L 880 520 Z"
              fill="#f3f4f6"
              stroke="#6b7280"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* Texas */}
            <path
              d="M 500 400 L 600 400 L 650 450 L 600 500 L 500 500 L 450 450 Z"
              fill="#f3f4f6"
              stroke="#6b7280"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* California */}
            <path
              d="M 100 200 L 150 250 L 150 350 L 100 400 L 80 350 L 80 250 Z"
              fill="#f3f4f6"
              stroke="#6b7280"
              strokeWidth="1"
              opacity="0.8"
            />
          </g>

          {/* College Markers */}
          {colleges.map((college) => (
            <g key={college.id}>
              <circle
                cx={college.coordinates.x}
                cy={college.coordinates.y}
                r="20"
                fill="white"
                stroke="#3b82f6"
                strokeWidth="2"
                className="cursor-pointer hover:stroke-blue-700 transition-colors"
                onMouseEnter={() => setHoveredCollege(college)}
                onMouseLeave={() => setHoveredCollege(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCollegeClick?.(college);
                }}
              />
              {college.logoUrl ? (
                <image
                  x={college.coordinates.x - 15}
                  y={college.coordinates.y - 15}
                  width="30"
                  height="30"
                  href={college.logoUrl}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  className="pointer-events-none"
                />
              ) : (
                <text
                  x={college.coordinates.x}
                  y={college.coordinates.y + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#3b82f6"
                  className="pointer-events-none"
                >
                  {college.name.substring(0, 3).toUpperCase()}
                </text>
              )}
            </g>
          ))}
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