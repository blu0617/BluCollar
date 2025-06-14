// No longer importing TensorFlow.js node as it's being removed
// No longer importing Worker and Service models directly here, as we'll use a passed 'db' connection.

// Removed loadModel function and serviceCategories

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; 

// Worker matching algorithm
// 'db' connection will be passed as an argument
async function findMatchingWorkers(db, serviceType) {
  return new Promise((resolve, reject) => {
    // Ensure column names match your MySQL schema for 'workers' table
    const query = 'SELECT id, name, email, phone, address, profile_photo, specializations, experience, rating, review_count, success_rate, is_available, latitude, longitude, completed_jobs, hourly_rate, bio, documents, availability FROM workers'; 
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching workers from DB:', err);
        return reject(new Error('Failed to find matching workers'));
      }

      const scoredWorkers = results.map(worker => {
        // Parse JSON fields if they are stored as strings in MySQL
        // The DESCRIBE output uses 'skills' and 'certifications' at the top level
        // but 'specializations' is present and used in frontend. Use 'specializations' for now.
        const specializations = typeof worker.specializations === 'string' 
                                ? JSON.parse(worker.specializations) 
                                : (worker.specializations || []); // Ensure it's an array

        // Parse other JSON fields as per DESCRIBE output
        const skills = typeof worker.skills === 'string' ? JSON.parse(worker.skills) : (worker.skills || []);
        const certifications = typeof worker.certifications === 'string' ? JSON.parse(worker.certifications) : (worker.certifications || []);
        const documents = typeof worker.documents === 'string' ? JSON.parse(worker.documents) : (worker.documents || []);
        const availability = typeof worker.availability === 'string' ? JSON.parse(worker.availability) : (worker.availability || {});
        
        // Ensure experience is treated as a number for calculation
        const experience = parseFloat(worker.experience) || 0;

        const plainWorker = {
          ...worker,
          specializations, // Use the parsed specializations
          skills,          // Use the parsed skills
          certifications,  // Use the parsed certifications
          documents,       // Use the parsed documents
          availability,    // Use the parsed availability
          experience,      // Use the parsed experience as a number
        };
        
        const score = calculateMatchScore(plainWorker, serviceType);
        return { ...plainWorker, matchScore: score };
      });
      
      const topMatches = scoredWorkers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
      
      resolve(topMatches);
    });
  });
}

// Calculate match score for a worker
function calculateMatchScore(worker, serviceType) {
  let score = 0;
  
  // Base score from rating (use worker.rating directly as it's float in DB)
  score += (worker.rating || 0) * 20;
  
  // Experience bonus (worker.experience is already number here)
  score += Math.min((worker.experience || 0) * 5, 25);
  
  // Service type match - use worker.specializations which is now parsed
  if (worker.specializations && Array.isArray(worker.specializations) && worker.specializations.includes(serviceType)) {
    score += 30;
  }
  
  // Success rate bonus (worker.successRate is float in DB)
  score += (worker.successRate || 0) * 0.2;
  
  // Review count bonus (worker.reviewCount is int in DB)
  score += Math.min((worker.reviewCount || 0) * 0.1, 10);
  
  // Availability bonus (worker.isAvailable is tinyint(1) in DB, treated as boolean)
  if (worker.isAvailable) {
    score += 15;
  }
  
  return score;
}

// Authenticate worker for login
async function authenticateWorker(db, emailOrPhone, password) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM workers WHERE email = ? OR phone = ?';
    db.query(query, [emailOrPhone, emailOrPhone], async (err, results) => {
      if (err) {
        console.error('Error fetching worker during authentication:', err);
        return reject(new Error('Authentication failed due to server error.'));
      }
      if (results.length === 0) {
        return reject(new Error('Invalid credentials.'));
      }

      const worker = results[0];
      const isMatch = await bcrypt.compare(password, worker.password);

      if (!isMatch) {
        return reject(new Error('Invalid credentials.'));
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: worker.id,
          email: worker.email,
          role: 'worker',
          profession: worker.profession  // ✅ Include profession here!
        },
        JWT_SECRET,
        { expiresIn: '48h' }
      );
      
      
      // Remove sensitive data before sending back
      delete worker.password;
      delete worker.face_photo;

      resolve({ worker, token });
    });
  });
}

// Get worker profile by ID
async function getWorkerProfile(db, workerId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, name, email, phone, address, profession, skills, experience, description, certifications, profile_photo, portfolio_files, rating, review_count, success_rate, is_available, latitude, longitude, completed_jobs, hourly_rate, bio, documents, availability FROM workers WHERE id = ?';
    db.query(query, [workerId], (err, results) => {
      if (err) {
        console.error('Error fetching worker profile:', err);
        return reject(new Error('Failed to fetch worker profile.'));
      }
      if (results.length === 0) {
        return reject(new Error('Worker not found.'));
      }
      const worker = results[0];
      // Parse JSON fields
      worker.skills = worker.skills ? JSON.parse(worker.skills) : [];
      worker.certifications = worker.certifications ? JSON.parse(worker.certifications) : [];
      worker.portfolio_files = worker.portfolio_files ? JSON.parse(worker.portfolio_files) : [];
      worker.documents = worker.documents ? JSON.parse(worker.documents) : [];
      worker.availability = worker.availability ? JSON.parse(worker.availability) : {};

      resolve(worker);
    });
  });
}

// Get worker dashboard statistics
async function getWorkerDashboardStats(db, workerId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Total Jobs
      const totalJobsQuery = `SELECT COUNT(*) AS totalJobs FROM job_requests WHERE assignedWorkerId = ? AND status IN ('accepted', 'completed', 'in_progress')`;
      const totalJobsResult = await new Promise((res, rej) => db.query(totalJobsQuery, [workerId], (err, result) => err ? rej(err) : res(result)));
      const totalJobs = totalJobsResult[0].totalJobs;

      // Pending Jobs (assigned but not completed/cancelled)
      const pendingJobsQuery = `SELECT COUNT(*) AS pendingJobs FROM job_requests WHERE assignedWorkerId = ? AND status = 'accepted'`;
      const pendingJobsResult = await new Promise((res, rej) => db.query(pendingJobsQuery, [workerId], (err, result) => err ? rej(err) : res(result)));
      const pendingJobs = pendingJobsResult[0].pendingJobs;

      // Total Earnings (sum of hourlyRate * hours for completed jobs)
      // This assumes you have a way to track hours/cost per job, or a fixed payment.
      // For now, let's simulate or fetch a simple sum from a hypothetical 'earnings' or 'completed_jobs' table.
      // If job_requests has a 'price' or 'total_amount' for completed jobs:
      const totalEarningsQuery = `SELECT SUM(total_amount) AS totalEarnings FROM job_requests WHERE assignedWorkerId = ? AND status = 'completed'`;
      const totalEarningsResult = await new Promise((res, rej) => db.query(totalEarningsQuery, [workerId], (err, result) => err ? rej(err) : res(result)));
      const totalEarnings = totalEarningsResult[0].totalEarnings || 0;

      resolve({
        totalJobs,
        pendingJobs,
        totalEarnings
      });
    } catch (err) {
      console.error('Error fetching worker dashboard stats:', err);
      reject(new Error('Failed to fetch dashboard statistics.'));
    }
  });
}

async function getOngoingWorkerJobs(db, workerId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, service_type, description, address, date, time, status, total_amount, client_id
      FROM job_requests
      WHERE assignedWorkerId = ? AND status IN ('accepted', 'in_progress')
      ORDER BY date ASC, time ASC
    `;
    db.query(query, [workerId], (err, results) => {
      if (err) {
        console.error('Error fetching ongoing worker jobs:', err);
        return reject(new Error('Failed to fetch ongoing jobs.'));
      }
      resolve(results);
    });
  });
}

async function getPastWorkerJobs(db, workerId, { status, sortBy, order }) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT id, service_type, description, address, date, time, status, total_amount, client_id
      FROM job_requests
      WHERE assignedWorkerId = ? AND status IN ('completed', 'cancelled')
    `;
    const queryParams = [workerId];

    if (status && (status === 'completed' || status === 'cancelled')) {
      query += ` AND status = ?`;
      queryParams.push(status);
    }

    const validSortBy = ['date', 'total_amount', 'status'];
    const validOrder = ['ASC', 'DESC'];

    let finalSortBy = 'date';
    if (sortBy && validSortBy.includes(sortBy)) {
      finalSortBy = sortBy;
    }

    let finalOrder = 'DESC';
    if (order && validOrder.includes(order.toUpperCase())) {
      finalOrder = order.toUpperCase();
    }

    query += ` ORDER BY ${finalSortBy} ${finalOrder}`;

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching past worker jobs:', err);
        return reject(new Error('Failed to fetch past jobs.'));
      }
      resolve(results);
    });
  });
}

module.exports = {
  findMatchingWorkers,
  simulateFaceVerification: async (facePhotoPath) => {
    console.log(`Simulating facial verification for: ${facePhotoPath}`);
    // Simulate a successful verification for now
    // In a real application, you would integrate with a biometric API here.
    return { success: true, message: "Facial verification successful." };
    // To simulate failure, you could return: return { success: false, message: "Face not recognized or verification failed." };
  },
  simulateEmergencyResponse: async (userId, location) => {
    console.log(`Emergency triggered by user ${userId} at location:`, location);
    // In a real application, this would send alerts to emergency services,
    // notify administrators, log the incident, etc.
    return { success: true, message: "Emergency signal processed." };
  },
  authenticateWorker,
  getWorkerProfile,
  getWorkerDashboardStats,
  getOngoingWorkerJobs,
  getPastWorkerJobs
}; 