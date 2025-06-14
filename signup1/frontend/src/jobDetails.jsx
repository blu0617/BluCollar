import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './jobDetails.css';
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '350px' };
const GOOGLE_MAPS_API_KEY = 'AIzaSyDcEBM1lUnoyZBk0dH9M877_YyofV1rarI';

function WorkerJobMap({ destinationAddress }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 });

  useEffect(() => {
    if (isLoaded && destinationAddress && window.google) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(origin);
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin,
              destination: destinationAddress,
              travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
              }
            }
          );
        });
      }
    }
  }, [isLoaded, destinationAddress]);

  return (
    <div className="job-details-map-section">
      <h3 className="map-section-title">Route to Customer</h3>
      <div className="job-details-map-container">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
          >
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

export default function JobDetailsWrapper() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/job-request/${id}`)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [id]);

  if (!job) return <div className="job-details-loading">Loading...</div>;

  return (
    <div className="job-details-main">
      <div className="job-details-card">
        <h2 className="job-details-title">Job Request</h2>
        <div className="job-details-info">
          <p><span className="job-details-label">Customer Name:</span> {job.name}</p>
          <p><span className="job-details-label">Address:</span> {job.address}</p>
          <p><span className="job-details-label">Service Type:</span> {job.serviceType}</p>
          <p><span className="job-details-label">Date:</span> {job.date}</p>
          <p><span className="job-details-label">Time Slot:</span> {job.timeSlot}</p>
          {/* Add more fields as needed */}
        </div>
        <button
          className="navigate-btn"
          onClick={() => openGoogleMaps(job.address)}
        >
          Open in Google Maps
        </button>
      </div>
      <WorkerJobMap destinationAddress={job.address} />
    </div>
  );
}

function openGoogleMaps(address) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  window.open(url, '_blank');
}
