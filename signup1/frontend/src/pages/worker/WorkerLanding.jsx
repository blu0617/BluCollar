import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { translations } from '../../locales/workerSignup';
import './WorkerLanding.css';
import maidService from '../../assets/wmremove-transformed.jpeg';
import plumberImage from '../../assets/wmremove-transformed (5).jpeg';
import electricianImage from '../../assets/wmremove-transformed (2).jpeg';
import heroImage1 from '../../assets/AdobeStock_431135906_Preview.jpeg';
import heroImage2 from '../../assets/AdobeStock_458508034_Preview.jpeg';
import heroImage3 from '../../assets/AdobeStock_845208776_Preview.jpeg';

const heroImages = [heroImage1, heroImage2, heroImage3];

const WorkerLanding = () => {
  const [language, setLanguage] = useState('english');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = translations[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="worker-landing">
      {/* Header */}
      <header className="worker-header">
        <Link to="/" className="logo">BluCollar</Link>
        <nav className="worker-nav">
          <div className="language-selector">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी</option>
              <option value="marathi">मराathi</option>
            </select>
          </div>
          <Link to="/worker/login" className="nav-button outline-button">Login</Link>
          <Link to="/worker/signup" className="nav-button primary-button">Join Us</Link>
          <Link to="/worker/account" className="nav-button primary-button">Account</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="worker-hero"
        style={{
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          transition: 'background-image 1s ease-in-out' // Smooth transition
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="title-container">
              <h1>{t.hero.title}</h1>
              <h1 className="service-title">{t.hero.titleHighlight}</h1>
            </div>
            <p className="hero-description">
              {t.hero.description}
            </p>
            <div className="hero-buttons">
              <Link to="/worker/signup" className="hero-button primary-button">
                {t.hero.getStarted}
              </Link>
              <Link to="/worker/jobs" className="hero-button secondary-button">
                See Job Requests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="why-join-section">
        <h2 className="section-title">{t.whyJoinTitle}</h2>
        <div className="benefits-cards">
          <div className="benefit-card">
            <h3 className="benefit-title">{t.benefits.flexibleSchedule.title}</h3>
            <p className="benefit-description">
              {t.benefits.flexibleSchedule.description}
            </p>
          </div>

          <div className="benefit-card">
            <h3 className="benefit-title">{t.benefits.steadyIncome.title}</h3>
            <p className="benefit-description">
              {t.benefits.steadyIncome.description}
            </p>
          </div>

          <div className="benefit-card">
            <h3 className="benefit-title">{t.benefits.professionalGrowth.title}</h3>
            <p className="benefit-description">
              {t.benefits.professionalGrowth.description}
            </p>
          </div>

          <div className="benefit-card">
            <h3 className="benefit-title">{t.benefits.supportSystem.title}</h3>
            <p className="benefit-description">
              {t.benefits.supportSystem.description}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="worker-services">
        <h2 className="section-title">{t.services.title}</h2>
        <div className="service-cards">
          <div className="service-card">
            <div className="image-container">
              <img src={maidService} alt="Housekeeping" />
            </div>
            <h3>{t.services.housekeeping.title}</h3>
            <p>{t.services.housekeeping.description}</p>
            <Link 
              to="/worker/signup?service=housekeeping" 
              className="service-button primary-button"
            >
              {t.services.registerNow}
            </Link>
          </div>

          <div className="service-card">
            <div className="image-container">
              <img src={plumberImage} alt="Plumbing" className="service-image" />
            </div>
            <h3>{t.services.plumbing.title}</h3>
            <p>{t.services.plumbing.description}</p>
            <Link 
              to="/worker/signup?service=plumbing" 
              className="service-button primary-button"
            >
              {t.services.registerNow}
            </Link>
          </div>

          <div className="service-card">
            <div className="image-container">
              <img src={electricianImage} alt="Electrical" className="service-image" />
            </div>
            <h3>{t.services.electrical.title}</h3>
            <p>{t.services.electrical.description}</p>
            <Link 
              to="/worker/signup?service=electrical" 
              className="service-button primary-button"
            >
              {t.services.registerNow}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="worker-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} BluCollar. All rights reserved.</p>
          <div className="footer-links">
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WorkerLanding; 