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
        {/* Free Plan */}
        <div className="pricing-card free-plan">
          <div className="plan-badge">Free</div>
          <div className="plan-header">
            <div className="plan-icon">
              <i className="fi fi-br-rocket"></i>
            </div>
            <h3>Free</h3>
            <div className="price">
              <span className="currency">৳</span>
              <span className="amount">0</span>
              <span className="period">/forever</span>
            </div>
          </div>

          <ul className="features-list">
            <li><i className="fi fi-br-check"></i> 5 posts per month</li>
            <li><i className="fi fi-br-check"></i> Basic profile features</li>
            <li><i className="fi fi-br-check"></i> Join communities</li>
            <li><i className="fi fi-br-check"></i> Send messages</li>
            <li><i className="fi fi-br-check"></i> Basic search</li>
          </ul>

          <button 
            disabled
            className="upgrade-btn current-plan"
          >
            <i className="fi fi-br-check-circle"></i>
            Current Plan
          </button>
        </div>

        {/* 15 Days Plan */}
        <div className="pricing-card starter-plan">
          <div className="plan-badge">Try Premium</div>
          <div className="plan-header">
            <div className="plan-icon">
              <i className="fi fi-br-star"></i>
            </div>
            <h3>15 Days</h3>
            <div className="price">
              <span className="currency">৳</span>
              <span className="amount">99</span>
              <span className="period">/15 days</span>
            </div>
          </div>

          <ul className="features-list">
            <li><i className="fi fi-br-check"></i> Unlimited posts</li>
            <li><i className="fi fi-br-check"></i> Premium badge</li>
            <li><i className="fi fi-br-check"></i> Priority placement</li>
            <li><i className="fi fi-br-check"></i> Basic analytics</li>
            <li><i className="fi fi-br-check"></i> Read receipts</li>
            <li><i className="fi fi-br-check"></i> Try all features</li>
          </ul>

          <button 
            onClick={() => handleUpgrade('15days')}
            disabled={loading}
            className="upgrade-btn starter"
          >
            {loading ? (
              <>
                <i className="fi fi-rr-spinner animate-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fi fi-br-shopping-cart"></i>
                Get 15 Days
              </>
            )}
          </button>
        </div>

        {/* 30 Days Plan */}
        <div className="pricing-card premium-plan featured">
          <div className="plan-badge popular">
            <i className="fi fi-br-crown"></i> Most Popular
          </div>
          <div className="plan-header">
            <div className="plan-icon">
              <i className="fi fi-br-diamond"></i>
            </div>
            <h3>30 Days</h3>
            <div className="price">
              <span className="currency">৳</span>
              <span className="amount">150</span>
              <span className="period">/month</span>
            </div>
            <p className="savings">
              <i className="fi fi-br-badge-percent"></i>
              Best value for monthly
            </p>
          </div>

          <ul className="features-list">
            <li><i className="fi fi-br-check"></i> Everything in 15 Days</li>
            <li><i className="fi fi-br-check"></i> Advanced analytics</li>
            <li><i className="fi fi-br-check"></i> Pin posts to profile</li>
            <li><i className="fi fi-br-check"></i> Custom themes</li>
            <li><i className="fi fi-br-check"></i> Priority support</li>
            <li><i className="fi fi-br-check"></i> Enhanced visibility</li>
          </ul>

          <button 
            onClick={() => handleUpgrade('30days')}
            disabled={loading}
            className="upgrade-btn premium"
          >
            {loading ? (
              <>
                <i className="fi fi-rr-spinner animate-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fi fi-br-rocket-lunch"></i>
                Upgrade Now
              </>
            )}
          </button>
        </div>
      </div>

      <div className="payment-methods">
        <div className="methods-header">
          <h3>Payment Methods</h3>
        </div>
        <div className="methods">
          <div className="method-item">
            <img 
              src="https://logos-world.net/wp-content/uploads/2022/12/BKash-Symbol.png" 
              alt="bKash" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://logos-world.net/wp-content/uploads/2022/12/Nagad-Logo.png" 
              alt="Nagad" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/068/706/013/small_2x/rocket-color-logo-mobile-banking-icon-png.png" 
              alt="Rocket" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
              alt="Visa" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard" 
              className="payment-logo"
            />
          </div>
        </div>
        <div className="ssl-badge">
          <p>Secured by <strong>SSLCommerz</strong></p>
        </div>
      </div>

      <div className="faq-section">
        <h3><i className="fi fi-br-interrogation"></i> Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <div className="faq-icon">
              <i className="fi fi-br-time-past"></i>
            </div>
            <h4>Can I cancel anytime?</h4>
            <p>Yes, you can turn off auto-renewal anytime. You'll keep premium access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <div className="faq-icon">
              <i className="fi fi-br-credit-card"></i>
            </div>
            <h4>Payment methods?</h4>
            <p>We accept bKash, Nagad, Rocket, all major credit/debit cards, and internet banking through SSLCommerz.</p>
          </div>
          <div className="faq-item">
            <div className="faq-icon">
              <i className="fi fi-br-shield-check"></i>
            </div>
            <h4>Is payment secure?</h4>
            <p>Absolutely! We use SSLCommerz, Bangladesh's leading payment gateway with PCI DSS Level 1 certification.</p>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
