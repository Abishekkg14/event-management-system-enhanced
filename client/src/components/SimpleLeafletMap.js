import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });
  return null;
};

const SimpleLeafletMap = ({ 
  center = [40.7128, -74.0060], 
  zoom = 10, 
  markers = [], 
  onLocationSelect,
  height = '400px',
  className = '',
  showControls = true
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mapLoaded) {
    return (
      <div 
        style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }} 
        className={className}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading map...</span>
          </div>
          <p className="mt-2 text-muted">Loading Leaflet Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showControls}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map click handler */}
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {/* Markers - using default icons only */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={[marker.position.lat, marker.position.lng]}
          >
            {marker.infoWindow && (
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: marker.infoWindow }} />
              </Popup>
            )}
            {marker.title && !marker.infoWindow && (
              <Popup>
                <div>
                  <h6>{marker.title}</h6>
                  {marker.description && <p>{marker.description}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleLeafletMap;
