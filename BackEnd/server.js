require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const passport = require('./config/passport');

const app = express();

// Enhanced database connection check
async function checkDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW(), current_database() as db');
    console.log('✅ Database connected:', result.rows[0].db);
    console.log('✅ Server time:', result.rows[0].now);
    
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
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Request logging (disable in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Gigs Backend API',
    status: 'running',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});