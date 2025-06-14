import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AuthRedirectModal({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const returnUrl = location.pathname;

  const handleSignup = () => {
    navigate('/signup', { state: { returnUrl } });
    onClose('signup');
  };

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl } });
    onClose('login');
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <h2>Please Sign Up First</h2>
        <p>To request a service, you need to create an account or log in.</p>
        <div className="auth-modal-buttons">
          <button onClick={handleSignup} className="header-btn header-btn-solid">
            Sign Up
          </button>
          <button onClick={handleLogin} className="header-btn header-btn-outline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRedirectModal;