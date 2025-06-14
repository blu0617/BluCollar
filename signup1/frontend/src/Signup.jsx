import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './signup.css';

import verifiedIcon from './assets/verified.png';
import scheduleIcon from './assets/schedule.png';
import distanceIcon from './assets/distance.png';
import flexibleIcon from './assets/event_available.png';

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnUrl = location.state?.returnUrl || '/job-request'; // Default to /job-request

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:6001/signup", {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        address: values.address,
        password: values.password
      });

      // Store token in localStorage (if provided by the backend)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      toast.success("✅ Account created successfully!");

      // Redirect to the return URL or default to /job-request
      navigate(returnUrl);
    } catch (error) {
      toast.error("❌ Signup failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <header className="header">
        <div className="logo-container">
          <div className="logo-dots">
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
          </div>
          <Link to="/" className="brand-name">BluCollar</Link>
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

        <Link to="/login" className="header-btn header-btn-outline">Login</Link>
      </header>

      <div className="signup-content">
        <div className="signup-left">
          <h1 className="signup-title">
            <span className="first-line">Your Trusted Team for</span>
            <span className="second-line">Seamless Home Services</span>
          </h1>
          <p className="signup-description">At BluCollar, we make daily life easier by connecting you with trusted maids, plumbers, and electricians—right when you need them.</p>
          
          <div className="highlights-list">
            <div className="highlight-item">
              <div className="check-icon">✔</div>
              <span>Background-verified service providers you can count on</span>
            </div>
            <div className="highlight-item">
              <div className="check-icon">✔</div>
              <span>Quick response times with flexible appointments</span>
            </div>
            <div className="highlight-item">
              <div className="check-icon">✔</div>
              <span>Transparent pricing, no hidden charges</span>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="signup-form-container">
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={values.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={values.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@email.com"
                  value={values.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(414) 804 - 987"
                  value={values.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Address"
                  value={values.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="get-started-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="features-section">
        <div className="features-container">
          <div className="feature">
            <div className="feature-icon">
              <img src={verifiedIcon} alt="Satisfaction Guarantee" />
            </div>
            <span className="feature-text">Satisfaction Guarantee</span>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={scheduleIcon} alt="24H Availability" />
            </div>
            <span className="feature-text">24H Availability</span>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={distanceIcon} alt="Local Indian Professionals" />
            </div>
            <span className="feature-text">Local Indian Professionals</span>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <img src={flexibleIcon} alt="Flexible Appointments" />
            </div>
            <span className="feature-text">Flexible Appointments</span>
          </div>
        </div>
      </div>
    </div>
  );
}