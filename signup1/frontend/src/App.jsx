import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Main pages
import HomePage from './pages/HomePage';
import Signup from './Signup';
import Login from './Login';
import Services from './pages/Services';
import JobRequestForm from './JobRequestForm';
import About from './pages/About.jsx';

// Worker related imports
import WorkerSignup from './pages/worker/WorkerSignup';
import WorkerLogin from './pages/worker/WorkerLogin';
import WorkerJobs from './pages/worker/WorkerJobs';
import WorkerLanding from './pages/worker/WorkerLanding';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminPanel from './pages/AdminPanel';


import JobDetails from './jobDetails';
// CSS imports
import './index.css';
import './signup.css';
import './JobRequestForm.css';
import './pages/Services.css';
import './pages/worker/WorkerJobs.css';
import './pages/worker/WorkerLanding.css';
import './WorkerJobs.css';
import './AdminPanel.css';
import ProtectedRoute from './components/ProtectedRoute';
import AccountDetails from './pages/worker/AccountDetails';




// Protected Route Component
const ProtectedRouteComponent = ({ children }) => {
  const isAuthenticated = localStorage.getItem('workerToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/worker/login" replace />;
  }

  return children;
};

function JobDetailsWrapper() {
  const { id } = useParams();
  const [job, setJob] = React.useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:8000/job-request/${id}`)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [id]);
  if (!job) return <div>Loading...</div>;
  return <JobDetails job={job} />;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route path="/job-request" element={<JobRequestForm />} />
          <Route path="/about" element={<About />} />

          {/* Worker routes */}
          <Route path="/worker" element={<WorkerLanding />} />
          <Route path="/worker/signup" element={<WorkerSignup />} />
          <Route path="/worker/login" element={<WorkerLogin />} />
          
          {/* Protected worker routes */}
          <Route path="/worker/dashboard" element={
            <ProtectedRouteComponent>
              <WorkerDashboard />
            </ProtectedRouteComponent>
          } />
          <Route path="/worker/jobs" element={
            <ProtectedRouteComponent>
              <WorkerJobs />
            </ProtectedRouteComponent>
          } />

          {/* Redirect old paths */}
          <Route path="/worker-signup" element={<Navigate to="/worker/signup" replace />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Worker portfolio route */}
          

          {/* Worker profile route */}
          

          {/* Worker job details route */}
          <Route path="/worker/job/:id" element={<JobDetailsWrapper />} />

          {/* Worker account details route */}
          <Route path="/worker/account" element={<AccountDetails />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;