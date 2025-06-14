import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container background-image">
      <div className="hero-content center-content">
        <h1 className="hero-title">
          Connect with Trusted Local Blue-Collar Workers
        </h1>
        <p className="hero-subtitle">
          Finding reliable blue-collar services has never been easier. Explore our platform to connect with skilled professionals in your area today!
        </p>
        <div className="hero-cta">
          <button className="primary-btn">Find</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Hero; 