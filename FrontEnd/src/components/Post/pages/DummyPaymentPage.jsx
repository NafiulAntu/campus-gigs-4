import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './DummyPaymentPage.css';

const DummyPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const transactionId = searchParams.get('transaction_id');
  const method = searchParams.get('method');
  const amount = searchParams.get('amount');
  const reference = searchParams.get('reference');

  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');

  // Payment method details
  const methodDetails = {
    bkash: {
      name: 'bKash',
      color: '#E2136E',
      icon: '💳',
      number: '01XXXXXXXXX'
    },
    nagad: {
      name: 'Nagad',
      color: '#F15B2A',
      icon: '📱',
      number: '01XXXXXXXXX'
    },
    rocket: {
      name: 'Rocket',
      color: '#8E3E63',
      icon: '🚀',
      number: '01XXXXXXXXX'
    }
  };

  const currentMethod = methodDetails[method] || methodDetails.bkash;

  const handlePayment = async (action) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dummy-mobile-wallet/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          action // 'success' or 'failed'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page
        navigate(`/payment-callback?transaction_id=${transactionId}&status=success&method=${method}`);
      } else {
        // Redirect to failed page
        navigate(`/payment-callback?transaction_id=${transactionId}&status=failed&method=${method}`);
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dummy-payment-page">
      <div className="dummy-payment-container" style={{ borderColor: currentMethod.color }}>
        {/* Header */}
        <div className="payment-header" style={{ backgroundColor: currentMethod.color }}>
          <div className="method-icon">{currentMethod.icon}</div>
          <h2>{currentMethod.name} Payment</h2>
          <p className="dummy-badge">🧪 DUMMY MODE - Testing Only</p>
        </div>

        {/* Payment Info */}
        <div className="payment-info">
          <div className="info-row">
            <span className="label">Amount:</span>
            <span className="value">{amount} TK</span>
          </div>
          <div className="info-row">
            <span className="label">Reference:</span>
            <span className="value reference">{reference}</span>
          </div>
          <div className="info-row">
            <span className="label">Merchant:</span>
            <span className="value">Campus Gigs</span>
          </div>
        </div>

        {/* Simulation Notice */}
        <div className="simulation-notice">
          <h3>⚠️ Test Mode Instructions</h3>
          <p>This is a dummy payment gateway for testing. No real money will be transferred.</p>
          <ul>
            <li>Enter any 5-digit PIN</li>
            <li>Click "Pay Now" to simulate successful payment</li>
            <li>Click "Cancel" to simulate payment failure</li>
          </ul>
        </div>

        {/* PIN Input */}
        <div className="pin-input-section">
          <label htmlFor="pin">Enter {currentMethod.name} PIN</label>
          <input
            id="pin"
            type="password"
            maxLength="5"
            placeholder="●●●●●"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="pin-input"
          />
          <p className="pin-hint">Enter any 5-digit number (e.g., 12345)</p>
        </div>

        {/* Action Buttons */}
        <div className="payment-actions">
          <button
            className="btn-pay"
            style={{ backgroundColor: currentMethod.color }}
            onClick={() => handlePayment('success')}
            disabled={loading || pin.length !== 5}
          >
            {loading ? '⏳ Processing...' : '✓ Pay Now (Simulate Success)'}
          </button>
          
          <button
            className="btn-cancel"
            onClick={() => handlePayment('failed')}
            disabled={loading}
          >
            ✗ Cancel Payment (Simulate Failure)
          </button>
        </div>

        {/* Footer */}
        <div className="payment-footer">
          <p>🔒 This is a secure dummy payment page</p>
          <p className="test-info">
            Transaction ID: {transactionId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DummyPaymentPage;
