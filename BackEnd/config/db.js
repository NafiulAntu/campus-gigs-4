require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

let isConnected = false;

pool.on('connect', () => {
  if (!isConnected) {
    console.log('✅ PostgreSQL Pool Connected - Database: PG Antu (Max: 20 connections)');
    isConnected = true;
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;