require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const sequelize = require('./config/sequelize');
const passport = require('./config/passport');
const Teacher = require('./models/Teacher');
const Employee = require('./models/Employee');
const Student = require('./models/Student');

const app = express();

// Database connection
(async () => {
  try {
    const result = await pool.query('SELECT current_database() as db');
    console.log('✅ Database connected:', result.rows[0].db);
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (err) {
    console.error('❌ Database error:', err.message);
  }
})();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Initialize Passport
app.use(passport.initialize());

// Static files - serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Campus Gigs API', status: 'running' });
});

// Debug endpoint to check Socket.io status
app.get('/api/debug/socket-rooms', (req, res) => {
  const io = req.app.get('io');
  if (!io) {
    return res.json({ error: 'Socket.io not initialized' });
  }

  const rooms = [];
  const sockets = [];

  io.sockets.sockets.forEach((socket) => {
    sockets.push({
      id: socket.id,
      firebaseUid: socket.userId,
      pgUserId: socket.pgUserId,
      rooms: Array.from(socket.rooms)
    });
  });

  res.json({
    connectedSockets: io.sockets.sockets.size,
    sockets,
    serverRooms: Array.from(io.sockets.adapter.rooms.keys())
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.io
const http = require('http');
const httpServer = http.createServer(app);

// Initialize Socket.io server
const { createSocketServer } = require('./socketServer');
const io = createSocketServer(httpServer);

// Store io instance in app for controllers to access
app.set('io', io);

// Middleware to inject io into all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});