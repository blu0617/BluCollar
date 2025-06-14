import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import maidService from '../assets/wmremove-transformed.jpeg';
import plumberImage from '../assets/wmremove-transformed (5).jpeg';
import electricianImage from '../assets/wmremove-transformed (2).jpeg';
import cookingImage from '../assets/wmremove-transformed (1).jpeg';
import './HeroSlider.css';

const images = [
  { src: maidService, alt: 'Maid Service' },
  { src: plumberImage, alt: 'Plumber' },
  { src: electricianImage, alt: 'Electrician' },
  { src: cookingImage, alt: 'Cook' },
];

const AUTO_SLIDE_INTERVAL = 4000;

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % images.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  return (
    <section className="hero-slider-section">
      <div className="slider-image-wrap">
        <motion.img
          key={current}
          src={images[current].src}
          alt={images[current].alt}
          className="slider-image"
          initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
        <div className="glass-overlay" />
      </div>
      <div className="slider-content">
        <motion.h1
          className="slider-headline"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your Trusted Partner for <span style={{ fontWeight: 900, color: '#567C8D' }}>Home Services</span>
        </motion.h1>
        <motion.p
          className="slider-desc"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Experience premium home services delivered by verified professionals. From cleaning to repairs, we ensure quality, reliability, and peace of mind for your home.
        </motion.p>
        <motion.div
          className="slider-buttons"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className="primary-btn">Book a Service</button>
          <button className="secondary-btn">Explore Services</button>
        </motion.div>
        <div className="slider-dots">
          {images.map((img, idx) => (
            <button
              key={img.alt}
              className={`slider-dot${idx === current ? ' active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider; 