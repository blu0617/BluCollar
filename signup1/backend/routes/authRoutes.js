const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// User Signup with password hashing
router.post('/signup', (req, res) => {
  const { name, email, phone, address, password } = req.body;
  const db = req.app.locals.db; // Access the shared DB connection

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

// User login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.app.locals.db; // Access the shared DB connection

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

module.exports = router; 