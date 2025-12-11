-- ============================================
-- Verification System Migration
-- Features: ID Card Verification, Admin Roles
-- ============================================

-- 1. Add admin role and verification columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);

-- Add check constraint for valid roles
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_user_role;

ALTER TABLE users 
  ADD CONSTRAINT check_user_role 
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

COMMENT ON COLUMN users.role IS 'User role: user, admin, super_admin';
COMMENT ON COLUMN users.is_verified IS 'Whether user has completed ID verification';
COMMENT ON COLUMN users.verified_at IS 'When user was verified';
COMMENT ON COLUMN users.verified_by IS 'Admin who approved verification';

-- 2. Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'employee'
  
  -- ID Card information
  id_card_url TEXT NOT NULL,
  id_card_back_url TEXT, -- Optional back side of ID
  
  -- AWS Textract extracted data
  extracted_data JSONB DEFAULT '{}',
  
  -- Email verification
  email_verified BOOLEAN DEFAULT false,
  institutional_email VARCHAR(255),
  email_domain VARCHAR(100),
  
  -- Verification status
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraint for valid statuses
ALTER TABLE verification_requests 
  DROP CONSTRAINT IF EXISTS check_verification_status;

ALTER TABLE verification_requests 
  ADD CONSTRAINT check_verification_status 
  CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'resubmit_required'));

-- Add check constraint for valid user types
ALTER TABLE verification_requests 
  DROP CONSTRAINT IF EXISTS check_user_type;

ALTER TABLE verification_requests 
  ADD CONSTRAINT check_user_type 
  CHECK (user_type IN ('student', 'teacher', 'employee'));

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_created_at ON verification_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_reviewed_by ON verification_requests(reviewed_by);

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_verification_status_created 
  ON verification_requests(status, created_at DESC);

COMMENT ON TABLE verification_requests IS 'ID card and email verification requests';
COMMENT ON COLUMN verification_requests.user_type IS 'Type of user: student, teacher, employee';
COMMENT ON COLUMN verification_requests.extracted_data IS 'JSON data extracted from ID card via AWS Textract';
COMMENT ON COLUMN verification_requests.status IS 'Verification status: pending, processing, approved, rejected, resubmit_required';

-- 3. Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target_table VARCHAR(50),
  target_id INTEGER,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for admin logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_user ON admin_logs(target_user_id);

COMMENT ON TABLE admin_logs IS 'Audit log of all admin actions';
COMMENT ON COLUMN admin_logs.action IS 'Action performed: approve_verification, reject_verification, suspend_user, etc.';

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verification_updated_at ON verification_requests;

CREATE TRIGGER trigger_verification_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();

-- 5. Create view for pending verifications (admin dashboard)
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

COMMENT ON VIEW pending_verifications IS 'Quick view of all pending verification requests for admin dashboard';

-- 6. Create view for verification statistics
CREATE OR REPLACE VIEW verification_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'approved' AND created_at >= CURRENT_DATE - INTERVAL '7 days') as approved_last_7_days,
  COUNT(*) FILTER (WHERE status = 'approved' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as approved_last_30_days,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600) FILTER (WHERE reviewed_at IS NOT NULL) as avg_review_time_hours
FROM verification_requests;

COMMENT ON VIEW verification_stats IS 'Real-time statistics for admin dashboard';

-- 7. Create function to automatically update user verification status
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification is approved, update user table
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE users 
    SET 
      is_verified = true,
      verified_at = CURRENT_TIMESTAMP,
      verified_by = NEW.reviewed_by
    WHERE id = NEW.user_id;
    
    -- Log the action
    INSERT INTO admin_logs (admin_id, action, target_user_id, details)
    VALUES (
      NEW.reviewed_by,
      'approve_verification',
      NEW.user_id,
      jsonb_build_object(
        'verification_id', NEW.id,
        'user_type', NEW.user_type
      )
    );
  END IF;
  
  -- If verification is rejected and user was verified, remove verification
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status = 'approved') THEN
    UPDATE users 
    SET 
      is_verified = false,
      verified_at = NULL,
      verified_by = NULL
    WHERE id = NEW.user_id;
    
    -- Log the action
    INSERT INTO admin_logs (admin_id, action, target_user_id, details)
    VALUES (
      NEW.reviewed_by,
      'reject_verification',
      NEW.user_id,
      jsonb_build_object(
        'verification_id', NEW.id,
        'user_type', NEW.user_type,
        'reason', NEW.rejection_reason
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_verification ON verification_requests;

CREATE TRIGGER trigger_update_user_verification
  AFTER UPDATE OF status ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_user_verification_status();

-- 8. Insert default admin user (update email to your actual admin email)
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (full_name, email, password, role, terms_agreed, is_verified)
VALUES (
  'System Admin',
  'admin@campus-gigs.com',
  '$2a$10$K7L/0Qj9q.sJqKF4vxN5D.qcXGZxGKQJXVc0JqYVqZYZXqYVqZYZ.',  -- Replace with actual bcrypt hash
  'admin',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

-- Grant admin role to existing user (optional - update with your email)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- ============================================
-- Verification Complete!
-- ============================================

SELECT 
  'Verification system created successfully!' as status,
  (SELECT COUNT(*) FROM verification_requests) as verification_requests,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM users WHERE is_verified = true) as verified_users;
