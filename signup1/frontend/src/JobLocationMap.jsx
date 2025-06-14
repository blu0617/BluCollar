// JobLocationMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const JobLocationMap = ({ lat, lng, name }) => {
    // Guard clause: don't render if coords are missing
    if (!lat || !lng) {
      return <div>📍 Map not available for this job</div>;
    }
  
    return (
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '200px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>{name}'s location</Popup>
        </Marker>
      </MapContainer>
    );
  };
  

  

export default JobLocationMap;
