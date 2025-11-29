-- Create user_transactions table for peer-to-peer money transfers
CREATE TABLE IF NOT EXISTS user_transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  transaction_type VARCHAR(50) DEFAULT 'transfer' CHECK (transaction_type IN ('transfer', 'payment', 'tip', 'refund')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_transactions_sender ON user_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_receiver ON user_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);

-- Add balance column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='balance') THEN
    ALTER TABLE users ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (balance >= 0);
  END IF;
END $$;

-- Create function to update user balances after transaction
CREATE OR REPLACE FUNCTION update_user_balances()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Deduct from sender
    UPDATE users SET balance = balance - NEW.amount WHERE id = NEW.sender_id;
    -- Add to receiver
    UPDATE users SET balance = balance + NEW.amount WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update balances
DROP TRIGGER IF EXISTS trigger_update_balances ON user_transactions;
CREATE TRIGGER trigger_update_balances
  AFTER INSERT OR UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balances();

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE ON user_transactions TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE user_transactions_id_seq TO PUBLIC;
