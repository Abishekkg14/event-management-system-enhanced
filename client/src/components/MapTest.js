import React, { useState } from 'react';
import SimpleLeafletMap from './SimpleLeafletMap';

const MapTest = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapStatus, setMapStatus] = useState('Loading...');

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location);
    setSelectedLocation(location);
  };

  // Check Leaflet status
  React.useEffect(() => {
    const checkLeaflet = () => {
      if (window.L) {
        setMapStatus('Leaflet loaded successfully');
      } else {
        setMapStatus('Leaflet not loaded');
      }
    };

    checkLeaflet();
    const interval = setInterval(checkLeaflet, 1000);
    return () => clearInterval(interval);
  }, []);

  const center = [39.8283, -98.5795]; // Leaflet uses [lat, lng] format
  const zoom = 4;

  const testMarkers = [
    {
      position: { lat: 40.7128, lng: -74.0060 },
      title: 'New York',
      infoWindow: '<div><h6>New York</h6><p>Test marker</p></div>'
    },
    {
      position: { lat: 34.0522, lng: -118.2437 },
      title: 'Los Angeles',
      infoWindow: '<div><h6>Los Angeles</h6><p>Test marker</p></div>'
    }
  ];

  return (
    <div className="container mt-4">
      <h3>Leaflet Map Test</h3>
      <div className="row">
        <div className="col-md-8">
          <SimpleLeafletMap
            center={center}
            zoom={zoom}
            markers={testMarkers}
            onLocationSelect={handleLocationSelect}
            height="400px"
          />
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Map Info</h5>
            </div>
            <div className="card-body">
              <p><strong>API Status:</strong> <span className={mapStatus.includes('successfully') ? 'text-success' : 'text-warning'}>{mapStatus}</span></p>
              <p><strong>Markers:</strong> {testMarkers.length}</p>
              <p><strong>Center:</strong> {center[0].toFixed(2)}, {center[1].toFixed(2)}</p>
              <p><strong>Zoom:</strong> {zoom}</p>
              {selectedLocation && (
                <div className="mt-3">
                  <p><strong>Selected Location:</strong></p>
                  <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
                  <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
                </div>
              )}
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Debug Info:</strong><br/>
                  Leaflet: {window.L ? '✓' : '✗'}<br/>
                  React Leaflet: {window.L ? '✓' : '✗'}<br/>
                  Map Container: {window.L ? '✓' : '✗'}
                </small>
              </div>
              <div className="mt-3">
                <div className="alert alert-success" role="alert">
                  <small>
                    <strong>Leaflet Benefits:</strong> Free, open-source, no API keys required, lightweight, and highly customizable!
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTest;
