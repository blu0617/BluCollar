import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Services.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const handleButtonRipple = (e) => {
  const button = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
  circle.classList.add('ripple');
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) ripple.remove();
  button.appendChild(circle);
};
const handleCardMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * 8;
  const rotateY = ((x - centerX) / centerX) * 8;
  card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
};
const handleCardMouseLeave = (e) => {
  e.currentTarget.style.transform = '';
};

const Services = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const handleServiceClick = (serviceType) => {
    navigate(`/job-request?service=${serviceType}`);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="navbar-container">
          <Link to="/" className="logo">
            <div className="logo-dots">
              <span className="logo-dot"></span>
              <span className="logo-dot"></span>
              <span className="logo-dot"></span>
            </div>
            <span className="brand-name">BluCollar</span>
          </Link>

          <nav className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/services" className="nav-link active">Services</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="nav-buttons">
            <Link to="/login" className="header-btn header-btn-outline" onClick={handleButtonRipple}>Login</Link>
            <Link to="/signup" className="header-btn header-btn-solid" onClick={handleButtonRipple}>Get started</Link>
          </div>
        </div>
      </header>

      {/* Services Content */}
      <div className="services-container">
        <div className="services-header" data-aos="fade-right" data-aos-delay="100">
          <h1>Our Services</h1>
          <p>Professional home cleaning and maintenance services to keep your space pristine and functional.</p>
        </div>
        {/* SVG divider after header */}
        <svg className="section-divider" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#f9fbfd" d="M0,80 C480,0 960,160 1440,80 L1440,160 L0,160 Z"/></svg>
        <div className="services-grid">
          {/* Maid Service */}
          <div className="service-card" data-aos="zoom-in" data-aos-delay="100" onClick={() => handleServiceClick('maid')} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="service-icon cleaning floating-icon">
              <i className="fas fa-broom"></i>
            </div>
            <h3>Maid Service</h3>
            <p>Regular cleaning, deep cleaning, and organizing for your home</p>
          </div>

          {/* Deep Cleaning */}
          <div className="service-card" data-aos="zoom-in" data-aos-delay="200" onClick={() => handleServiceClick('deep-cleaning')} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="service-icon deep-clean floating-icon">
              <i className="fas fa-spray-can"></i>
            </div>
            <h3>Deep Cleaning</h3>
            <p>Thorough cleaning of all surfaces, including hard-to-reach areas</p>
          </div>

          {/* Plumbing */}
          <div className="service-card" data-aos="zoom-in" data-aos-delay="300" onClick={() => handleServiceClick('plumbing')} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="service-icon plumbing floating-icon">
              <i className="fas fa-wrench"></i>
            </div>
            <h3>Plumbing</h3>
            <p>Fix leaks, unclog drains, repair and maintain plumbing systems</p>
          </div>

          {/* Electrical */}
          <div className="service-card" data-aos="zoom-in" data-aos-delay="400" onClick={() => handleServiceClick('electrical')} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="service-icon electrical floating-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <h3>Electrical</h3>
            <p>Electrical repairs, installations, and maintenance services</p>
          </div>

          {/* Kitchen Cleaning */}
          <div className="service-card" data-aos="zoom-in" data-aos-delay="500" onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
            <div className="service-icon kitchen floating-icon">
              <i className="fas fa-utensils"></i>
            </div>
            <h3>Kitchen Cleaning</h3>
            <p>Detailed cleaning of kitchen appliances, counters, and cabinets</p>
          </div>

          {/* More Services Card */}
          <div className="service-card more-services" data-aos="fade-up" data-aos-delay="600">
            <h3>Need Another Service?</h3>
            <p>Tell us what you need - we're here to help!</p>
            <Link to="/job-request" className="call-us-btn" onClick={handleButtonRipple}>Book Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
