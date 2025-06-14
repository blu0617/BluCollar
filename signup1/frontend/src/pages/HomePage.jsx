import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { FaUserShield, FaBolt, FaTag, FaCheckCircle, FaTools, FaHandshake, FaChartLine, FaUsers, FaCalendarCheck, FaUserCog, FaTruckMoving, FaCommentDots, FaUser, FaCamera, FaRobot, FaExclamationTriangle } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import axios from 'axios'; // Ensure axios is imported for API calls
// Import your images
import cookingImg from '../assets/wmremove-transformed (1).jpeg';
import maidImg from '../assets/wmremove-transformed.jpeg';
import electricianImg from '../assets/wmremove-transformed (2).jpeg';
import plumberImg from '../assets/wmremove-transformed (5).jpeg';
import WorkerMatching from '../components/WorkerMatching';

gsap.registerPlugin(ScrollTrigger);

// Keep your workerCards array
const workerCards = [
  {
    title: "Cook",
    img: cookingImg,
    stats: { label1: "300+ Jobs", label2: "4.8★" }
  },
  {
    title: "Maid",
    img: maidImg,
    stats: { label1: "500+ Jobs", label2: "4.9★" }
  },
  {
    title: "Electrician",
    img: electricianImg,
    stats: { label1: "200+ Jobs", label2: "4.7★" }
  },
  {
    title: "Plumber",
    img: plumberImg,
    stats: { label1: "250+ Jobs", label2: "4.8★" }
  },
  // Duplicate for seamless loop
  {
    title: "Cook",
    img: cookingImg,
    stats: { label1: "300+ Jobs", label2: "4.8★" }
  },
  {
    title: "Maid",
    img: maidImg,
    stats: { label1: "500+ Jobs", label2: "4.9★" }
  },
  {
    title: "Electrician",
    img: electricianImg,
    stats: { label1: "200+ Jobs", label2: "4.7★" }
  },
  {
    title: "Plumber",
    img: plumberImg,
    stats: { label1: "250+ Jobs", label2: "4.8★" }
  }
];

const headlineWords = ["Connect", "with", "Trusted", "Local", "Blue", "Collar", "Workers"];

const HomePage = () => {
  const heroImageRef = useRef(null);
  const observerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const workerCardRefs = useRef([]);
  const statsRefs = useRef([]); // Ref for stat numbers
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false); // New state for emergency button

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(currentIdx => (currentIdx + 1) % workerCards.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroImageRef.current) {
      heroImageRef.current.onload = () => {
        heroImageRef.current.classList.add('loaded');
      };
    }

    // Intersection Observer for Skillex-style scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all .animate-fade-in elements
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((el) => observerRef.current.observe(el));

    AOS.init({ once: true, duration: 900, easing: 'ease-in-out' });

    // Check for user info in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // GSAP counting animation for stats
  useEffect(() => {
    const statsData = [
      { id: 'customers', start: 9500, end: 10000, suffix: '+' },
      { id: 'workers', start: 400, end: 500, suffix: '+' },
      { id: 'satisfaction', start: 90, end: 98, suffix: '%' },
      { id: 'services', start: 14000, end: 15000, suffix: '+' }
    ];

    statsData.forEach((stat, index) => {
      const target = statsRefs.current[index];
      if (target) {
        gsap.from(target, {
          textContent: stat.start, // Start counting from this value
          duration: 2, // Animation duration
          ease: "power1.out", // Easing function
          snap: { textContent: 1 }, // Snap to whole numbers
          scrollTrigger: {
            trigger: target.closest('.stat-box'), // Trigger when the stat-box is in view
            start: "top 80%", // When top of stat-box is 80% from top of viewport
            end: "bottom top",
            toggleActions: "play none none none", // Play once
          },
          onUpdate: function() {
            let displayValue = Math.round(this.targets()[0].textContent); // Get rounded value
            if (stat.id === 'satisfaction') {
              target.textContent = displayValue + stat.suffix; // Add suffix
            } else {
              target.textContent = displayValue.toLocaleString() + stat.suffix; // Format with comma and add suffix
            }
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const prevCard = () => setActiveIdx((activeIdx - 1 + workerCards.length) % workerCards.length);
  const nextCard = () => setActiveIdx((activeIdx + 1) % workerCards.length);

  const handleWorkerSelected = (worker) => {
    setSelectedWorker(worker);
  };

  const handleEmergencyClick = async () => {
    if (isEmergencyTriggered) return; // Prevent multiple triggers

    setIsEmergencyTriggered(true);
    try {
      const response = await axios.post('http://localhost:8000/api/emergency/trigger', {
        location: user ? { lat: user.latitude, lng: user.longitude } : null,
        userId: user ? user.id : 'guest',
      });
      if (response.data.success) {
        alert('Emergency signal sent! Help is on the way. Please stay safe.');
      } else {
        alert('Failed to send emergency signal. Please try again.');
      }
    } catch (error) {
      console.error('Emergency trigger error:', error);
      alert('Error sending emergency signal. Please try again.');
    } finally {
      // Reset after a delay or based on a real response
      setTimeout(() => setIsEmergencyTriggered(false), 5000); // Cooldown for 5 seconds
    }
  };

  return (
    <div className="page-wrapper">
      <div className="home-container">
        {/* Navbar Section */}
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
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
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="nav-buttons">
            {user ? (
              <div className="user-dropdown" style={{ position: 'relative' }}>
                <button className="header-btn header-btn-outline" onClick={() => setDropdownOpen(v => !v)}>
                  {user.name || user.email || 'Account'} ▼
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 12px rgba(18,52,89,0.08)', borderRadius: 8, minWidth: 160, zIndex: 100 }}>
                    <Link to="/profile" className="dropdown-item" style={{ display: 'block', padding: '12px 20px', color: '#123459', textDecoration: 'none' }} onClick={() => setDropdownOpen(false)}>Profile</Link>
                    <button className="dropdown-item" style={{ display: 'block', width: '100%', padding: '12px 20px', color: '#123459', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="header-btn header-btn-outline">
                  Login
                </Link>
                <Link to="/signup" className="header-btn header-btn-solid">
                  Get started
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Emergency Button */}
        <button
          className={`emergency-button ${isEmergencyTriggered ? 'triggered' : ''}`}
          onClick={handleEmergencyClick}
          disabled={isEmergencyTriggered}
        >
          <FaExclamationTriangle size={24} />
          {isEmergencyTriggered ? 'SOS Sent!' : 'SOS'}
        </button>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-carousel-container">
            {workerCards.map((card, idx) => (
              <img
                key={idx}
                src={card.img}
                alt={card.title}
                className="hero-carousel-image"
                style={{
                  zIndex: workerCards.length - idx,
                  opacity: idx === activeIdx ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                }}
              />
            ))}
          </div>
          <div className="hero-content-overlay">
            <h1 className="hero-headline gradient-text">
              Find Trusted Local Help, Instantly.
            </h1>
            <p className="hero-subtext">
              BluCollar connects you with reliable, skilled blue-collar workers for all your home service needs, right in your neighborhood.
            </p>
            <div className="hero-buttons">
              <Link to="/job-request" className="hero-button primary">
                Book Now
              </Link>
              <Link to="/services" className="hero-button secondary">
                Browse Services
              </Link>
            </div>
          </div>
          <div className="scroll-indicator"></div>
        </section>

        {/* AI Worker Matching Section */}
        {activeService && (
          <section className="worker-matching-section">
            <div className="section-container">
              <WorkerMatching 
                serviceType={activeService.type} 
                onWorkerSelected={handleWorkerSelected}
              />
            </div>
          </section>
        )}

        {/* Worker Cards Section - Target for animation */}
        <section className="worker-cards-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Our Expert Professionals</h2>
              <p>Connect with skilled workers in your area</p>
            </div>
            <div className="worker-cards-grid">
              {workerCards.map((card, index) => (
                <div
                  key={card.title}
                  className="worker-card"
                  ref={el => workerCardRefs.current[index] = el}
                  // AOS will be removed later if GSAP handles animation
                >
                  <div className="worker-card-image">
                    <img src={card.img} alt={card.title} />
                    <div className="worker-card-overlay">
                      <button className="book-now-btn">Book Now</button>
                    </div>
                  </div>
                  <div className="worker-card-content">
                    <h3 className="worker-card-title">{card.title}</h3>
                    <div className="worker-card-stats">
                      <span className="stat-item">{card.stats.label1}</span>
                      <span className="stat-item rating">{card.stats.label2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New How It Works Section */}
        <section className="how-it-works-section">
          <div className="section-container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>Simple steps to get your service done</p>
            </div>
            <div className="steps-container">
              {[
                {
                  number: 1,
                  title: "AI Service Detection",
                  description: "Upload a photo or describe your need - our AI instantly identifies the required service.",
                  icon: <FaCamera size={40} color="#123459" />
                },
                {
                  number: 2,
                  title: "Smart Worker Matching",
                  description: "Our AI matches you with the best-suited professional based on skills and ratings.",
                  icon: <FaRobot size={40} color="#123459" />
                },
                {
                  number: 3,
                  title: "Confirm & Track",
                  description: "Approve service and track progress in real-time.",
                  icon: <FaTruckMoving size={40} color="#123459" />
                },
                {
                  number: 4,
                  title: "Rate & Review",
                  description: "Share your experience and help improve our AI matching.",
                  icon: <FaCommentDots size={40} color="#123459" />
                }
              ].map((step, index) => (
                <div className="step-card" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="step-number">{step.number}</div>
                  <div className="step-content">
                    <div className="step-icon">
                      {step.icon}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Testimonials Section */}
        <section className="testimonials-section">
          <div className="section-container">
            <div className="section-header">
              <h2>What Our Customers Say</h2>
              <p>Real experiences from our satisfied customers</p>
            </div>
            <div className="testimonials-grid">
              <div className="testimonial-card" data-aos="fade-up">
                <div className="testimonial-content">
                  <p>"BluCollar made finding a reliable electrician so easy! The service was prompt and professional. Highly recommend their platform."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <FaUser size={24} color="#123459" />
                  </div>
                  <div className="author-info">
                    <h4>Priya Sharma</h4>
                    <p>Homeowner, Delhi</p>
                    <span className="trust-badge">Verified User</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
                <div className="testimonial-content">
                  <p>"I needed a maid urgently, and BluCollar connected me with someone within minutes. Fantastic service and very trustworthy!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <FaUser size={24} color="#123459" />
                  </div>
                  <div className="author-info">
                    <h4>Rajesh Kumar</h4>
                    <p>Apartment Manager, Mumbai</p>
                    <span className="trust-badge">Verified User</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
                <div className="testimonial-content">
                  <p>"As a cook, BluCollar has provided me with consistent work opportunities and a great way to connect with clients. It's a game-changer!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <FaUser size={24} color="#123459" />
                  </div>
                  <div className="author-info">
                    <h4>Anjali Singh</h4>
                    <p>Professional Cook, Bangalore</p>
                    <span className="trust-badge">Verified User</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* New Stats Section */}
        <section className="stats-section">
          <div className="section-container">
            <div className="stats-grid">
              <div className="stat-box" data-aos="fade-up">
                <FaUsers size={40} color="#123459" />
                <h3 ref={el => statsRefs.current[0] = el}>10,000+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat-box" data-aos="fade-up" data-aos-delay="100">
                <FaTools size={40} color="#123459" />
                <h3 ref={el => statsRefs.current[1] = el}>500+</h3>
                <p>Expert Workers</p>
              </div>
              <div className="stat-box" data-aos="fade-up" data-aos-delay="200">
                <FaChartLine size={40} color="#123459" />
                <h3 ref={el => statsRefs.current[2] = el}>98%</h3>
                <p>Satisfaction Rate</p>
              </div>
              <div className="stat-box" data-aos="fade-up" data-aos-delay="300">
                <FaHandshake size={40} color="#123459" />
                <h3 ref={el => statsRefs.current[3] = el}>15,000+</h3>
                <p>Services Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* New Pricing Section (Placeholder for V1) */}
        <section className="pricing-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Our Pricing Plans</h2>
              <p>Simple and transparent pricing for your needs</p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card" data-aos="fade-up">
                <h3>Hourly Rate</h3>
                <p className="price">Rs. 25<span>/hour</span></p>
                <ul>
                  <li>Flexible booking</li>
                  <li>Basic service coverage</li>
                  <li>Pay as you go</li>
                </ul>
                <button className="blue-button">Choose Plan</button>
              </div>
              <div className="pricing-card" data-aos="fade-up" data-aos-delay="100">
                <h3>Daily Rate</h3>
                <p className="price">Rs. 180<span>/day</span></p>
                <ul>
                  <li>Full-day service</li>
                  <li>Standard service coverage</li>
                  <li>Ideal for larger tasks</li>
                </ul>
                <button className="blue-button">Choose Plan</button>
              </div>
              <div className="pricing-card" data-aos="fade-up" data-aos-delay="200">
                <h3>Subscription</h3>
                <p className="price">Rs. 450<span>/month</span></p>
                <ul>
                  <li>Recurring services</li>
                  <li>Premium service coverage</li>
                  <li>Dedicated support</li>
                </ul>
                <button className="blue-button">Choose Plan</button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="cta-section new-cta-section animate-fade-in">
          <div className="section-container">
            <div className="cta-content animate-fade-in">
              <h2>Ready to Get Started?</h2>
              <p>Join BluCollar today and connect with thousands of service providers or find the perfect job for your skills!</p>
              <div className="cta-buttons">
                <Link to="/job-request" className="blue-button">Post a Job</Link>
                <Link to="/worker-signup" className="white-button">Become a Worker</Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Enhanced Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-column">
              <h4>About Us</h4>
              <ul>
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/about">Our Team</Link></li>
                <li><Link to="/about">Careers</Link></li>
                <li><Link to="/about">Press</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Services</h4>
              <ul>
                <li><Link to="/services">All Services</Link></li>
                <li><Link to="/job-request?service=maid">Maid Service</Link></li>
                <li><Link to="/job-request?service=plumbing">Plumbing</Link></li>
                <li><Link to="/job-request?service=electrical">Electrical</Link></li>
                <li><Link to="/job-request?service=cooking">Cooking</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/safety">Safety</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
                <li><Link to="/accessibility">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} BluCollar. All rights reserved.</p>
          </div>
        </footer>

        {/* New Section: Our Top Professionals */}
        

        {/* New Book a Service Section */}
        

        {/* Help Chat Bubble */}
        <div className="help-chat-bubble" onClick={() => window.open('mailto:support@servlyn.com')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default HomePage;