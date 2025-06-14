import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../AdminPanel.css';
import { FaUsers, FaUserTie, FaClipboardList } from 'react-icons/fa';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [jobRequests, setJobRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsRes, usersRes, workersRes] = await Promise.all([
          axios.get('http://localhost:8000/admin/job-requests'),
          axios.get('http://localhost:8000/admin/users'),
          axios.get('http://localhost:8000/admin/workers')
        ]);
        
        console.log('Job Requests:', requestsRes.data);
        console.log('Users:', usersRes.data);
        console.log('Workers:', workersRes.data);
        
        setJobRequests(requestsRes.data);
        setUsers(usersRes.data);
        setWorkers(workersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStatusBadge = (status) => {
    const statusColors = {
      pending: '#FFA500',
      accepted: '#28a745',
      completed: '#17a2b8',
      cancelled: '#dc3545'
    };
    return (
      <span className="status-badge" style={{ backgroundColor: statusColors[status] || '#6c757d' }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <FaClipboardList className="stat-icon" />
          <div className="stat-info">
            <h3>Total Requests</h3>
            <p>{jobRequests.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaUserTie className="stat-icon" />
          <div className="stat-info">
            <h3>Total Workers</h3>
            <p>{workers.length}</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Job Requests
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          Workers
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'requests' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRequests.map(request => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.name}</td>
                    <td>{request.serviceType}</td>
                    <td>{new Date(request.date).toLocaleDateString()}</td>
                    <td>{renderStatusBadge(request.status)}</td>
                    <td>
                      <button className="action-button view">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button className="action-button view">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id}>
                    <td>#{worker.id}</td>
                    <td>{worker.name}</td>
                    <td>{worker.email}</td>
                    <td>{worker.phone}</td>
                    <td>
                      <button className="action-button view">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;