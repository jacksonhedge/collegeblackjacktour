import React, { useEffect, useRef } from 'react';

const CampusMap = ({ college, fraternities, landmarks = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // This will only run when Google Maps is available
    if (window.google && mapRef.current && college) {
      // Initialize map with marker library
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: college.lat, lng: college.lng },
        zoom: 16,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        mapId: 'CAMPUS_MAP_ID' // Required for AdvancedMarkerElement
      });

      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null); // Regular marker
        } else if (marker.map) {
          marker.map = null; // AdvancedMarkerElement
        }
      });
      markersRef.current = [];

      // Add fraternity markers
      fraternities?.forEach(async (frat) => {
        // Check if AdvancedMarkerElement is available
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Create custom marker content
          const markerContent = document.createElement('div');
          markerContent.style.cssText = `
            background: ${frat.color || '#ef4444'};
            color: white;
            padding: 6px 10px;
            border-radius: 50%;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            white-space: nowrap;
            border: 2px solid white;
            min-width: 30px;
            min-height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          `;
          markerContent.textContent = frat.name;

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: frat.lat, lng: frat.lng },
            map: mapInstanceRef.current,
            content: markerContent,
            title: frat.fullName || frat.name,
          });

          // Add click listener
          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px;">${frat.fullName || frat.name}</h3>
                  <p style="margin: 5px 0; font-size: 14px;">Members: ${frat.memberCount || 'N/A'}</p>
                  ${frat.house ? `<p style="margin: 5px 0; font-size: 14px;">House: ${frat.house}</p>` : ''}
                </div>
              `
            });
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
        } else {
          // Fallback to regular marker
          const marker = new window.google.maps.Marker({
            position: { lat: frat.lat, lng: frat.lng },
            map: mapInstanceRef.current,
            label: {
              text: frat.name,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: frat.color || '#ef4444',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px;">${frat.name}</h3>
                  <p style="margin: 5px 0; font-size: 14px;">Members: ${frat.memberCount || 'N/A'}</p>
                  ${frat.house ? `<p style="margin: 5px 0; font-size: 14px;">House: ${frat.house}</p>` : ''}
                </div>
              `
            });
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
        }
      });

      // Add landmark/flag markers
      landmarks?.forEach(async (landmark) => {
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Create custom content for AdvancedMarkerElement
          const markerContent = document.createElement('div');
          
          if (landmark.type === 'flag') {
            markerContent.innerHTML = `
              <svg width="30" height="40" viewBox="0 0 30 40" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
                <rect x="2" y="0" width="2" height="40" fill="#333" />
                <path d="M 4,2 L 28,7 L 28,17 L 4,22 Z" fill="${landmark.color || '#ef4444'}" stroke="#000" stroke-width="1"/>
              </svg>
            `;
          } else if (landmark.type === 'building') {
            markerContent.innerHTML = `
              <svg width="30" height="30" viewBox="0 0 30 30" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
                <rect x="5" y="10" width="20" height="20" fill="${landmark.color || '#6b7280'}" stroke="#000" stroke-width="1"/>
                <polygon points="15,0 0,10 30,10" fill="${landmark.color || '#6b7280'}" stroke="#000" stroke-width="1"/>
                <rect x="12" y="20" width="6" height="10" fill="#333" />
              </svg>
            `;
          } else {
            markerContent.innerHTML = `
              <svg width="25" height="40" viewBox="0 0 25 40" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
                <path d="M 12.5,0 C 5.5,0 0,5.5 0,12.5 C 0,19.5 12.5,40 12.5,40 C 12.5,40 25,19.5 25,12.5 C 25,5.5 19.5,0 12.5,0 Z" 
                      fill="${landmark.color || '#3b82f6'}" stroke="#000" stroke-width="1"/>
                <circle cx="12.5" cy="12.5" r="4" fill="white"/>
              </svg>
            `;
          }

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: landmark.lat, lng: landmark.lng },
            map: mapInstanceRef.current,
            content: markerContent,
            title: landmark.name,
            zIndex: landmark.type === 'flag' ? 1000 : 100,
          });

          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; min-width: 150px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${landmark.name}</h3>
                  ${landmark.description ? `<p style="margin: 5px 0; font-size: 14px;">${landmark.description}</p>` : ''}
                  ${landmark.type ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">Type: ${landmark.type}</p>` : ''}
                </div>
              `
            });
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
        } else {
          // Fallback to regular markers
          let icon;
          
          if (landmark.type === 'flag') {
            icon = {
              path: 'M 0,0 L 0,-30 L 20,-25 L 20,-20 L 0,-15 Z',
              fillColor: landmark.color || '#ef4444',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1,
              anchor: new window.google.maps.Point(0, 0),
              scale: 1
            };
          } else if (landmark.type === 'building') {
            icon = {
              path: 'M -10,-10 L -10,10 L 10,10 L 10,-10 L 0,-20 Z',
              fillColor: landmark.color || '#6b7280',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1,
              anchor: new window.google.maps.Point(0, 10),
              scale: 1.2
            };
          } else {
            icon = {
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 8,
              fillColor: landmark.color || '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 2,
              anchor: new window.google.maps.Point(0, 8),
            };
          }

          const marker = new window.google.maps.Marker({
            position: { lat: landmark.lat, lng: landmark.lng },
            map: mapInstanceRef.current,
            title: landmark.name,
            icon: icon,
            zIndex: landmark.type === 'flag' ? 1000 : 100,
          });

          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; min-width: 150px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${landmark.name}</h3>
                  ${landmark.description ? `<p style="margin: 5px 0; font-size: 14px;">${landmark.description}</p>` : ''}
                  ${landmark.type ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">Type: ${landmark.type}</p>` : ''}
                </div>
              `
            });
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
        }
      });
    }
  }, [college, fraternities, landmarks]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!window.google && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600">Google Maps not loaded</p>
            <p className="text-sm text-gray-500 mt-2">Add your API key to enable maps</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusMap;

// Sample implementation for the main component:
/*
// In your main component, load Google Maps script:
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=marker&v=beta`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}, []);

// Sample fraternities data:
const fraternities = [
  {
    name: 'ΣΧ',
    fullName: 'Sigma Chi',
    lat: 41.8085,
    lng: -72.2535,
    memberCount: 145,
    house: 'Main House',
    color: '#3b82f6'
  },
  {
    name: 'ΦΚΨ',
    fullName: 'Phi Kappa Psi',
    lat: 41.8090,
    lng: -72.2545,
    memberCount: 112,
    house: 'Prestley Hall',
    color: '#ef4444'
  },
  // ... more fraternities
];
*/