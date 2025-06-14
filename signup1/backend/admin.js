// Get all job requests
app.get('/admin/job-requests', (req, res) => {
  db.query('SELECT * FROM job_requests', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching job requests' });
    res.json(results);
  });
});

// Get all users
app.get('/admin/users', (req, res) => {
  db.query('SELECT * FROM signup', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(results);
  });
});

// Get all workers
app.get('/admin/workers', (req, res) => {
  db.query('SELECT * FROM workers', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching workers' });
    res.json(results);
  });
});
