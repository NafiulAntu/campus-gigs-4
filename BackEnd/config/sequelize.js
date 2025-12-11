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
    logging: false, // Disabled for clean logs
    pool: {
      max: 10, // Increased from 5 to 10
      min: 2, // Keep 2 connections always ready
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection once
let isSequelizeConnected = false;
sequelize.authenticate()
  .then(() => {
    if (!isSequelizeConnected) {
      console.log('✅ Sequelize Pool Connected (Max: 10 connections)');
      isSequelizeConnected = true;
    }
  })
  .catch(err => console.error('❌ Sequelize connection error:', err));

module.exports = sequelize;
