import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import './JobRequestForm.css';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 18.5204, // Pune default
  lng: 73.8567
};

const libraries = ['places'];

const GOOGLE_MAPS_API_KEY = 'AIzaSyDcEBM1lUnoyZBk0dH9M877_YyofV1rarI';

export default function JobRequestForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceType = queryParams.get('service');

  const [formData, setFormData] = useState({
    client_id: 1, // Placeholder client_id
    name: '',
    email: '',
    phone_number: '',
    date: '',
    address: '',
    timeSlot: '',
    serviceType: serviceType || 'maid',
    service_frequency: 'one-time',
    special_instructions: '',
    room_count: '',
    estimated_area: '',
    preferred_gender: 'no-preference',
    emergency_contact: '',
    problem_description: '',
    service_duration: '',
    total_amount: 0, // Default total_amount
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng
  });

  const [marker, setMarker] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDcEBM1lUnoyZBk0dH9M877_YyofV1rarI',
    libraries
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const onMapClick = useCallback((event) => {
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
    setFormData(prev => ({
      ...prev,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng()
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
  
    try {
      const response = await axios.post('http://localhost:8000/api/job-request', submitData);
      if (response.data && response.data.jobId) {
        toast.success('Job request created successfully!');
      } else {
        toast.error('Failed to create job request!');
      }
    } catch (error) {
      toast.error('Failed to create job request!');
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarker({ lat: latitude, lng: longitude });
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="logo-container">
          <div className="logo-dots">
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
          </div>
          <Link to="/" className="brand-name">BluCollar </Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <div className="services-dropdown">
            <span className="nav-link">Services</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="nav-buttons">
          <Link to="/login" className="header-btn header-btn-outline">Login</Link>
          <Link to="/signup" className="header-btn header-btn-solid">Get started</Link>
        </div>
      </header>

      <div className="request-form-wrapper">
        <div className="request-form-container">
          <div className="request-form-header">
            <h1>Request a Service</h1>
            <p>Tell us what you need and when you need it. We'll connect you with trusted local professionals.</p>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name*</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number*</label>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergency_contact"
                    placeholder="Emergency contact number"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Service Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Type*</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                  >
                    <option value="maid">Maid Service</option>
                    <option value="deep-cleaning">Deep Cleaning</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="kitchen">Kitchen Cleaning</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Frequency</label>
                  <select
                    name="service_frequency"
                    value={formData.service_frequency}
                    onChange={handleChange}
                  >
                    <option value="one-time">One-time Service</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Service Duration</label>
                  <select
                    name="service_duration"
                    value={formData.service_duration}
                    onChange={handleChange}
                  >
                    <option value="2-hours">2 Hours</option>
                    <option value="4-hours">4 Hours</option>
                    <option value="6-hours">6 Hours</option>
                    <option value="8-hours">8 Hours</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Gender</label>
                  <select
                    name="preferred_gender"
                    value={formData.preferred_gender}
                    onChange={handleChange}
                  >
                    <option value="no-preference">No Preference</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Location & Scheduling</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Address*</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Rooms</label>
                  <input
                    type="number"
                    name="room_count"
                    placeholder="Number of rooms"
                    value={formData.room_count}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Area (sq ft)</label>
                  <input
                    type="text"
                    name="estimated_area"
                    placeholder="Approximate area in sq ft"
                    value={formData.estimated_area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date*</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time*</label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="08:00 - 10:00 AM">08:00 - 10:00 AM</option>
                    <option value="10:00 - 12:00 PM">10:00 - 12:00 PM</option>
                    <option value="12:00 - 02:00 PM">12:00 - 02:00 PM</option>
                    <option value="02:00 - 04:00 PM">02:00 - 04:00 PM</option>
                    <option value="04:00 - 06:00 PM">04:00 - 06:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Amount*</label>
                  <input
                    type="number"
                    name="total_amount"
                    placeholder="Enter total amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Problem Description*</label>
                  <textarea
                    name="problem_description"
                    placeholder="Describe the job in detail..."
                    value={formData.problem_description}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  name="special_instructions"
                  placeholder="Any special instructions or requirements"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div>
              <label>Pick your location on the map</label>
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={marker}
                  zoom={15}
                  onClick={onMapClick}
                >
                  <Marker position={marker} />
                </GoogleMap>
              )}
              <div>
                <small>Selected Lat: {formData.latitude}, Lng: {formData.longitude}</small>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Book a Service
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}