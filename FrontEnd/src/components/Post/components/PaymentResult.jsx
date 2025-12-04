import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import '../styles/PaymentResult.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingStripe, setVerifyingStripe] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const navigate = useNavigate();

  console.log('🎉 PaymentSuccess component mounted');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transaction');
    
    console.log('🔍 Payment params:', { sessionId, transactionId });
    
    if (sessionId) {
      // Stripe payment - verify session
      console.log('💳 Verifying Stripe session...');
      verifyStripeSession(sessionId);
    } else if (transactionId) {
      // Mock payment - fetch transaction
      console.log('💰 Fetching mock transaction...');
      fetchTransactionDetails(transactionId);
    } else {
      console.log('⚠️ No payment params found');
      setLoading(false);
    }
  }, [searchParams]);

  const refreshUserData = async () => {
    try {
      // Fetch updated user data to get premium status
      const userResponse = await api.get('/users/me');
      if (userResponse.data) {
        // Update localStorage with new user data including premium status
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...userResponse.data,
          is_premium: userResponse.data.is_premium
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ User data refreshed with premium status:', updatedUser.is_premium);
      }
      
      // Also fetch subscription details
      const subResponse = await api.get('/subscription/status');
      if (subResponse.data && subResponse.data.is_premium) {
        setSubscription(subResponse.data.subscription);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const verifyStripeSession = async (sessionId) => {
    setVerifyingStripe(true);
    console.log('🔄 Starting Stripe verification for session:', sessionId);
    try {
      const response = await api.get(`/stripe/verify-session?session_id=${sessionId}`);
      console.log('📊 Stripe verification response:', response.data);
      
      if (response.data.success) {
        // Payment verified and subscription activated
        console.log('✅ Payment verified successfully!');
        setTransaction({
          amount: response.data.amount,
          payment_method: 'Stripe',
          transaction_id: sessionId.substring(0, 20) + '...',
          status: 'completed'
        });
        setStripeError(null);
        
        // Refresh user data to update premium status
        console.log('🔄 Refreshing user data...');
        await refreshUserData();
        
        // Redirect to Premium section after 5 seconds (give time to see success message)
        console.log('➡️ Will redirect to /premium in 5 seconds');
        setTimeout(() => {
          navigate('/premium');
        }, 5000);
      } else {
        // Even if verification fails, refresh user data and redirect to Premium
        console.log('⚠️ Payment already processed or session expired, refreshing user data...');
        await refreshUserData();
        setTimeout(() => {
          navigate('/premium');
        }, 5000);
      }
    } catch (err) {
      console.error('Failed to verify Stripe session:', err);
      // On error, still refresh user data and redirect to Premium
      console.log('Verification error, refreshing user data and redirecting...');
      await refreshUserData();
      setTimeout(() => {
        navigate('/premium');
      }, 5000);
    } finally {
      setLoading(false);
      setVerifyingStripe(false);
    }
  };

  const fetchTransactionDetails = async (transactionId) => {
    try {
      const response = await api.get(`/payments/transaction/${transactionId}`);
      setTransaction(response.data);
    } catch (err) {
      console.error('Failed to fetch transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || verifyingStripe) {
    return (
      <div className="payment-result-container">
        <div className="result-card success">
          <div className="loading-spinner">
            <div style={{ marginBottom: '1rem' }}>
              {verifyingStripe ? '🎉 Payment Successful!' : 'Loading...'}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {verifyingStripe ? 'Activating your premium subscription...' : 'Please wait...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stripeError) {
    // Don't show error, just redirect to Premium (payment likely already processed)
    setTimeout(() => {
      navigate('/premium');
    }, 3000);
    
    return (
      <div className="payment-result-container">
        <div className="result-card success">
          <div className="icon-wrapper">
            <div className="success-icon">✓</div>
          </div>
          <h1>Thank You!</h1>
          <p className="subtitle">Redirecting you to Premium in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="result-card success">
        <div className="icon-wrapper">
          <div className="success-icon">✓</div>
        </div>
        
        <h1>🎉 Premium Activated!</h1>
        <p className="subtitle">Welcome to Campus Gigs Premium</p>

        {subscription && (
          <div className="premium-status-card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            margin: '1.5rem 0',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                {subscription.plan_name}
              </h3>
              <div style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                {subscription.status.toUpperCase()}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <div style={{ opacity: 0.8 }}>Start Date</div>
                <div style={{ fontWeight: 'bold' }}>
                  {new Date(subscription.start_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ opacity: 0.8 }}>Expires On</div>
                <div style={{ fontWeight: 'bold' }}>
                  {new Date(subscription.expiry_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {subscription.days_remaining && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px'
              }}>
                <strong>{subscription.days_remaining}</strong> days remaining
              </div>
            )}
          </div>
        )}

        {transaction && (
          <div className="transaction-details">
            <div className="detail-row">
              <span>Amount Paid:</span>
              <strong>৳{transaction.amount}</strong>
            </div>
            <div className="detail-row">
              <span>Transaction ID:</span>
              <strong>{transaction.transaction_id}</strong>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <strong>{transaction.payment_method || 'Online'}</strong>
            </div>
          </div>
        )}

        <div className="features-unlocked">
          <h3>✨ Premium Features Active:</h3>
          <ul>
            <li>✓ Unlimited posts</li>
            <li>✓ Priority placement</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Premium badge</li>
            <li>✓ Read receipts</li>
            <li>✓ Priority support</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/premium')} className="btn-primary">
            View My Premium
          </button>
          <button onClick={() => navigate('/post')} className="btn-secondary">
            Go to Posts
          </button>
        </div>
        
        <p className="redirect-notice" style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Automatically redirecting to Premium section in 5 seconds...
        </p>
      </div>
    </div>
  );
};

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = searchParams.get('transaction');

  return (
    <div className="payment-result-container">
      <div className="result-card failed">
        <div className="icon-wrapper">
          <div className="failed-icon">✗</div>
        </div>
        
        <h1>Payment Failed</h1>
        <p className="subtitle">Your payment could not be processed</p>

        {transactionId && (
          <div className="transaction-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <strong>{transactionId}</strong>
            </div>
          </div>
        )}

        <div className="error-info">
          <p>This could happen due to:</p>
          <ul>
            <li>Insufficient funds</li>
            <li>Bank declined the transaction</li>
            <li>Network issues</li>
            <li>Incorrect payment details</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/premium')} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate('/home')} className="btn-secondary">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-result-container">
      <div className="result-card cancelled">
        <div className="icon-wrapper">
          <div className="cancelled-icon">⊗</div>
        </div>
        
        <h1>Payment Cancelled</h1>
        <p className="subtitle">You cancelled the payment process</p>

        <p className="message">
          No charges were made to your account. You can try again whenever you're ready to upgrade.
        </p>

        <div className="action-buttons">
          <button onClick={() => navigate('/premium')} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate('/home')} className="btn-secondary">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export { PaymentSuccess, PaymentFailed, PaymentCancelled };
