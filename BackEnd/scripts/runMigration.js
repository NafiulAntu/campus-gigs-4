require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration(migrationFile) {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Running migration: ${migrationFile}`);
    await pool.query(sql);
    console.log(`✅ Migration completed: ${migrationFile}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Please provide migration file name');
  console.log('Usage: node runMigration.js <migration-file.sql>');
  process.exit(1);
}

runMigration(migrationFile);
