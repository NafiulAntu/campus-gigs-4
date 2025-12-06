-- Add SSLCommerz specific columns to transactions table

-- First, create the transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  transaction_type VARCHAR(50) DEFAULT 'send_money',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_reference TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns for SSLCommerz transaction tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS ssl_session_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS ssl_val_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ssl_card_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS ssl_card_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS ssl_bank_tran_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS refund_ref_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_ssl_val_id ON transactions(ssl_val_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ssl_bank_tran_id ON transactions(ssl_bank_tran_id);
CREATE INDEX IF NOT EXISTS idx_transactions_refund_status ON transactions(refund_status);

-- Add comments for documentation
COMMENT ON COLUMN transactions.ssl_session_key IS 'SSLCommerz session key for tracking';
COMMENT ON COLUMN transactions.ssl_val_id IS 'SSLCommerz validation ID';
COMMENT ON COLUMN transactions.ssl_card_type IS 'Card type used (e.g., VISA, MASTERCARD)';
COMMENT ON COLUMN transactions.ssl_card_brand IS 'Card brand/issuer';
COMMENT ON COLUMN transactions.ssl_bank_tran_id IS 'Bank transaction ID from SSLCommerz';
COMMENT ON COLUMN transactions.refund_status IS 'Refund status: initiated, processing, completed, failed';
COMMENT ON COLUMN transactions.refund_amount IS 'Amount refunded';
COMMENT ON COLUMN transactions.refund_ref_id IS 'Reference ID for refund transaction';
COMMENT ON COLUMN transactions.completed_at IS 'Timestamp when transaction was completed';

-- Check the updated structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
