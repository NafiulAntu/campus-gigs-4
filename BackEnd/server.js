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

// Enhanced database connection check
async function checkDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW(), current_database() as db');
    console.log('✅ Database connected:', result.rows[0].db);
    console.log('✅ Server time:', result.rows[0].now);
    
    // Sync Teacher, Student, and Employee models with database
    await sequelize.sync({ alter: true });  // Use { force: true } for dev only
    console.log('✅ Teacher, Student, and Employee models synced with database');
    
    // Check if users table exists
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (tableCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`✅ Users table ready (${count.rows[0].count} users)`);
    } else {
      console.log('⚠️  Users table not found.');
    }
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('⚠️  Please check your .env file and PostgreSQL configuration');
  }
}

checkDatabaseConnection();

// Middleware
app.use(cors({
  origin: ['http://localhost:3004', 'http://localhost:3005', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Initialize Passport
app.use(passport.initialize());

// Request logging (disable in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
  
  // Log 404 errors
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 404) {
        console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
      }
      originalSend.call(this, data);
    };
    next();
  });
}

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

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

// Simple route test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

console.log('\n✅ All routes registered successfully');

app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Gigs Backend API',
    status: 'running',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      teachers: {
        createOrUpdateProfile: 'POST /api/teachers/profile (auth required)',
        getProfile: 'GET /api/teachers/:username (auth required)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;

// Create HTTP server for Socket.io
const http = require('http');
const httpServer = http.createServer(app);

// Initialize Socket.io server
const { createSocketServer } = require('./socketServer');
const io = createSocketServer(httpServer);
console.log('✅ Socket.io server initialized');

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server ready for connections`);
});