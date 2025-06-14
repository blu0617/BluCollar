import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { translations } from '../../locales/workerLogin';
import './WorkerSignup.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function WorkerLogin() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('english');
  const t = translations[language];
  const [credentials, setCredentials] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Move AOS.init() here
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:8000/api/worker/login', credentials);
      localStorage.setItem('workerToken', response.data.token);
      localStorage.setItem('workerUser', JSON.stringify(response.data.worker));
      alert('Login successful!');
      navigate('/worker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="signup-form-section" data-aos="fade-up">
          <div className="signup-header">
            <h1>{t?.login_title || "Login"}</h1>
            <p>{t?.login_description || "Please login below"}</p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group full-width">
              <label className="required">{t.email_or_phone_label}</label>
              <input
                type="text"
                name="emailOrPhone"
                value={credentials.emailOrPhone}
                onChange={handleChange}
                placeholder={t.email_or_phone_placeholder}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="required">{t.password_label}</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder={t.password_placeholder}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? t.logging_in_button : t.login_button}
              </button>
            </div>
            <p className="redirect-text">
              {t.no_account_text} <a href="/worker/signup">{t.signup_here_link}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WorkerLogin;
