-- Add mobile wallet payment integration columns
-- Run this migration to support bKash, Nagad, and Rocket payment gateways

-- Add payment_method and payment_reference columns to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_status_payment_method ON transactions(status, payment_method);

-- Add comments for documentation
COMMENT ON COLUMN transactions.payment_method IS 'Payment gateway used: bkash, nagad, rocket, or null for internal wallet';
COMMENT ON COLUMN transactions.payment_reference IS 'JSON data containing payment gateway transaction reference';

SELECT '✅ Mobile wallet columns added successfully!' as status;
