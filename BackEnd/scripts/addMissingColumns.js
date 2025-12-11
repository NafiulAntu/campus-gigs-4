require('dotenv').config();
const pool = require('../config/db');

async function checkAndAddColumns() {
  try {
    console.log('📋 Checking users table structure...\n');
    
    // Get current columns
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''})`);
    });
    
    const existingColumns = result.rows.map(r => r.column_name);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)', check: 'phone' },
      { name: 'is_verified', type: 'BOOLEAN DEFAULT false', check: 'is_verified' },
      { name: 'verified_at', type: 'TIMESTAMP', check: 'verified_at' },
      { name: 'verified_by', type: 'INTEGER REFERENCES users(id)', check: 'verified_by' },
      { name: 'is_premium', type: 'BOOLEAN DEFAULT false', check: 'is_premium' },
      { name: 'premium_until', type: 'TIMESTAMP', check: 'premium_until' },
      { name: 'balance', type: 'DECIMAL(10,2) DEFAULT 0', check: 'balance' }
    ];
    
    console.log('\n📝 Adding missing columns...\n');
    
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.check)) {
        try {
          await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✅ Added column: ${col.name}`);
        } catch (e) {
          if (e.code === '42701') {
            console.log(`⏭️  Column ${col.name} already exists`);
          } else {
            throw e;
          }
        }
      } else {
        console.log(`⏭️  Column ${col.name} already exists`);
      }
    }
    
    console.log('\n✅ All required columns are now present!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndAddColumns();
