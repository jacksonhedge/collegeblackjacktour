import React, { useEffect, useRef } from 'react';

const SimpleCampusMap = ({ college, fraternities, landmarks }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    // Initialize map when component mounts and Google is available
    const initMap = () => {
      if (!window.google || !mapRef.current || !college) return;

      // Create the map
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: college.lat, lng: college.lng },
        zoom: 16,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        fullscreenControl: true,
      });

      // Add fraternity markers
      fraternities?.forEach((frat) => {
        const marker = new window.google.maps.Marker({
          position: { lat: frat.lat, lng: frat.lng },
          map: googleMapRef.current,
          title: frat.fullName || frat.name,
          label: {
            text: frat.name,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: frat.color || '#3b82f6',
            fillOpacity: 1,
            strokeColor: 'black',
            strokeWeight: 2,
          },
        });

        // Add click listener
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0;">${frat.fullName || frat.name}</h3>
              <p style="margin: 5px 0;">Members: ${frat.memberCount || 'N/A'}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
      });

      // Add landmark markers
      landmarks?.forEach((landmark) => {
        let iconConfig = {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 15,
          fillColor: landmark.color || '#ef4444',
          fillOpacity: 1,
          strokeColor: 'black',
          strokeWeight: 2,
          rotation: 180,
        };

        if (landmark.type === 'building') {
          iconConfig.path = window.google.maps.SymbolPath.CIRCLE;
          iconConfig.scale = 12;
          iconConfig.fillColor = landmark.color || '#6b7280';
        }

        const marker = new window.google.maps.Marker({
          position: { lat: landmark.lat, lng: landmark.lng },
          map: googleMapRef.current,
          title: landmark.name,
          icon: iconConfig,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0;">${landmark.name}</h3>
              ${landmark.description ? `<p style="margin: 5px 0;">${landmark.description}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
      });
    };

    // Try to initialize immediately if Google is loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Wait for Google Maps to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);

      // Clean up interval on unmount
      return () => clearInterval(checkGoogle);
    }
  }, [college, fraternities, landmarks]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default SimpleCampusMap;