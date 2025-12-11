const pool = require('../config/db');

async function createVerificationTable() {
  try {
    console.log('🔧 Creating verification_requests table...');

    // Create verification_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_type VARCHAR(20) NOT NULL,
        
        id_card_url TEXT NOT NULL,
        id_card_back_url TEXT,
        
        extracted_data JSONB DEFAULT '{}',
        
        email_verified BOOLEAN DEFAULT false,
        institutional_email VARCHAR(255),
        email_domain VARCHAR(100),
        
        status VARCHAR(20) DEFAULT 'pending',
        reviewed_by INTEGER REFERENCES users(id),
        rejection_reason TEXT,
        admin_notes TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ verification_requests table created');

    // Add check constraint for valid statuses
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_verification_status'
        ) THEN
          ALTER TABLE verification_requests
          ADD CONSTRAINT check_verification_status
          CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'resubmit_required'));
        END IF;
      END $$;
    `);
    console.log('✅ Status constraint added');

    // Add check constraint for valid user types
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_user_type'
        ) THEN
          ALTER TABLE verification_requests
          ADD CONSTRAINT check_user_type
          CHECK (user_type IN ('student', 'teacher', 'employee'));
        END IF;
      END $$;
    `);
    console.log('✅ User type constraint added');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);
      CREATE INDEX IF NOT EXISTS idx_verification_user_id ON verification_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_created_at ON verification_requests(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_verification_status_created ON verification_requests(status, created_at DESC);
    `);
    console.log('✅ Indexes created');

    // Create trigger to update updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_verification_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_verification_updated_at ON verification_requests;
      CREATE TRIGGER trigger_verification_updated_at
        BEFORE UPDATE ON verification_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_verification_updated_at();
    `);
    console.log('✅ Triggers created');

    // Create view for pending verifications
    await pool.query(`
      CREATE OR REPLACE VIEW pending_verifications AS
      SELECT
        vr.id,
        vr.user_id,
        vr.user_type,
        vr.id_card_url,
        vr.id_card_back_url,
        vr.extracted_data,
        vr.institutional_email,
        vr.email_domain,
        vr.status,
        vr.created_at,
        u.full_name,
        u.email,
        u.username,
        u.profile_picture,
        u.profession
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at ASC;
    `);
    console.log('✅ pending_verifications view created');

    // Check results
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'verification_requests'
    `);

    console.log('\n📊 Migration complete:');
    console.log(`  - verification_requests table: ${tableCheck.rows[0].count > 0 ? '✅ Exists' : '❌ Missing'}`);

    const recordCount = await pool.query('SELECT COUNT(*) as count FROM verification_requests');
    console.log(`  - Current verification requests: ${recordCount.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

createVerificationTable();
