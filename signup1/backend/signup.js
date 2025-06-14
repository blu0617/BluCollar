// backend/signup.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 6001;

dotenv.config();

// CORS for frontend client (e.g., React or Vue)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static CSS and assets
app.use('/static', express.static(path.join(__dirname, '../frontend/static')));

// ✅ Serve HTML pages
app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/customer.html'));
});



// ✅ MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Signup',
});

db.connect((err) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('✅ Connected to MySQL (signup.js)');
  }
});

// ✅ User Signup
// ✅ User Signup with password hashing
app.post('/signup', (req, res) => {
  const { name, email, phone, address, password } = req.body;

  // Hash the password
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Error while encrypting password' });
    }

    const query = 'INSERT INTO signup(name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, phone, address, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Signup failed' });
      }
      res.json({ message: 'Signup successful' });
    });
  });
});


// ✅ Customer creates maid request
app.post('/maid-request', (req, res) => {
  const { address, workType, date, time, description } = req.body;
  const query = 'INSERT INTO job_requests (address, workType, date, time, description, status) VALUES (?, ?, ?, ?, ?, "pending")';
  db.query(query, [address, workType, date, time, description], (err, result) => {
    if (err) {
      console.error('Error creating request:', err);
      return res.status(500).json({ message: 'Failed to create maid request' });
    }
    res.json({ message: 'Maid request submitted!' });
  });
});

// ✅ Worker accepts a job
app.post('/worker/accept', (req, res) => {
  const { jobId, workerId } = req.body;
  const query = 'UPDATE job_requests SET status = ?, assignedWorkerId = ? WHERE id = ? AND status = "pending"';
  db.query(query, ['accepted', workerId, jobId], (err, result) => {
    if (err) {
      console.error('Error accepting job:', err);
      return res.status(500).json({ message: 'Failed to accept job' });
    }
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Job not available' });
    }
    res.json({ message: 'Job accepted!' });
  });
});

app.post('/worker/signup', (req, res) => {
  const { name, email, phone, address, password } = req.body;

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Error encrypting password' });

    const query = 'INSERT INTO workers(name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, phone, address, hash], (err, result) => {
      if (err) return res.status(500).json({ message: 'Worker signup failed' });

      res.json({ message: 'Worker registered successfully' });
    });
  });
});
// ✅ Worker login
// ✅ GET for sanity checks
app.get('/signup', (req, res) => {
  res.send('✅ Signup endpoint is working');
});

app.get('/worker/accept', (req, res) => {
  res.send('✅ Worker accept endpoint is working');
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM signup WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, results[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: results[0] });
  });
});
// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Signup backend running on http://localhost:${PORT}`);
});
