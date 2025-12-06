-- Add SSLCommerz specific columns to payment_transactions table

-- First ensure the table exists
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BDT',
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add SSLCommerz specific columns
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ssl_val_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ssl_card_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS ssl_card_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS ssl_bank_tran_id VARCHAR(255);

-- Update status enum to include 'completed'
-- Note: This will create a new enum type and update the column
DO $$ 
BEGIN
  -- Check if we need to update the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'completed' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'payment_transactions_status'
    )
  ) THEN
    -- Add the new enum value
    ALTER TYPE payment_transactions_status ADD VALUE IF NOT EXISTS 'completed';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If enum doesn't exist, the column might be VARCHAR, which is fine
    NULL;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ssl_val_id ON payment_transactions(ssl_val_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ssl_bank_tran_id ON payment_transactions(ssl_bank_tran_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_plan_type ON payment_transactions(plan_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_intent_id ON payment_transactions(payment_intent_id);

-- Add comments for documentation
COMMENT ON COLUMN payment_transactions.plan_type IS 'Subscription plan type: 15days, 30days, yearly';
COMMENT ON COLUMN payment_transactions.payment_intent_id IS 'Payment gateway intent/validation ID (Stripe or SSLCommerz)';
COMMENT ON COLUMN payment_transactions.ssl_val_id IS 'SSLCommerz validation ID';
COMMENT ON COLUMN payment_transactions.ssl_card_type IS 'Card type used (e.g., VISA, MASTERCARD)';
COMMENT ON COLUMN payment_transactions.ssl_card_brand IS 'Card brand/issuer';
COMMENT ON COLUMN payment_transactions.ssl_bank_tran_id IS 'Bank transaction ID from SSLCommerz';

SELECT '✅ SSLCommerz columns added to payment_transactions successfully!' as status;
