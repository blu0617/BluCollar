const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const multer = require('multer'); // Import multer
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const authenticateToken = require('./authMiddleware'); // Adjust path if needed
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a 'uploads' directory if it doesn't exist
    const uploadDir = './uploads/worker_media';
    const fs = require('fs'); // Import fs to check/create directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

// Import aiService for face verification and login logic
const { simulateFaceVerification, authenticateWorker, getWorkerProfile, getWorkerDashboardStats, getOngoingWorkerJobs, getPastWorkerJobs } = require('../services/aiService');

// Middleware to protect routes


// Worker signup route
router.post('/signup', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'facePhoto', maxCount: 1 },
  { name: 'portfolioFiles', maxCount: 5 }
]), async (req, res) => {
  console.log('Received worker signup request:', req.body);
  console.log('Received files:', req.files);
  const db = req.app.locals.db; // Access the shared DB connection

  const { 
    name, 
    email, 
    phone, 
    address, 
    password, 
    profession, 
    skills, 
    experience, 
    description,
    certifications
  } = req.body;

  // Get file paths
  const profilePhotoPath = req.files.profilePhoto ? req.files.profilePhoto[0].path : null;
  const facePhotoPath = req.files.facePhoto ? req.files.facePhoto[0].path : null;
  const portfolioFilePaths = req.files.portfolioFiles ? req.files.portfolioFiles.map(file => file.path) : [];

  // Simulate facial verification
  if (facePhotoPath) {
    const verificationResult = await simulateFaceVerification(facePhotoPath);
    if (!verificationResult.success) {
      return res.status(400).json({ message: 'Facial verification failed: ' + verificationResult.message });
    }
  } else {
    return res.status(400).json({ message: 'Facial verification photo is required.' });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Error encrypting password' });
    }

    const query = `INSERT INTO workers(
      name, email, phone, address, password,
      profession, skills, experience, description, certifications,
      profile_photo, face_photo, portfolio_files
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
      name, email, phone, address, hash,
      profession, JSON.stringify(JSON.parse(skills)), experience, description, JSON.stringify(JSON.parse(certifications)),
      profilePhotoPath, facePhotoPath, JSON.stringify(portfolioFilePaths)
    ], (err, result) => {
      if (err) {
        console.error('Error inserting worker:', err);
        return res.status(500).json({ message: 'Worker signup failed' });
      }
      res.json({ message: 'Worker registered successfully' });
    });
  });
});

// Worker Login Route
router.post('/login', async (req, res) => {
  const db = req.app.locals.db;
  const { emailOrPhone, password } = req.body;

  try {
    const { worker, token } = await authenticateWorker(db, emailOrPhone, password);
    res.json({ message: 'Login successful', token, worker });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Get Worker Profile Route (Protected)
router.get('/profile', authenticateToken, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const worker = await getWorkerProfile(db, req.worker.id);
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Worker Dashboard Stats Route (Protected)
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const stats = await getWorkerDashboardStats(db, req.worker.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Ongoing Jobs for Worker (Protected)
router.get('/jobs/ongoing', authenticateToken, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const ongoingJobs = await getOngoingWorkerJobs(db, req.worker.id);
    res.json(ongoingJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Past Job History for Worker (Protected)
router.get('/jobs/history', authenticateToken, async (req, res) => {
  const db = req.app.locals.db;
  const { status, sortBy, order } = req.query; // For filtering and sorting
  try {
    const pastJobs = await getPastWorkerJobs(db, req.worker.id, { status, sortBy, order });
    res.json(pastJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer creates maid request
router.post('/maid-request', (req, res) => {
  const { address, workType, date, time, description } = req.body;
  const db = req.app.locals.db; // Access the shared DB connection
  const query = 'INSERT INTO job_requests (address, workType, date, time, description, status) VALUES (?, ?, ?, ?, ?, "pending")';
  db.query(query, [address, workType, date, time, description], (err, result) => {
    if (err) {
      console.error('Error creating request:', err);
      return res.status(500).json({ message: 'Failed to create maid request' });
    }
    res.json({ message: 'Maid request submitted!' });
  });
});

// Worker accepts a job
router.post('/accept', authenticateToken, (req, res) => {
  const db = req.app.locals.db;
  const workerId = req.worker.id;
  const { jobId } = req.body;

  const query = `
    SELECT j.serviceType, w.profession
    FROM job_requests j
    JOIN workers w ON w.id = ?
    WHERE j.id = ?
  `;

  db.query(query, [workerId, jobId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Fetch error:', err);
      return res.status(500).json({ message: 'Job or worker not found' });
    }

    const { serviceType, profession } = results[0];

    if (serviceType.toLowerCase() !== profession.toLowerCase()) {
      return res.status(403).json({
        message: `Profession mismatch: You are a ${profession}, but this is a ${serviceType} job.`,
      });
    }
    // Get pending jobs for worker (filtered by profession)
     // Get Pending Jobs for Worker (Filtered by profession)

    // Proceed to assign job
    const updateQuery = `
      UPDATE job_requests 
      SET status = 'accepted', assignedWorkerId = ? 
      WHERE id = ? AND status = 'pending'
    `;
    db.query(updateQuery, [workerId, jobId], (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ message: 'Failed to accept job' });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'Job already taken or unavailable' });
      }
      res.json({ message: 'Job accepted successfully!' });
    });
  });
});

router.get('/jobs/pending', authenticateToken, (req, res) => {
  const db = req.app.locals.db;
  const profession = req.worker.profession;

  if (!profession) {
    return res.status(400).json({ message: 'Worker profession not available in token.' });
  }

  const query = `
    SELECT * FROM job_requests 
    WHERE status = 'pending' AND LOWER(serviceType) = LOWER(?)
  `;

  db.query(query, [req.worker.profession], (err, results) => {
    if (err) {
      console.error('Error fetching pending jobs:', err);
      return res.status(500).json({ message: 'Failed to fetch pending jobs' });
    }
    res.json(results);
  });
});

module.exports = router;