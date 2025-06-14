import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  // Check if user is logged in
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    // If not authenticated, redirect to signup with the current path as return URL
    return <Navigate to="/signup" state={{ returnUrl: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;