import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Premium.css';

const Premium = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const handleUpgrade = async (planType) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/payments/initiate', { plan_type: planType });
      
      if (response.data.success && response.data.gateway_url) {
        // Redirect to SSLCommerz payment gateway
        window.location.href = response.data.gateway_url;
      } else {
        setError('Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.response?.data?.error || 'Failed to start payment process');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel auto-renewal?')) return;

    try {
      const response = await api.post('/subscription/cancel');
      alert(response.data.message);
      checkSubscriptionStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await api.post('/subscription/reactivate');
      alert(response.data.message);
      checkSubscriptionStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reactivate subscription');
    }
  };

  if (subscription?.is_premium) {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fi fi-br-arrow-left text-white text-xl"></i>
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Premium</h2>
              <p className="text-sm text-gray-400">You're Premium!</p>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="premium-container">
            <div className="premium-header">
              <h1>🎉 You're Premium!</h1>
              <p>Enjoying all the exclusive features</p>
            </div>

        <div className="subscription-details">
          <div className="detail-card">
            <h3>Current Plan</h3>
            <p className="plan-type">{subscription.subscription.plan_type === 'monthly' ? 'Monthly' : 'Yearly'}</p>
            <p className="price">৳{subscription.subscription.plan_type === 'monthly' ? '299' : '2,999'}/
              {subscription.subscription.plan_type === 'monthly' ? 'month' : 'year'}
            </p>
          </div>

          <div className="detail-card">
            <h3>Status</h3>
            <p className={`status ${subscription.subscription.status}`}>
              {subscription.subscription.status.toUpperCase()}
            </p>
            <p className="expiry">
              {subscription.subscription.days_remaining > 0 
                ? `${subscription.subscription.days_remaining} days remaining`
                : 'Expired'}
            </p>
          </div>

          <div className="detail-card">
            <h3>Auto-Renewal</h3>
            <p className={subscription.subscription.auto_renew ? 'enabled' : 'disabled'}>
              {subscription.subscription.auto_renew ? '✓ Enabled' : '✗ Disabled'}
            </p>
            {subscription.subscription.auto_renew ? (
              <button onClick={handleCancelSubscription} className="cancel-btn">
                Turn Off Auto-Renewal
              </button>
            ) : (
              <button onClick={handleReactivate} className="reactivate-btn">
                Turn On Auto-Renewal
              </button>
            )}
          </div>
        </div>

        <div className="features-section">
          <h2>Your Premium Features</h2>
          <div className="features-grid">
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Unlimited Posts</span>
            </div>
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Priority Placement</span>
            </div>
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Advanced Analytics</span>
            </div>
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Premium Badge</span>
            </div>
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Read Receipts</span>
            </div>
            <div className="feature-item active">
              <span className="icon">✓</span>
              <span>Pin Posts</span>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={onBack}
            className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <i className="fi fi-br-arrow-left text-white text-xl"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Premium</h2>
            <p className="text-sm text-gray-400">Upgrade your account</p>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="premium-container">
          <div className="premium-hero">
            <h1>Upgrade to Premium</h1>
            <p>Unlock powerful features to grow your presence on Campus Gigs</p>
          </div>

      {error && <div className="error-message">{error}</div>}

      <div className="pricing-cards">
        {/* Monthly Plan */}
        <div className="pricing-card">
          <div className="plan-header">
            <h3>Monthly</h3>
            <div className="price">
              <span className="currency">৳</span>
              <span className="amount">299</span>
              <span className="period">/month</span>
            </div>
          </div>

          <ul className="features-list">
            <li>✓ Unlimited posts per month</li>
            <li>✓ Priority placement in search</li>
            <li>✓ Advanced analytics dashboard</li>
            <li>✓ Premium badge on profile</li>
            <li>✓ Message read receipts</li>
            <li>✓ Pin posts to profile</li>
            <li>✓ Custom profile themes</li>
            <li>✓ Early access to new features</li>
          </ul>

          <button 
            onClick={() => handleUpgrade('monthly')}
            disabled={loading}
            className="upgrade-btn"
          >
            {loading ? 'Processing...' : 'Upgrade Monthly'}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="pricing-card featured">
          <div className="badge">Best Value</div>
          <div className="plan-header">
            <h3>Yearly</h3>
            <div className="price">
              <span className="currency">৳</span>
              <span className="amount">2,999</span>
              <span className="period">/year</span>
            </div>
            <p className="savings">Save ৳589 (17% off)</p>
          </div>

          <ul className="features-list">
            <li>✓ Everything in Monthly</li>
            <li>✓ 2 months free</li>
            <li>✓ Priority support</li>
            <li>✓ Exclusive yearly features</li>
          </ul>

          <button 
            onClick={() => handleUpgrade('yearly')}
            disabled={loading}
            className="upgrade-btn featured"
          >
            {loading ? 'Processing...' : 'Upgrade Yearly'}
          </button>
        </div>
      </div>

      <div className="payment-methods">
        <h3>Secure Payment via SSLCommerz</h3>
        <div className="methods">
          <span>bKash</span>
          <span>Nagad</span>
          <span>Rocket</span>
          <span>Cards</span>
          <span>Banking</span>
        </div>
      </div>

      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-item">
          <h4>Can I cancel anytime?</h4>
          <p>Yes, you can turn off auto-renewal anytime. You'll continue to have premium access until the end of your billing period.</p>
        </div>
        <div className="faq-item">
          <h4>What payment methods are accepted?</h4>
          <p>We accept bKash, Nagad, Rocket, all major credit/debit cards, and internet banking through SSLCommerz.</p>
        </div>
        <div className="faq-item">
          <h4>Is my payment information secure?</h4>
          <p>Absolutely! We use SSLCommerz, Bangladesh's leading payment gateway with PCI DSS Level 1 certification.</p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
