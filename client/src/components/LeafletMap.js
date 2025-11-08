import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Add custom CSS for div icons
const customIconStyles = `
  .custom-div-icon {
    background: transparent !important;
    border: none !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customIconStyles;
  document.head.appendChild(style);
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createCustomIcon = (color = '#007bff') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Default icon for regular markers
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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

const LeafletMap = ({ 
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
        key={`map-${markers.length}`}
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
        
        {/* Markers */}
        {markers.map((marker, index) => {
          const markerIcon = marker.color ? createCustomIcon(marker.color) : defaultIcon;
          return (
            <Marker
              key={`marker-${index}-${marker.position.lat}-${marker.position.lng}`}
              position={[marker.position.lat, marker.position.lng]}
              icon={markerIcon}
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
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
