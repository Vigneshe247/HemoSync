import React, { useEffect, useRef } from 'react';

export default function MapTab({ donors = [], requests = [], hospitals = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center on Madurai / Tamil Nadu (or India)
    const map = window.L.map(mapRef.current).setView([10.8505, 78.6924], 7);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add Donors markers (Green)
    donors.forEach(donor => {
      if (donor.lat && donor.lng) {
        const marker = window.L.circleMarker([donor.lat, donor.lng], {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #10b981;">🟢 Available Donor</strong><br/>
            <strong>${donor.name}</strong> (${donor.bloodGroup})<br/>
            <span>${donor.city}, ${donor.state}</span>
          </div>
        `);
      }
    });

    // Add Requests markers (Red)
    requests.forEach(req => {
      if (req.lat && req.lng) {
        const marker = window.L.circleMarker([req.lat, req.lng], {
          radius: 10,
          fillColor: '#c1121f',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #c1121f;">🚨 Emergency Request</strong><br/>
            <strong>${req.patientName} (${req.bloodGroup})</strong><br/>
            <span>${req.hospitalName}</span><br/>
            <span>Units Needed: ${req.unitsRequired}</span>
          </div>
        `);
      }
    });

    // Add Hospitals markers (Blue)
    hospitals.forEach(hosp => {
      if (hosp.lat && hosp.lng) {
        const marker = window.L.circleMarker([hosp.lat, hosp.lng], {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #3b82f6;">🏥 Hospital / Blood Bank</strong><br/>
            <strong>${hosp.name}</strong><br/>
            <span>${hosp.city}, ${hosp.state}</span>
          </div>
        `);
      }
    });

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [donors, requests, hospitals]);

  return (
    <div id="view-map" className="tab-view active" style={{ display: 'block' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Live Geospatial Matching</h2>
      <div className="map-wrapper" style={{ position: 'relative' }}>
        <div id="map-container" ref={mapRef} style={{ width: '100%', height: '520px', borderRadius: '16px' }} />

        {/* Map Legend */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-dot donor"></div> Available Donors
          </div>
          <div className="legend-item">
            <div className="legend-dot request"></div> Emergency Requests
          </div>
          <div className="legend-item">
            <div className="legend-dot hospital"></div> Hospitals
          </div>
        </div>
      </div>
    </div>
  );
}
