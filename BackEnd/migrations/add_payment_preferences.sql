-- Add payment preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"bkash": false, "nagad": false, "rocket": false, "card": false}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_payments BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_note TEXT;
