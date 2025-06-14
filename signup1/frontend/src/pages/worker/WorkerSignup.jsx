import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { translations } from '../../locales/workerSignup';
import './WorkerSignup.css';
import cookingImage from '../../assets/wmremove-transformed (1).jpeg';
import AOS from 'aos';
import 'aos/dist/aos.css';

const PROFESSIONS = {
  plumber: {
    title: 'Plumber',
    skills: [
      'Pipe Installation',
      'Leak Repair',
      'Drain Cleaning',
      'Water Heater Installation',
      'Bathroom Fitting',
      'Kitchen Plumbing'
    ],
    certifications: ['Plumbing License', 'Safety Certification', 'Trade Certification']
  },
  electrician: {
    title: 'Electrician',
    skills: [
      'Wiring Installation',
      'Circuit Repair',
      'Electrical Maintenance',
      'Safety Inspection',
      'Emergency Services',
      'Appliance Installation'
    ],
    certifications: ['Electrical License', 'Safety Certification', 'Trade Certification']
  },
  maid: {
    title: 'Housekeeping',
    skills: [
      'House Cleaning',
      'Laundry',
      'Dish Washing',
      'Baby Sitting',
      'Elder Care',
      'Pet Care',
      'Gardening'
    ],
    certifications: ['Housekeeping Certification', 'First Aid Training', 'Food Safety']
  },
  cooking: {
    title: 'Cook',
    skills: [
      'Indian Cuisine',
      'Continental Cuisine',
      'Baking',
      'Meal Prep',
      'Catering',
      'Dietary Meals'
    ],
    certifications: ['Culinary Arts Diploma', 'Food Safety Certification', 'Hygiene Certification']
  }
};

const EXPERIENCE_LEVELS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  'More than 5 years'
];

function WorkerSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('english');
  const t = translations[language];
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [worker, setWorker] = useState({
    profession: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    skills: [],
    experience: '',
    description: '',
    certifications: [],
    profilePhoto: null,
    facePhoto: null,
    portfolioFiles: []
  });

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  // Get initial profession from URL if available
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service');
    if (service && PROFESSIONS[service]) {
      setWorker(prev => ({ ...prev, profession: service }));
      setStep(2);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfessionSelect = (profession) => {
    setWorker(prev => ({
      ...prev,
      profession,
      skills: []
    }));
    setStep(2);
  };

  const handleSkillToggle = (skill) => {
    setWorker(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCertificationToggle = (certification) => {
    setWorker(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleExperienceChange = (e) => {
    setWorker(prev => ({
      ...prev,
      experience: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setWorker(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handlePortfolioFilesChange = (e) => {
    setWorker(prev => ({
      ...prev,
      portfolioFiles: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (worker.password !== worker.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    if (worker.skills.length === 0) {
      setError('Please select at least one skill.');
      setIsSubmitting(false);
      return;
    }
    if (!worker.experience) {
      setError('Please select your experience.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('profession', worker.profession);
    formData.append('name', worker.name);
    formData.append('email', worker.email);
    formData.append('phone', worker.phone);
    formData.append('address', worker.address);
    formData.append('password', worker.password);
    formData.append('skills', JSON.stringify(worker.skills));
    formData.append('certifications', JSON.stringify(worker.certifications));
    formData.append('experience', worker.experience);
    formData.append('description', worker.description);
    if (worker.profilePhoto) {
      formData.append('profilePhoto', worker.profilePhoto);
    }
    if (worker.facePhoto) {
      formData.append('facePhoto', worker.facePhoto);
    }
    worker.portfolioFiles.forEach((file) => {
      formData.append('portfolioFiles', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/api/worker/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.message) {
        alert('Registration successful! Please login.');
        navigate('/worker/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfessionSelection = () => (
    <div className="profession-selection" data-aos="fade-up" data-aos-delay="100">
      <div className="signup-header">
        <h1>{t.step1_title}</h1>
        <p>{t.step1_description}</p>
      </div>
      <div className="profession-cards">
        {Object.entries(PROFESSIONS).map(([key, profession]) => (
          <div
            key={key}
            className="profession-card"
            onClick={() => handleProfessionSelect(key)}
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <h3>{profession.title}</h3>
            <p>{t.profession_description}</p>
          </div>
        ))}
      </div>
      <div className="button-group">
        <button type="button" className="submit-btn" onClick={() => setStep(2)}>{t.next_button}</button>
      </div>
    </div>
  );

  const renderSkillsSelection = () => (
    <div className="signup-form-section" data-aos="fade-up">
      <div className="signup-header">
        <h2>{t.step3_title}</h2>
        <p>{t.step3_description}</p>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group full-width">
        <label className="required">{t.experience_label}</label>
        <select name="experience" value={worker.experience} onChange={handleExperienceChange} required>
          <option value="">{t.select_experience_placeholder}</option>
          {EXPERIENCE_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="form-group full-width">
        <label className="required">{t.skills_label}</label>
        <div className="skills-grid">
          {PROFESSIONS[worker.profession]?.skills.map(skill => (
            <button
              key={skill}
              type="button"
              className={`skill-button ${worker.skills.includes(skill) ? 'selected' : ''}`}
              onClick={() => handleSkillToggle(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group full-width">
        <label>{t.certifications_label}</label>
        <div className="certifications-grid">
          {PROFESSIONS[worker.profession]?.certifications.map(cert => (
            <button
              key={cert}
              type="button"
              className={`certification-button ${worker.certifications.includes(cert) ? 'selected' : ''}`}
              onClick={() => handleCertificationToggle(cert)}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="back-btn" onClick={() => setStep(2)}>{t.back_button}</button>
        <button type="button" className="submit-btn" onClick={() => setStep(4)}>{t.next_button}</button>
      </div>
    </div>
  );

  const renderSignupForm = () => (
    <div className="signup-form-section" data-aos="fade-up">
      <div className="signup-header">
        <h2>{t.step2_title}</h2>
        <p>{t.step2_description}</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="form-row">
        <div className="form-group">
          <label className="required">{t.name_label}</label>
          <input type="text" name="name" value={worker.name} onChange={handleChange} placeholder={t.name_placeholder} required />
        </div>
        <div className="form-group">
          <label className="required">{t.email_label}</label>
          <input type="email" name="email" value={worker.email} onChange={handleChange} placeholder={t.email_placeholder} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="required">{t.phone_label}</label>
          <input type="tel" name="phone" value={worker.phone} onChange={handleChange} placeholder={t.phone_placeholder} required />
        </div>
        <div className="form-group">
          <label className="required">{t.address_label}</label>
          <input type="text" name="address" value={worker.address} onChange={handleChange} placeholder={t.address_placeholder} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="required">{t.password_label}</label>
          <input type="password" name="password" value={worker.password} onChange={handleChange} placeholder={t.password_placeholder} required />
        </div>
        <div className="form-group">
          <label className="required">{t.confirm_password_label}</label>
          <input type="password" name="confirmPassword" value={worker.confirmPassword} onChange={handleChange} placeholder={t.confirm_password_placeholder} required />
        </div>
      </div>

      <div className="form-group full-width">
        <label>{t.description_label}</label>
        <textarea name="description" value={worker.description} onChange={handleChange} placeholder={t.description_placeholder} rows="4"></textarea>
      </div>

      <div className="form-group full-width">
        <label>{t.profile_photo_label}</label>
        <input type="file" name="profilePhoto" accept="image/*" onChange={handleFileChange} />
        {worker.profilePhoto && <p className="file-name">{worker.profilePhoto.name}</p>}
      </div>

      <div className="form-group full-width">
        <label className="required">Facial Verification Photo (Upload a clear photo of your face)</label>
        <input type="file" name="facePhoto" accept="image/*" onChange={handleFileChange} required />
        {worker.facePhoto && <p className="file-name">{worker.facePhoto.name}</p>}
      </div>

      <div className="form-group full-width">
        <label>{t.portfolio_files_label}</label>
        <input type="file" name="portfolioFiles" accept="image/*,application/pdf" multiple onChange={handlePortfolioFilesChange} />
        <div className="file-list">
          {worker.portfolioFiles.map((file, index) => (
            <span key={index} className="file-tag">{file.name}</span>
          ))}
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="back-btn" onClick={() => setStep(1)}>{t.back_button}</button>
        <button type="button" className="submit-btn" onClick={() => setStep(3)}>{t.next_button}</button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="signup-form-section" data-aos="fade-up">
      <div className="signup-header">
        <h2>{t.step4_title}</h2>
        <p>{t.confirmation_message}</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="button-group">
        <button type="button" className="back-btn" onClick={() => setStep(3)}>{t.back_button}</button>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? t.submitting_button : t.submit_button}</button>
      </div>
    </div>
  );

  return (
    <div className="worker-signup-wrapper">
      <div className="worker-signup-container">
        <div className="language-toggle">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="marathi">Marathi</option>
          </select>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {step === 1 && renderProfessionSelection()}
          {step === 2 && renderSignupForm()}
          {step === 3 && renderSkillsSelection()}
          {step === 4 && renderConfirmation()}
        </form>
      </div>
    </div>
  );
}

export default WorkerSignup; 