-- =====================================================
-- Recent Activity View for Payments Overview
-- =====================================================
-- This view combines payment_transactions (subscriptions) 
-- and user_transactions (P2P transfers) for unified display
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS recent_activity_view;

-- Create unified recent activity view
CREATE OR REPLACE VIEW recent_activity_view AS
-- Subscription Payment Transactions
SELECT 
    'payment' AS activity_type,
    pt.id,
    pt.user_id,
    pt.transaction_id::TEXT,
    pt.amount,
    pt.currency::TEXT,
    pt.payment_method::TEXT,
    pt.status::TEXT AS status,
    pt.subscription_id,
    s.plan_type::TEXT AS plan_type,
    CASE 
        WHEN pt.amount >= 1500 THEN 'Yearly Premium'
        WHEN pt.amount >= 150 THEN '30 Days Premium'
        WHEN pt.amount >= 99 THEN '15 Days Premium'
        ELSE 'Premium Subscription'
    END AS plan_name,
    NULL::INTEGER AS sender_id,
    NULL::TEXT AS sender_name,
    NULL::TEXT AS sender_username,
    NULL::TEXT AS sender_picture,
    NULL::INTEGER AS receiver_id,
    NULL::TEXT AS receiver_name,
    NULL::TEXT AS receiver_username,
    NULL::TEXT AS receiver_picture,
    NULL::TEXT AS notes,
    'Premium Subscription' AS description,
    pt.created_at,
    pt.updated_at
FROM payment_transactions pt
LEFT JOIN subscriptions s ON pt.subscription_id = s.id
WHERE pt.subscription_id IS NOT NULL

UNION ALL

-- User P2P Transactions
SELECT 
    'transaction' AS activity_type,
    ut.id,
    ut.sender_id AS user_id,
    CAST(ut.id AS TEXT) AS transaction_id,
    ut.amount,
    'BDT'::TEXT AS currency,
    NULL::TEXT AS payment_method,
    ut.status::TEXT AS status,
    NULL::INTEGER AS subscription_id,
    NULL::TEXT AS plan_type,
    NULL::TEXT AS plan_name,
    ut.sender_id,
    sender.full_name AS sender_name,
    sender.username AS sender_username,
    sender.profile_picture AS sender_picture,
    ut.receiver_id,
    receiver.full_name AS receiver_name,
    receiver.username AS receiver_username,
    receiver.profile_picture AS receiver_picture,
    ut.notes,
    CASE 
        WHEN ut.transaction_type = 'transfer' THEN 'Money Transfer'
        WHEN ut.transaction_type = 'payment' THEN 'Payment'
        WHEN ut.transaction_type = 'tip' THEN 'Tip'
        WHEN ut.transaction_type = 'refund' THEN 'Refund'
        ELSE INITCAP(ut.transaction_type::TEXT)
    END AS description,
    ut.created_at,
    ut.updated_at
FROM user_transactions ut
LEFT JOIN users sender ON ut.sender_id = sender.id
LEFT JOIN users receiver ON ut.receiver_id = receiver.id

ORDER BY created_at DESC;

-- =====================================================
-- Function to get user's recent activity
-- =====================================================

DROP FUNCTION IF EXISTS get_user_recent_activity(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_user_recent_activity(
    p_user_id INTEGER,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    activity_type TEXT,
    id INTEGER,
    transaction_id TEXT,
    amount DECIMAL,
    currency TEXT,
    payment_method TEXT,
    status TEXT,
    subscription_id INTEGER,
    plan_type TEXT,
    plan_name TEXT,
    sender_id INTEGER,
    sender_name TEXT,
    sender_username TEXT,
    sender_picture TEXT,
    receiver_id INTEGER,
    receiver_name TEXT,
    receiver_username TEXT,
    receiver_picture TEXT,
    notes TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    is_incoming BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ra.activity_type,
        ra.id,
        ra.transaction_id,
        ra.amount,
        ra.currency,
        ra.payment_method,
        ra.status,
        ra.subscription_id,
        ra.plan_type,
        ra.plan_name,
        ra.sender_id,
        ra.sender_name,
        ra.sender_username,
        ra.sender_picture,
        ra.receiver_id,
        ra.receiver_name,
        ra.receiver_username,
        ra.receiver_picture,
        ra.notes,
        ra.description,
        ra.created_at,
        -- Determine if transaction is incoming (for P2P only)
        CASE 
            WHEN ra.activity_type = 'transaction' AND ra.receiver_id = p_user_id THEN TRUE
            ELSE FALSE
        END AS is_incoming
    FROM recent_activity_view ra
    WHERE ra.user_id = p_user_id 
       OR ra.sender_id = p_user_id 
       OR ra.receiver_id = p_user_id
    ORDER BY ra.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Indexes for performance optimization
-- =====================================================

-- Index on payment_transactions for faster recent activity queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_created 
ON payment_transactions(user_id, created_at DESC);

-- Index on user_transactions for faster recent activity queries
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_created 
ON user_transactions(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_transactions_receiver_created 
ON user_transactions(receiver_id, created_at DESC);

-- Index on subscription_id for joins
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription 
ON payment_transactions(subscription_id) WHERE subscription_id IS NOT NULL;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON VIEW recent_activity_view IS 
'Unified view combining payment transactions (subscriptions) and user transactions (P2P transfers) for Recent Activity display';

COMMENT ON FUNCTION get_user_recent_activity IS 
'Retrieves user''s recent activity including both subscription payments and P2P transactions, sorted by date';

-- =====================================================
-- Example Usage
-- =====================================================

/*
-- Get recent activity for user ID 1 (default: 5 items)
SELECT * FROM get_user_recent_activity(1);

-- Get recent activity for user ID 1 (10 items)
SELECT * FROM get_user_recent_activity(1, 10);

-- Query the view directly
SELECT * FROM recent_activity_view 
WHERE user_id = 1 OR sender_id = 1 OR receiver_id = 1
ORDER BY created_at DESC
LIMIT 5;
*/
