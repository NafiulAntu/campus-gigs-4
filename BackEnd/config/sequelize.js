require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'PG Antu',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'antu@1972',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ Sequelize connected to PostgreSQL'))
  .catch(err => console.error('❌ Sequelize connection error:', err));

module.exports = sequelize;
