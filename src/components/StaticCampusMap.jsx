import React, { useState } from 'react';

const StaticCampusMap = ({ college, fraternities, landmarks }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Campus images for each college
  const campusImages = {
    '1': 'https://www.uconn.edu/content/uploads/2023/08/20210910_aerials_007-scaled.jpg', // UConn
    '2': 'https://www.utexas.edu/sites/default/files/styles/utexas_hero_photo_image/public/2020-08/campus-aerial-hero.jpg', // UT Austin
    '3': 'https://lsa.umich.edu/content/dam/rll-assets/rll-images/About%20Images/aerial.jpg', // Michigan
    '4': 'https://news.stanford.edu/wp-content/uploads/2018/12/campus-aerial.jpg', // Stanford
  };

  if (!college) return null;

  // Convert lat/lng to percentage positions on image
  const getPosition = (lat, lng, baseLat, baseLng) => {
    // Simple conversion - in real app, would need proper scaling
    const latDiff = (lat - baseLat) * 1000;
    const lngDiff = (lng - baseLng) * 1000;
    return {
      top: `${50 - latDiff}%`,
      left: `${50 + lngDiff}%`,
    };
  };

  return (
    <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
      {/* Campus Image */}
      <img 
        src={campusImages[college.id] || campusImages['1']} 
        alt={`${college.name} campus`}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay for better marker visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Fraternity Markers */}
      {fraternities?.map((frat, index) => {
        const position = getPosition(frat.lat, frat.lng, college.lat, college.lng);
        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={position}
            onMouseEnter={() => setHoveredItem(frat)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setSelectedItem(frat)}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-black"
              style={{ backgroundColor: frat.color || '#3b82f6' }}
            >
              {frat.name}
            </div>
          </div>
        );
      })}

      {/* Landmark Markers */}
      {landmarks?.map((landmark, index) => {
        const position = getPosition(landmark.lat, landmark.lng, college.lat, college.lng);
        return (
          <div
            key={`landmark-${index}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={position}
            onMouseEnter={() => setHoveredItem(landmark)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setSelectedItem(landmark)}
          >
            {landmark.type === 'flag' ? (
              <div className="relative">
                <div className="w-1 h-8 bg-gray-800" />
                <div 
                  className="absolute top-0 left-0 w-6 h-4"
                  style={{ backgroundColor: landmark.color || '#ef4444' }}
                />
              </div>
            ) : (
              <div 
                className="w-8 h-8 rounded-sm flex items-center justify-center shadow-lg border-2 border-black"
                style={{ backgroundColor: landmark.color || '#6b7280' }}
              >
                🏛️
              </div>
            )}
          </div>
        );
      })}

      {/* Hover Tooltip */}
      {hoveredItem && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-xl max-w-xs">
          <h3 className="font-bold text-sm">{hoveredItem.fullName || hoveredItem.name}</h3>
          {hoveredItem.memberCount && (
            <p className="text-xs text-gray-600 mt-1">Members: {hoveredItem.memberCount}</p>
          )}
          {hoveredItem.description && (
            <p className="text-xs text-gray-600 mt-1">{hoveredItem.description}</p>
          )}
        </div>
      )}

      {/* Selected Item Modal */}
      {selectedItem && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{selectedItem.fullName || selectedItem.name}</h2>
            {selectedItem.memberCount && (
              <p className="text-gray-600 mb-2">Members: {selectedItem.memberCount}</p>
            )}
            {selectedItem.description && (
              <p className="text-gray-600">{selectedItem.description}</p>
            )}
            <button 
              onClick={() => setSelectedItem(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticCampusMap;