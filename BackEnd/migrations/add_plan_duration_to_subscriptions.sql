-- Add plan_duration column to subscriptions table
-- This will store the original plan duration (15days, 30days, yearly)
-- while plan_type continues to store the enum (monthly, yearly)

-- Add the plan_duration column
ALTER TABLE subscriptions 
ADD COLUMN plan_duration VARCHAR(20);

-- Add comment for clarity
COMMENT ON COLUMN subscriptions.plan_duration IS 'Original plan duration: 15days, 30days, or yearly';

-- Create index for better query performance
CREATE INDEX idx_subscriptions_plan_duration ON subscriptions(plan_duration);

-- Update existing records to have plan_duration based on plan_type
-- For now, set monthly to 30days (we can't distinguish old 15days from 30days)
UPDATE subscriptions 
SET plan_duration = CASE 
  WHEN plan_type = 'yearly' THEN 'yearly'
  WHEN plan_type = 'monthly' THEN '30days'
  ELSE '30days'
END
WHERE plan_duration IS NULL;

-- Show results
SELECT id, user_id, plan_type, plan_duration, status, start_date, end_date 
FROM subscriptions 
ORDER BY created_at DESC 
LIMIT 10;
