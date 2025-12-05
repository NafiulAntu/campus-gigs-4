import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStripeCheckout } from '../../../services/api';
import api from '../../../services/api';
import '../styles/Premium.css';

const Premium = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('stripe'); // stripe, sslcommerz, mock
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
    
    // Refresh subscription status when user returns to this page
    const handleFocus = () => {
      checkSubscriptionStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('🔍 Checking subscription status...');
      const response = await api.get('/subscription/status');
      console.log('📊 Subscription data received:', response.data);
      console.log('📊 Plan type:', response.data?.subscription?.plan_type);
      console.log('📊 Is premium:', response.data?.is_premium);
      setSubscription(response.data);
      
      if (response.data?.is_premium) {
        console.log('✅ User is premium!', response.data.subscription);
      } else {
        console.log('❌ User is not premium');
      }
    } catch (err) {
      console.error('❌ Failed to fetch subscription:', err);
    }
  };

  const handleUpgrade = async (planType) => {
    setLoading(true);
    setError('');

    try {
      let response;
      
      // Choose payment gateway
      if (paymentGateway === 'stripe') {
        console.log('Initiating Stripe payment for plan:', planType);
        response = await createStripeCheckout({ plan_type: planType });
        console.log('Stripe response:', response.data);
        
        if (response.data.success && response.data.url) {
          window.location.href = response.data.url; // Redirect to Stripe Checkout
          return; // Don't set loading to false, we're redirecting
        } else {
          setError(response.data.error || 'Failed to create Stripe checkout session');
        }
      } else if (paymentGateway === 'sslcommerz') {
        response = await api.post('/payments/initiate', { plan_type: planType });
        if (response.data.success && response.data.gateway_url) {
          window.location.href = response.data.gateway_url; // Redirect to SSLCommerz
          return;
        } else {
          setError('Failed to initiate SSLCommerz payment');
        }
      } else if (paymentGateway === 'mock') {
        response = await api.post('/mock-payment/initiate', { plan_type: planType });
        if (response.data.success && response.data.gateway_url) {
          window.location.href = response.data.gateway_url; // Redirect to Mock Payment
          return;
        } else {
          setError('Failed to initiate mock payment');
        }
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Check if user already has active subscription
      if (err.response?.status === 400 && err.response?.data?.subscription) {
        const sub = err.response.data.subscription;
        setError(
          `You already have an active ${sub.plan_type} Premium subscription! ` +
          `It expires in ${sub.days_remaining} days on ${new Date(sub.expiry_date).toLocaleDateString()}.`
        );
      } else {
        const errorMessage = err.response?.data?.error 
          || err.response?.data?.message 
          || err.message 
          || 'Failed to start payment process';
        
        setError(errorMessage);
      }
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

  // Show loading state while checking subscription
  if (subscription === null) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (subscription?.is_premium) {
    console.log('✅ Premium view - Showing subscription details:', subscription);
    return (
      <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => onBack ? onBack() : navigate('/post')}
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
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            {/* Floating Crown Icons */}
            <div className="absolute top-32 right-1/4 text-yellow-500/5 text-6xl animate-float">
              <i className="fi fi-rr-crown"></i>
            </div>
            <div className="absolute bottom-40 left-1/4 text-cyan-500/5 text-5xl" style={{animation: 'float 8s ease-in-out infinite'}}>
              <i className="fi fi-rr-diamond"></i>
            </div>
            <div className="absolute top-1/2 right-20 text-purple-500/5 text-7xl" style={{animation: 'float 10s ease-in-out infinite'}}>
              <i className="fi fi-rr-star"></i>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
          `}</style>

          <div className="premium-container relative z-10 max-w-6xl mx-auto px-4 py-8">
            {/* Premium Header with Animation */}
            <div className="relative overflow-hidden rounded-2xl p-6 mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3">
                <i className="fi fi-br-crown text-yellow-400 text-4xl"></i>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">🎉 You're Premium!</h1>
              <p className="text-base text-gray-400 font-medium">Enjoying all the exclusive features</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-semibold text-xs">ACTIVE SUBSCRIPTION</span>
              </div>
            </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-diamond text-cyan-400 text-4xl"></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Current Plan</h3>
              <p className="text-lg font-bold text-white mb-1">
                {subscription.subscription.plan_name || 'Premium Plan'}
              </p>
              <p className="text-2xl font-black text-cyan-400">
                ৳{subscription.subscription.amount || 
                  (subscription.subscription.plan_type === 'yearly' ? '1,500' : '150')}
              </p>
            </div>
          </div>

          <div className="border border-emerald-500/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-shield-check text-emerald-400 text-4xl"></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Subscription Status</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-bold text-sm">
                  {subscription.subscription.status === 'active' ? '✓ ACTIVE' : 
                   subscription.subscription.status === 'completed' ? '✓ COMPLETED' :
                   subscription.subscription.status.toUpperCase()}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-1 flex items-center gap-1.5">
                <i className="fi fi-rr-clock text-emerald-400 text-xs"></i>
                {subscription.subscription.days_remaining > 0 
                  ? `${subscription.subscription.days_remaining} days left`
                  : 'Expired'}
              </p>
              {subscription.subscription.expiry_date && (
                <p className="text-white/50 text-xs flex items-center gap-1.5">
                  <i className="fi fi-rr-calendar text-emerald-400 text-xs"></i>
                  {new Date(subscription.subscription.expiry_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          </div>

          <div className="border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-refresh text-purple-400 text-4xl"></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Auto-Renewal</h3>
              <p className={`text-lg font-bold mb-3 flex items-center gap-2 ${
                subscription.subscription.auto_renew ? 'text-green-400' : 'text-gray-500'
              }`}>
                {subscription.subscription.auto_renew ? (
                  <><i className="fi fi-sr-check-circle text-base"></i> Enabled</>
                ) : (
                  <><i className="fi fi-sr-cross-circle text-base"></i> Disabled</>
                )}
              </p>
              {subscription.subscription.auto_renew ? (
                <button 
                  onClick={handleCancelSubscription} 
                  className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-cross-circle text-xs"></i>
                  Turn Off
                </button>
              ) : (
                <button 
                  onClick={handleReactivate} 
                  className="w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 text-green-400 font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-refresh text-xs"></i>
                  Turn On
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <i className="fi fi-br-sparkles text-yellow-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-white">Your Premium Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="border border-white/10 rounded-lg p-4 hover:border-green-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-infinity text-green-400 text-3xl"></i>
              </div>
              <span className="text-green-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Unlimited Posts</span>
              <p className="text-gray-500 text-xs">Create as many posts as you want</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 hover:border-blue-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-arrow-up text-blue-400 text-3xl"></i>
              </div>
              <span className="text-blue-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Priority Placement</span>
              <p className="text-gray-500 text-xs">Your posts appear at the top</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 hover:border-purple-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-chart-histogram text-purple-400 text-3xl"></i>
              </div>
              <span className="text-purple-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Advanced Analytics</span>
              <p className="text-gray-500 text-xs">Track your post performance</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 hover:border-orange-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-badge-check text-orange-400 text-3xl"></i>
              </div>
              <span className="text-orange-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Premium Badge</span>
              <p className="text-gray-500 text-xs">Stand out with verified badge</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-eye text-cyan-400 text-3xl"></i>
              </div>
              <span className="text-cyan-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Read Receipts</span>
              <p className="text-gray-500 text-xs">See who viewed your posts</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 hover:border-pink-500/30 hover:scale-105 transition-all duration-300 group text-center">
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-thumbtack text-pink-400 text-3xl"></i>
              </div>
              <span className="text-pink-400 text-xl mb-2 block">✓</span>
              <span className="text-white font-semibold text-sm block mb-1">Pin Posts</span>
              <p className="text-gray-500 text-xs">Keep important posts at top</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  console.log('❌ Not premium - Showing upgrade cards');
  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => onBack ? onBack() : navigate('/post')}
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

      {/* Payment Gateway Selector */}
      <div className="mb-8 bg-slate-900/50 rounded-xl p-6 border border-white/10">
        <label className="block text-sm font-semibold text-gray-300 mb-3">Select Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setPaymentGateway('stripe')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentGateway === 'stripe'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
            }`}
          >
            <div className="text-center">
              <i className="fas fa-credit-card text-2xl text-cyan-400 mb-2"></i>
              <div className="text-white text-sm font-medium">Stripe</div>
              <div className="text-xs text-gray-400 mt-1">International Cards</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentGateway('sslcommerz')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentGateway === 'sslcommerz'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
            }`}
          >
            <div className="text-center">
              <i className="fas fa-shield-alt text-2xl text-emerald-400 mb-2"></i>
              <div className="text-white text-sm font-medium">SSLCommerz</div>
              <div className="text-xs text-gray-400 mt-1">bKash, Nagad, Cards</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentGateway('mock')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentGateway === 'mock'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
            }`}
          >
            <div className="text-center">
              <i className="fas fa-flask text-2xl text-purple-400 mb-2"></i>
              <div className="text-white text-sm font-medium">Demo</div>
              <div className="text-xs text-gray-400 mt-1">Test Payment</div>
            </div>
          </button>
        </div>
      </div>

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
            <div className="savings">
              <i className="fi fi-br-piggy-bank"></i>
              Save ৳99!
            </div>
          </div>

          <ul className="features-list">
            <li><i className="fi fi-br-check"></i> Everything in 15 Days</li>
            <li><i className="fi fi-br-check"></i> Advanced analytics</li>
            <li><i className="fi fi-br-check"></i> Custom profile theme</li>
            <li><i className="fi fi-br-check"></i> Verified badge</li>
            <li><i className="fi fi-br-check"></i> Priority support</li>
            <li><i className="fi fi-br-check"></i> Remove all ads</li>
            <li><i className="fi fi-br-check"></i> Featured in listings</li>
          </ul>

          <button 
            onClick={() => handleUpgrade('30days')}
            disabled={loading || (subscription && subscription.subscription?.plan_type === '30days')}
            className={`upgrade-btn premium ${subscription?.subscription?.plan_type === '30days' ? 'completed' : ''}`}
          >
            {subscription?.subscription?.plan_type === '30days' ? (
              <>
                <i className="fi fi-br-check-circle"></i>
                COMPLETED
              </>
            ) : loading ? (
              <>
                <i className="fi fi-rr-spinner animate-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fi fi-br-rocket-lunch"></i>
                Get Premium
              </>
            )}
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
            disabled={loading || (subscription && subscription.subscription?.plan_type === '15days')}
            className={`upgrade-btn starter ${subscription?.subscription?.plan_type === '15days' ? 'completed' : ''}`}
          >
            {subscription?.subscription?.plan_type === '15days' ? (
              <>
                <i className="fi fi-br-check-circle"></i>
                COMPLETED
              </>
            ) : loading ? (
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
      </div>

      <div className="payment-methods">
        <div className="methods-header">
          <h3>Payment Methods</h3>
        </div>
        <div className="methods">
          <div className="method-item">
            <img 
              src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" 
              alt="bKash" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" 
              alt="Nagad" 
              className="payment-logo"
            />
          </div>
          <div className="method-item">
            <img 
              src="https://futurestartup.com/wp-content/uploads/2016/09/DBBL-Mobile-Banking-Becomes-Rocket.jpg" 
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
