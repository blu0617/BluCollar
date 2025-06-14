import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaBolt, FaLocationArrow } from "react-icons/fa";
import JobLocationMap from '../../JobLocationMap';
import './WorkerJobs.css';
import { jwtDecode } from 'jwt-decode';
import { getSocket, disconnectSocket } from '../../services/socketService';


function WorkerJobs() {
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);

  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("ongoing");
  const [workerId, setWorkerId] = useState(null);

  const WORKER_LAT = 30.7333;
  const WORKER_LNG = 76.7794;

  useEffect(() => {
    const token = localStorage.getItem('workerToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setWorkerId(decodedToken.id);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('workerToken');
      }
    }
  }, []);

  useEffect(() => {
    if (!workerId) return;
    if (activeTab === 'ongoing') fetchOngoingJobs();
    else if (activeTab === 'pending') fetchPendingJobs();
    else fetchPastJobs();
  }, [workerId, activeTab, sortBy, sortOrder, filterStatus]);

  useEffect(() => {
    const socket = getSocket();
    const workerUser = JSON.parse(localStorage.getItem('workerUser'));
    const profession = workerUser?.profession;

    if (profession) {
      socket.emit('join-room', profession.toLowerCase());
      console.log(`Frontend: Joining Socket.IO room for profession: ${profession}`);
    }

    socket.on('new-job', (data) => {
      console.log('📦 New job received:', data);
      toast.info(`New ${data.job.serviceType} job posted!`);
      if (activeTab === 'pending') {
        fetchPendingJobs();
      }
    });

    return () => {
      // Don't disconnect the socket here, just remove the listeners
      socket.off('new-job');
    };
  }, [workerId, activeTab]);

  const fetchOngoingJobs = async () => {
    try {
      const token = localStorage.getItem('workerToken');
      const response = await axios.get('http://localhost:8000/api/worker/jobs/ongoing', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jobsWithData = await Promise.all(
        response.data.map(async (job) => {
          const { lat, lng } = await getCoordinates(job.address) ?? {};
          const distance = lat && lng ? haversineDistance(WORKER_LAT, WORKER_LNG, lat, lng) : null;
          const urgencyLevel = Math.floor(Math.random() * 5) + 1;
          return { ...job, lat, lng, distance, urgencyLevel };
        })
      );
      setOngoingJobs(jobsWithData);
    } catch (error) {
      console.error('Error fetching ongoing jobs:', error);
      toast.error('Failed to load ongoing jobs.');
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const token = localStorage.getItem('workerToken');
      const response = await axios.get('http://localhost:8000/api/worker/jobs/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📦 Pending jobs response:", response.data);
      setPendingJobs(response.data);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      toast.error('Failed to load pending jobs.');
    }
  };

  const fetchPastJobs = async () => {
    try {
      const token = localStorage.getItem('workerToken');
      const params = { sortBy, order: sortOrder };
      if (filterStatus !== 'all') params.status = filterStatus;

      const response = await axios.get('http://localhost:8000/api/worker/jobs/history', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPastJobs(response.data);
    } catch (error) {
      console.error('Error fetching past jobs:', error);
      toast.error('Failed to load past job history.');
    }
  };

  const getCoordinates = async (address) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await axios.get(`http://localhost:8000/geocode?address=${encodedAddress}`);
      if (response.data.lat && response.data.lng) {
        return { lat: parseFloat(response.data.lat), lng: parseFloat(response.data.lng) };
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAccept = async (jobId) => {
    try {
      const token = localStorage.getItem('workerToken');
      if (!token) {
        toast.error('Please log in to accept jobs.');
        return;
      }
      const response = await axios.post('http://localhost:8000/api/worker/accept', { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message) {
        toast.success('Job accepted successfully!');
        fetchOngoingJobs();
        setActiveTab("ongoing");
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error(error.response?.data?.message || 'Failed to accept job. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="worker-jobs-container">
      <ToastContainer />
      <h1 className="page-title">Worker Jobs</h1>

      {/* Tabs */}
      <div className="tab-buttons">
        <button className={`tab-button ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>Ongoing Jobs</button>
        <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Jobs</button>
        <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Past Job History</button>
      </div>

      {/* Sort and Filter for History */}
      {activeTab === 'history' && (
        <div className="filter-sort-container">
          <div className="sort-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="total_amount">Earnings</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {/* Ongoing Jobs */}
      {activeTab === 'ongoing' && ongoingJobs.length === 0 && (
        <p className="no-jobs">No ongoing jobs to display.</p>
      )}
      {activeTab === 'ongoing' && ongoingJobs.length > 0 && (
        <div className="jobs-grid">
          {ongoingJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3 className="service-type">{job.service_type}</h3>
                <span className={`job-status ${job.status}`}>{job.status}</span>
                <div className="urgency-badge">
                  <FaBolt className="urgency-icon" />
                  <span>Urgency: {job.urgencyLevel}</span>
                </div>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="job-info">
                <div className="info-item"><FaMapMarkerAlt className="info-icon" /><span>{job.address}</span></div>
                <div className="info-item"><FaCalendarAlt className="info-icon" /><span>{formatDate(job.date)} at {job.time}</span></div>
                {job.distance && (
                  <div className="info-item"><FaLocationArrow className="info-icon" /><span>{job.distance.toFixed(2)} km away</span></div>
                )}
              </div>
              {job.lat && job.lng ? (
                <div className="map-container"><JobLocationMap lat={job.lat} lng={job.lng} name={job.service_type} /></div>
              ) : (
                <div className="map-placeholder">Map not available</div>
              )}
              {job.status === 'accepted' && (
                <button className="complete-job-button" onClick={() => console.log('Complete job:', job.id)}>Mark as Completed</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past Jobs */}
      {activeTab === 'history' && pastJobs.length === 0 && (
        <p className="no-jobs">No past jobs to display in this category.</p>
      )}
      {activeTab === 'history' && pastJobs.length > 0 && (
        <div className="jobs-grid">
          {pastJobs.map((job) => (
            <div key={job.id} className="job-card past-job-card">
              <div className="job-card-header">
                <h3 className="service-type">{job.service_type}</h3>
                <span className={`job-status ${job.status}`}>{job.status}</span>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="job-info">
                <div className="info-item"><FaMapMarkerAlt className="info-icon" /><span>{job.address}</span></div>
                <div className="info-item"><FaCalendarAlt className="info-icon" /><span>{formatDate(job.date)} at {job.time}</span></div>
                {job.total_amount && (
                  <div className="info-item"><span>Earnings: ₹{job.total_amount.toFixed(2)}</span></div>
                )}
              </div>
              <button className="view-details-button" onClick={() => console.log('View details for past job:', job.id)}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {/* Pending Jobs */}
      {activeTab === 'pending' && pendingJobs.length === 0 && (
        <p className="no-jobs">No pending jobs to display.</p>
      )}
      {activeTab === 'pending' && pendingJobs.length > 0 && (
        <div className="jobs-grid">
          {pendingJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3 className="service-type">{job.service_type}</h3>
                <span className={`job-status ${job.status}`}>{job.status}</span>
                <div className="urgency-badge">
                  <FaBolt className="urgency-icon" />
                  <span>Urgency: {job.urgencyLevel}</span>
                </div>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="job-info">
                <div className="info-item"><FaMapMarkerAlt className="info-icon" /><span>{job.address}</span></div>
                <div className="info-item"><FaCalendarAlt className="info-icon" /><span>{formatDate(job.date)} at {job.time}</span></div>
                {/* No distance for pending jobs unless explicitly added to schema */}
              </div>
              {job.lat && job.lng ? (
                <div className="map-container"><JobLocationMap lat={job.lat} lng={job.lng} name={job.service_type} /></div>
              ) : (
                <div className="map-placeholder">Map not available</div>
              )}
              <button className="accept-button" onClick={() => handleAccept(job.id)}>Accept Job</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerJobs;
