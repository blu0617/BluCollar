const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql'); // Revert: Import the original mysql package

const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Attach for later use

io.on('connection', (socket) => {
  console.log('🔌 Client connected via Socket.IO');

  socket.on('join-room', (profession) => {
    socket.join(profession);
    console.log(`👷 Joined room: ${profession}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Central MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'Signup',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Central MySQL DB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  } else {
    console.log('✅ Central MySQL DB connected successfully!');
  }
});

// Make the db connection available to routes
app.locals.db = db; // A common way to share the db connection

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 