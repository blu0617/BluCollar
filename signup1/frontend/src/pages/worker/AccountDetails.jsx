import React from 'react';
import './AccountDetails.css';

export default function AccountDetails() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('workerUser')) || {
    name: 'Unknown',
    email: 'Unknown',
    phone: 'Unknown',
    role: 'Worker',
    registered: 'Unknown'
  };

  const handleLogout = () => {
    localStorage.removeItem('workerToken');
    localStorage.removeItem('workerUser');
    window.location.href = '/worker/login';
  };

  return (
    <div className="account-details-container">
      <div className="account-details-card">
        <div className="profile-avatar">
          <span>{user.name[0]}</span>
        </div>
        <h2 className="account-details-title">Account Details</h2>
        <div className="account-details-info">
          <p><span className="account-details-label">Name:</span> {user.name}</p>
          <p><span className="account-details-label">Email:</span> {user.email}</p>
          <p><span className="account-details-label">Phone:</span> {user.phone}</p>
          <p><span className="account-details-label">Role:</span> {user.role}</p>
          <p><span className="account-details-label">Registered:</span> {user.registered}</p>
        </div>
        <div className="account-actions">
          <button className="edit-btn">Edit Profile</button>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
        <div className="account-alt">
          <a href="/worker/signup" className="alt-link">Register as a Different User</a>
        </div>
      </div>
    </div>
  );
} 