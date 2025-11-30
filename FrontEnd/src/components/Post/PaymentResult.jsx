import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './PaymentResult.css';

// Payment method logo mapping
const paymentLogos = {
  'bKash': 'https://freelogopng.com/images/all_img/1656234841bkash-app-logo-png.png',
  'Nagad': 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png',
  'Rocket': 'https://futurestartup.com/content/images/2021/03/DBBL-Mobile-Banking-Becomes-Rocket.jpg',
  'VISA': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
  'MASTER': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  'AMEX': 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
  'DBBL': 'https://futurestartup.com/content/images/2021/03/DBBL-Mobile-Banking-Becomes-Rocket.jpg',
  'UPAY': 'https://www.ucash.com.bd/assets/img/logo.png'
};

// Get payment method logo
const getPaymentLogo = (paymentMethod) => {
  if (!paymentMethod) return null;
  
  const method = paymentMethod.toUpperCase();
  
  // Check for exact matches
  if (paymentLogos[paymentMethod]) return paymentLogos[paymentMethod];
  
  // Check for partial matches
  if (method.includes('BKASH')) return paymentLogos['bKash'];
  if (method.includes('NAGAD')) return paymentLogos['Nagad'];
  if (method.includes('ROCKET') || method.includes('DBBL')) return paymentLogos['Rocket'];
  if (method.includes('VISA')) return paymentLogos['VISA'];
  if (method.includes('MASTER')) return paymentLogos['MASTER'];
  if (method.includes('AMEX')) return paymentLogos['AMEX'];
  
  return null;
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const transactionId = searchParams.get('transaction');
    if (transactionId) {
      fetchTransactionDetails(transactionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

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

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="loading-spinner">Loading...</div>
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
              <div className="payment-method-display">
                {getPaymentLogo(transaction.payment_method) && (
                  <img 
                    src={getPaymentLogo(transaction.payment_method)} 
                    alt={transaction.payment_method}
                    className="payment-method-logo"
                  />
                )}
                <strong>{transaction.payment_method || 'Online'}</strong>
              </div>
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
          <button onClick={() => navigate('/premium')} className="btn-primary">
            View Subscription
          </button>
          <button onClick={() => navigate('/home')} className="btn-secondary">
            Go to Home
          </button>
        </div>
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
