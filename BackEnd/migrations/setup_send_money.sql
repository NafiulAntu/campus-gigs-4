-- ============================================
-- Send Money Feature - Complete Database Setup
-- ============================================

-- 1. Create user_transactions table for peer-to-peer money transfers
CREATE TABLE IF NOT EXISTS user_transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  transaction_type VARCHAR(50) DEFAULT 'transfer' CHECK (transaction_type IN ('transfer', 'payment', 'tip', 'refund')),
  payment_method VARCHAR(50) DEFAULT 'bkash' CHECK (payment_method IN ('bkash', 'nagad', 'rocket', 'card', 'bank')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_transactions_sender ON user_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_receiver ON user_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_transactions_payment_method ON user_transactions(payment_method);

-- 3. Add balance column to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='balance') THEN
    ALTER TABLE users ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (balance >= 0);
  END IF;
END $$;

-- 4. Add payment preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"bkash": true, "nagad": true, "rocket": true, "card": false}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_payments BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_note TEXT;

-- 5. Create function to update user balances after transaction
CREATE OR REPLACE FUNCTION update_user_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Only update balances for completed transactions
    IF NEW.status = 'completed' THEN
      -- Deduct from sender
      UPDATE users SET balance = balance - NEW.amount WHERE id = NEW.sender_id;
      -- Add to receiver
      UPDATE users SET balance = balance + NEW.amount WHERE id = NEW.receiver_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update balances
DROP TRIGGER IF EXISTS trigger_update_user_balances ON user_transactions;
CREATE TRIGGER trigger_update_user_balances
AFTER INSERT ON user_transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_balances();

-- 7. Create function to get user transaction history
CREATE OR REPLACE FUNCTION get_user_transaction_history(user_id_param INTEGER, limit_param INTEGER DEFAULT 50)
RETURNS TABLE (
  transaction_id INTEGER,
  other_user_id INTEGER,
  other_user_name VARCHAR,
  other_user_username VARCHAR,
  other_user_picture TEXT,
  amount DECIMAL,
  transaction_type VARCHAR,
  payment_method VARCHAR,
  is_sender BOOLEAN,
  notes TEXT,
  status VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    CASE 
      WHEN t.sender_id = user_id_param THEN t.receiver_id
      ELSE t.sender_id
    END,
    CASE 
      WHEN t.sender_id = user_id_param THEN u_receiver.full_name
      ELSE u_sender.full_name
    END,
    CASE 
      WHEN t.sender_id = user_id_param THEN u_receiver.username
      ELSE u_sender.username
    END,
    CASE 
      WHEN t.sender_id = user_id_param THEN u_receiver.profile_picture
      ELSE u_sender.profile_picture
    END,
    t.amount,
    t.transaction_type,
    t.payment_method,
    t.sender_id = user_id_param,
    t.notes,
    t.status,
    t.created_at
  FROM user_transactions t
  LEFT JOIN users u_sender ON t.sender_id = u_sender.id
  LEFT JOIN users u_receiver ON t.receiver_id = u_receiver.id
  WHERE t.sender_id = user_id_param OR t.receiver_id = user_id_param
  ORDER BY t.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get user balance with transaction count
CREATE OR REPLACE FUNCTION get_user_balance_info(user_id_param INTEGER)
RETURNS TABLE (
  balance DECIMAL,
  total_sent DECIMAL,
  total_received DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.balance,
    COALESCE(SUM(CASE WHEN t.sender_id = user_id_param THEN t.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.receiver_id = user_id_param THEN t.amount ELSE 0 END), 0),
    COUNT(t.id)
  FROM users u
  LEFT JOIN user_transactions t ON (t.sender_id = user_id_param OR t.receiver_id = user_id_param)
  WHERE u.id = user_id_param
  GROUP BY u.balance;
END;
$$ LANGUAGE plpgsql;

-- 9. Add sample test balance to existing users (optional - remove in production)
-- UPDATE users SET balance = 10000.00 WHERE balance = 0;

-- 10. Create view for transaction summary
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.username,
  u.balance,
  COUNT(CASE WHEN t.sender_id = u.id THEN 1 END) as sent_count,
  COUNT(CASE WHEN t.receiver_id = u.id THEN 1 END) as received_count,
  COALESCE(SUM(CASE WHEN t.sender_id = u.id AND t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_sent,
  COALESCE(SUM(CASE WHEN t.receiver_id = u.id AND t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_received
FROM users u
LEFT JOIN user_transactions t ON (t.sender_id = u.id OR t.receiver_id = u.id)
GROUP BY u.id, u.full_name, u.username, u.balance;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_transactions', 'users');

-- Check if columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name IN ('balance', 'payment_methods', 'allow_payments');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'user_transactions';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_name IN ('update_user_balances', 'get_user_transaction_history', 'get_user_balance_info');

-- ============================================
-- Success Message
-- ============================================
SELECT '✅ Send Money Database Setup Complete!' as status;
