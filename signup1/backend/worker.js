// worker.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();
const PORT = 5003;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Signup',
});

db.connect((err) => {
  if (err) console.error('❌ DB connection error:', err);
  else console.log('✅ Connected to MySQL (worker.js)');
});

// ✅ Geocoding helper using OpenStreetMap
const geocode = async (address) => {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: address,
        key: 'a3c56f158ba84f20a06b693d285e3df5', // Your API key
        limit: 1
      }
    });

    const result = response.data.results[0];
    if (!result) return null;

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng
    };
  } catch (error) {
    console.error('OpenCage error:', error.message);
    return null;
  }
};

// ✅ GET: Geocode API endpoint
app.get('/geocode', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }

  const coordinates = await geocode(address);
  if (!coordinates) {
    return res.status(404).json({ message: 'No location found' });
  }

  res.json(coordinates);
});

// ✅ POST: Worker accepts a job
app.post('/worker/accept', (req, res) => {
  const { jobId, workerId } = req.body;

  if (!jobId || !workerId) {
    return res.status(400).json({ message: 'Job ID and Worker ID are required' });
  }

  const updateQuery = `
    UPDATE job_requests
    SET status = 'accepted', assignedWorkerId = ?
    WHERE id = ?;
  `;

  db.query(updateQuery, [workerId, jobId], (err, result) => {
    if (err) {
      console.error('❌ Error updating job:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Fetch job and customer details
    const fetchJobQuery = `SELECT name, email, address, date, timeSlot FROM job_requests WHERE id = ?`;
    db.query(fetchJobQuery, [jobId], async (err2, jobResults) => {
      if (err2 || jobResults.length === 0) {
        return res.status(200).json({ message: 'Job accepted (email not sent)' });
      }

      const job = jobResults[0];
      const jobDetails = `
        Address: ${job.address}<br>
        Date: ${job.date}<br>
        Time Slot: ${job.timeSlot}
      `;

      // Send email notification
      await sendJobAcceptedEmail({
        toEmail: job.email,
        customerName: job.name,
        workerName: "Your Assigned Professional",
        jobDetails
      });

      res.status(200).json({ message: 'Job accepted and notification sent' });
    });
  });
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendJobAcceptedEmail = async ({ toEmail, customerName, workerName, jobDetails }) => {
  try {
    await transporter.sendMail({
      from: '"Servlyn" <ananyasingh172006@gmail.com>',
      to: toEmail,
      subject: `Your Service Request Has Been Accepted! - Servlyn`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #123459;">Service Request Accepted!</h1>
          <p>Dear ${customerName},</p>
          <p>Great news! Your service request has been accepted by <strong>${workerName}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #123459; margin-top: 0;">Service Details:</h3>
            ${jobDetails}
          </div>
          <p>Your service provider will contact you shortly.</p>
          <p>Thank you for choosing Servlyn!</p>
        </div>
      `,
    });
    console.log("📩 Email sent successfully to", toEmail);
    return true;
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    return false;
  }
};

// Worker login route
app.post('/worker/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM workers WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const worker = results[0];
    bcrypt.compare(password, worker.password, (err, isMatch) => {
      if (err) {
        console.error('❌ Password comparison error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: worker.id, email: worker.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        worker: {
          id: worker.id,
          name: worker.name,
          email: worker.email
        }
      });
    });
  });
});

const upload = multer({ dest: 'uploads/portfolios/' });

app.post('/worker/signup', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'portfolioFiles', maxCount: 5 }
]), async (req, res) => {
  const { 
    profession,
    name, 
    email, 
    phone, 
    address, 
    password, 
    skills, 
    certifications,
    experience, 
    description 
  } = req.body;
  
  const profilePhoto = req.files.profilePhoto ? req.files.profilePhoto[0].path : null;
  const files = req.files.portfolioFiles ? req.files.portfolioFiles.map(f => f.path) : [];

  if (!profession || !name || !email || !password || !skills || !experience) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if email already exists
  const checkEmailQuery = 'SELECT * FROM workers WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Error processing registration' });
      }

      // Insert worker data
      const skillsJson = typeof skills === 'string' ? skills : JSON.stringify(skills);
      const certificationsJson = typeof certifications === 'string' ? certifications : JSON.stringify(certifications);
      const portfolioFilesJson = typeof files === 'string' ? files : JSON.stringify(files);

      const insertQuery = `
        INSERT INTO workers (
          profession,
          name, 
          email, 
          phone, 
          address, 
          password, 
          skills, 
          certifications,
          experience, 
          description, 
          profile_photo, 
          portfolio_files
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        profession,
        name,
        email,
        phone,
        address,
        hashedPassword,
        skillsJson,
        certificationsJson,
        experience,
        description,
        profilePhoto,
        portfolioFilesJson
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error inserting worker:', err);
          return res.status(500).json({ message: 'Registration failed' });
        }

        res.status(201).json({ 
          message: 'Worker registered successfully',
          workerId: result.insertId
        });
      });
    });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Worker Server running at http://localhost:${PORT}`);
});
