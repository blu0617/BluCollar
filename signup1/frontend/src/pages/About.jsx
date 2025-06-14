import React from 'react';
import '../index.css';

const About = () => (
  <div className="page-wrapper">
    <div className="home-container">
      <section className="hero-section skillex-fade-in visible" style={{minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="hero-text-container" style={{maxWidth: 700, margin: '0 auto', textAlign: 'center'}}>
          <h1 className="hero-title gradient-text">About BluCollar</h1>
          <p className="hero-description" style={{fontSize: '1.2rem', color: '#123459cc', margin: '1.5rem 0'}}>
            Your trusted partner for seamless, professional home services.
          </p>
        </div>
      </section>
      <section className="features-section skillex-fade-in visible" style={{paddingTop: 0}}>
        <div className="section-container" style={{maxWidth: 800, margin: '0 auto'}}>
          <div className="section-header" style={{marginBottom: 32}}>
            <h2 style={{color: '#123459'}}>Who We Are</h2>
          </div>
          <div style={{fontSize: '1.1rem', color: '#123459b3', lineHeight: 1.7, background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(18,52,89,0.04)'}}>
            <p>BluCollar was founded with a simple mission: to make daily life easier by connecting you with trusted, background-verified professionals for all your home service needs. Whether you need cleaning, plumbing, electrical work, or cooking, our team is dedicated to providing reliable, high-quality service at your convenience.</p>
            <p>We believe in transparency, quick response, and customer satisfaction. Our platform ensures clear pricing, flexible appointments, and a seamless booking experience. Every service provider is carefully vetted, so you can feel confident and secure inviting them into your home.</p>
            <p>At BluCollar, we're more than just a service platform—we're your partner in creating a comfortable, well-maintained home. Thank you for trusting us to serve you!</p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default About; 