import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { translations } from '../../locales/workerDashboard'; // Will create this later
import './WorkerSignup.css'; // Reusing general styles

function WorkerDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('english');
  const t = translations[language];
  const [workerName, setWorkerName] = useState('Worker');
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkerData = async () => {
      const token = localStorage.getItem('workerToken');
      if (!token) {
        navigate('/worker/login');
        return;
      }

      try {
        // Fetch worker profile (for name)
        const workerProfileResponse = await axios.get('http://localhost:8000/api/worker/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkerName(workerProfileResponse.data.name || 'Worker');

        // Fetch job statistics
        const jobStatsResponse = await axios.get('http://localhost:8000/api/worker/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobStats(jobStatsResponse.data);

      } catch (err) {
        console.error('Error fetching worker data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        // If token is invalid or expired, force logout
        if (err.response?.status === 401) {
          localStorage.removeItem('workerToken');
          navigate('/worker/login');
        }
      }
    };

    fetchWorkerData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('workerToken');
    navigate('/worker/login');
  };

  return (
    <div className="worker-dashboard-wrapper">
      <div className="worker-dashboard-container">
        <div className="language-toggle">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="marathi">Marathi</option>
          </select>
        </div>

        <div className="dashboard-header" data-aos="fade-down">
          <h1>{t.welcome_greeting.replace('{workerName}', workerName)}</h1>
          <p>{t.dashboard_description}</p>
          <button onClick={handleLogout} className="logout-btn">{t.logout_button}</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="stats-grid" data-aos="fade-up" data-aos-delay="100">
          <div className="stat-card">
            <h3>{t.total_jobs}</h3>
            <p>{jobStats.totalJobs}</p>
          </div>
          <div className="stat-card">
            <h3>{t.pending_jobs}</h3>
            <p>{jobStats.pendingJobs}</p>
          </div>
          <div className="stat-card">
            <h3>{t.total_earnings}</h3>
            <p>${jobStats.totalEarnings ? jobStats.totalEarnings.toFixed(2) : '0.00'}</p>
          </div>
        </div>

        <div className="dashboard-section" data-aos="fade-up" data-aos-delay="200">
          <h2>{t.recent_jobs_title}</h2>
          <p>{t.no_recent_jobs}</p>
        </div>

        <div className="dashboard-section" data-aos="fade-up" data-aos-delay="225">
          <h2>{t.my_jobs_title}</h2>
          <p>{t.my_jobs_description}</p>
          <button className="submit-btn" onClick={() => navigate('/worker/jobs')}>{t.view_my_jobs_button}</button>
        </div>

        <div className="dashboard-section" data-aos="fade-up" data-aos-delay="250">
          <h2>{t.profile_summary_title}</h2>
          <p>{t.profile_summary_description}</p>
          <button className="submit-btn" onClick={() => navigate('/worker/account')}>{t.view_profile_button}</button>
        </div>

      </div>
    </div>
  );
}

export default WorkerDashboard; 