import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import '../styles/PaymentResult.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingStripe, setVerifyingStripe] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transaction');
    
    if (sessionId) {
      // Stripe payment - verify session
      verifyStripeSession(sessionId);
    } else if (transactionId) {
      // Mock payment - fetch transaction
      fetchTransactionDetails(transactionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyStripeSession = async (sessionId) => {
    setVerifyingStripe(true);
    try {
      const response = await api.get(`/stripe/verify-session?session_id=${sessionId}`);
      
      if (response.data.success) {
        // Payment verified and subscription activated
        setTransaction({
          amount: response.data.amount,
          payment_method: 'Stripe',
          transaction_id: sessionId.substring(0, 20) + '...',
          status: 'completed'
        });
        setStripeError(null);
        
        // Redirect to Post section after 3 seconds
        setTimeout(() => {
          navigate('/post');
        }, 3000);
      } else {
        setStripeError(response.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Failed to verify Stripe session:', err);
      setStripeError(err.response?.data?.message || 'Failed to verify payment');
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
        <div className="loading-spinner">
          {verifyingStripe ? 'Verifying payment...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="payment-result-container">
        <div className="result-card error">
          <div className="icon-wrapper">
            <div className="error-icon">✗</div>
          </div>
          <h1>Payment Verification Failed</h1>
          <p className="subtitle">{stripeError}</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/premium')} className="btn-primary">
              Back to Premium
            </button>
          </div>
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
        
        <h1>Payment Successful!</h1>
        <p className="subtitle">Welcome to Campus Gigs Premium</p>

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
          <h3>🎉 Features Unlocked:</h3>
          <ul>
            <li>✓ Unlimited posts</li>
            <li>✓ Priority placement</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Premium badge</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/post')} className="btn-primary">
            Go to Posts
          </button>
          <button onClick={() => navigate('/premium')} className="btn-secondary">
            View Subscription
          </button>
        </div>
        
        <p className="redirect-notice" style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Redirecting to Posts in 3 seconds...
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
