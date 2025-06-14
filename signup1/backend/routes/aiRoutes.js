const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { findMatchingWorkers, simulateEmergencyResponse } = require('../services/aiService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for AI image upload (original 'upload' in aiRoutes.js)
const aiImageStorage = multer.memoryStorage();
const aiImageUpload = multer({
  storage: aiImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for AI upload'));
    }
  },
});

// Configure multer for Job Request file uploads (disk storage)
const jobRequestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'; // Relative to backend root (servlyn1/signup1/backend/uploads)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const jobRequestUpload = multer({ storage: jobRequestStorage });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending function (copied from jobRequest.js)
const sendJobAcceptedEmail = async (jobDetails) => {
  try {
    await transporter.sendMail({
      from: '"Servlyn" <' + process.env.EMAIL_USER + '>',
      to: jobDetails.email,
      subject: 'Your Service Request Has Been Accepted!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #123459;">Service Request Accepted!</h1>
          <p>Dear ${jobDetails.name},</p>
          <p>Great news! Your service request has been accepted.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3 style="color: #123459; margin-top: 0;">Service Details:</h3>
            <p>Service Type: ${jobDetails.serviceType}</p>
            <p>Date: ${new Date(jobDetails.date).toLocaleDateString()}</p>
            <p>Time: ${jobDetails.timeSlot}</p>
            <p>Address: ${jobDetails.address}</p>
            ${jobDetails.service_frequency ? `<p>Service Frequency: ${jobDetails.service_frequency}</p>` : ''}
          </div>
          <p>Your service provider will contact you shortly at ${jobDetails.phone_number}.</p>
          <p>Thank you for choosing Servlyn!</p>
        </div>
      `
    });
    console.log("✅ Email sent successfully to", jobDetails.email);
    return true;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return false;
  }
};

// Geocoding helper function (copied from jobRequest.js)
const geocode = async (address) => {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: address,
        key: process.env.OPENCAGE_API_KEY,
        limit: 1
      }
    });

    const result = response.data.results[0];
    if (!result) return null;

    console.log('Geocoding address:', address);
    console.log('Geocoding result:', result);

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng
    };
  } catch (error) {
    console.error('OpenCage error:', error.message);
    return null;
  }
};

// Route for worker matching (uses aiImageUpload)
router.post('/match-workers', aiImageUpload.single('image'), async (req, res) => {
  try {
    const db = req.app.locals.db; // Access the central db connection
    const { service } = req.body;
    
    if (!service) {
      return res.status(400).json({ error: 'Service type is required' });
    }

    // Pass the db connection to findMatchingWorkers
    const matchingWorkers = await findMatchingWorkers(db, service);
    
    if (!matchingWorkers.length) {
      return res.status(404).json({ error: 'No matching workers found' });
    }

    res.json({
      workers: matchingWorkers.map(worker => ({
        id: worker.id,
        name: worker.name,
        image: worker.profile_photo,
        rating: worker.rating,
        reviewCount: worker.reviewCount,
        experience: worker.experience,
        successRate: worker.successRate,
        skills: worker.specializations,
        isAvailable: worker.isAvailable,
        matchScore: worker.matchScore
      }))
    });
  } catch (error) {
    console.error('Error in match-workers route (aiRoutes):', error);
    res.status(500).json({ error: 'Failed to find matching workers' });
  }
});

// Route for emergency trigger
router.post('/emergency/trigger', async (req, res) => {
  try {
    const { location, userId } = req.body;
    const result = await simulateEmergencyResponse(userId, location);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in emergency trigger route (aiRoutes):', error);
    res.status(500).json({ success: false, message: 'Failed to trigger emergency response.' });
  }
});

// NEW: POST: Create new job request (copied from jobRequest.js)
router.post('/job-request', upload.array('documents', 5), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const io = req.app.get('io');

    // ... existing job request processing ...

    // Save the job request to the database
    db.query(
      'INSERT INTO job_requests (client_id, service_type, description, address, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.client_id, req.body.serviceType, req.body.description, req.body.address, req.body.total_amount, 'pending'],
      (err, result) => {
        if (err) {
          console.error('Error inserting job request:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create job request',
            error: err.message
          });
        }

        const jobId = result.insertId;

        // Get the complete job data
        db.query(
          'SELECT * FROM job_requests WHERE id = ?',
          [jobId],
          (err, jobData) => {
            if (err) {
              console.error('Error fetching job data after insertion:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to retrieve job data',
                error: err.message
              });
            }

            // Emit the new job to the appropriate room
            if (io && jobData[0]) {
              io.to(req.body.serviceType.toLowerCase()).emit('new-job', {
                job: jobData[0]
              });
              console.log(`📢 Emitted new job to room: ${req.body.serviceType.toLowerCase()}`);
            }

            res.json({
              success: true,
              message: 'Job request created successfully',
              jobId: jobId
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating job request (outer catch):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job request (general error)',
      error: error.message
    });
  }
});

module.exports = router; 