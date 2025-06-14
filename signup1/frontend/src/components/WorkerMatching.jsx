import React, { useState, useEffect } from 'react';
import { FaRobot, FaStar, FaCheck, FaSpinner } from 'react-icons/fa';

const WorkerMatching = ({ serviceType, onWorkerSelected }) => {
  const [matchingWorkers, setMatchingWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    if (serviceType) {
      findMatchingWorkers(serviceType);
    }
  }, [serviceType]);

  const findMatchingWorkers = async (service) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call your backend API for worker matching
      const response = await fetch('/api/match-workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service }),
      });

      if (!response.ok) {
        throw new Error('Failed to find matching workers');
      }

      const data = await response.json();
      setMatchingWorkers(data.workers);
    } catch (err) {
      setError('Failed to find matching workers. Please try again.');
      console.error('Worker matching error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    onWorkerSelected?.(worker);
  };

  return (
    <div className="worker-matching-container">
      <div className="matching-header">
        <FaRobot className="ai-icon" />
        <h2>AI-Powered Worker Matching</h2>
        <p>We've found the best workers for your service</p>
      </div>

      {isLoading && (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Finding the perfect match...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="workers-grid">
        {matchingWorkers.map((worker) => (
          <div
            key={worker.id}
            className={`worker-card ${selectedWorker?.id === worker.id ? 'selected' : ''}`}
            onClick={() => handleWorkerSelect(worker)}
          >
            <img src={worker.image} alt={worker.name} className="worker-image" />
            <div className="worker-info">
              <h3>{worker.name}</h3>
              <div className="worker-rating">
                <FaStar className="star-icon" />
                <span>{worker.rating}</span>
                <span className="review-count">({worker.reviewCount} reviews)</span>
              </div>
              <div className="worker-stats">
                <div className="stat">
                  <span className="label">Experience</span>
                  <span className="value">{worker.experience} years</span>
                </div>
                <div className="stat">
                  <span className="label">Success Rate</span>
                  <span className="value">{worker.successRate}%</span>
                </div>
              </div>
              <div className="worker-skills">
                {worker.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {selectedWorker?.id === worker.id && (
              <div className="selected-indicator">
                <FaCheck />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerMatching; 