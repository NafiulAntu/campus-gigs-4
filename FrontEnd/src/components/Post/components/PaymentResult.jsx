import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';

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
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    
    console.log('🎉 PaymentResult.jsx loaded!');
    console.log('🔍 Payment params:', { sessionId, transactionId, status, plan });
    console.log('📍 Current URL:', window.location.href);
    
    if (sessionId) {
      // Stripe payment - verify session (redirect timer set inside verifyStripeSession)
      console.log('💳 Verifying Stripe session...');
      verifyStripeSession(sessionId);
    } else if (transactionId) {
      // Mock payment - fetch transaction
      console.log('💰 Fetching mock transaction...');
      fetchTransactionDetails(transactionId);
    } else if (status === 'success' && plan) {
      // SSLCommerz/Mock payment success - show congratulations
      console.log('🎉 SSLCommerz/Mock payment success detected!');
      console.log('🎯 Plan:', plan);
      console.log('📋 Calling handleSSLCommerzSuccess...');
      handleSSLCommerzSuccess(plan);
    } else {
      console.log('⚠️ No payment params found, hiding loading...');
      setLoading(false);
    }
  }, [searchParams, navigate]);

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

  const handleSSLCommerzSuccess = async (planType) => {
    setLoading(true);
    try {
      // Fetch subscription details
      await refreshUserData();
      
      // Set transaction for display
      const planPrices = {
        '15days': 99,
        '30days': 150,
        'yearly': 1500
      };
      
      setTransaction({
        amount: planPrices[planType] || 150,
        payment_method: 'SSLCommerz',
        transaction_id: `SSL_${planType}_${Date.now()}`,
        status: 'completed'
      });
      
      // Redirect to Premium after 3 seconds
      console.log('➡️ Will redirect to /premium in 3 seconds');
      setTimeout(() => {
        navigate(`/premium?status=success&from_payment=true&plan=${planType}`);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to load subscription details:', error);
      // Still redirect to Premium
      setTimeout(() => {
        navigate('/premium');
      }, 3000);
    } finally {
      setLoading(false);
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
        const planType = response.data.plan_type || '30days';
        
        setTransaction({
          amount: response.data.amount,
          payment_method: 'Stripe',
          transaction_id: sessionId.substring(0, 20) + '...',
          status: 'completed',
          plan_type: planType
        });
        setStripeError(null);
        
        // Refresh user data to update premium status
        console.log('🔄 Refreshing user data...');
        await refreshUserData();
        
        // Set redirect timer AFTER verification completes
        console.log('⏰ Setting 3-second redirect timer with plan:', planType);
        setTimeout(() => {
          console.log('🚀 Redirecting to premium with plan:', planType);
          navigate(`/premium?status=success&from_payment=true&plan=${planType}`);
        }, 3000);
      } else {
        // Even if verification fails, refresh user data and redirect
        console.log('⚠️ Payment already processed or session expired, refreshing user data...');
        await refreshUserData();
        
        // Still redirect after 3 seconds
        setTimeout(() => {
          navigate('/premium');
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to verify Stripe session:', err);
      // On error, still refresh user data and redirect
      console.log('Verification error, refreshing user data...');
      await refreshUserData();
      
      // Redirect to premium
      setTimeout(() => {
        navigate('/premium');
      }, 3000);
    } finally {
      setLoading(false);
      setVerifyingStripe(false);
      console.log('✅ Payment processing complete - showing congratulations page');
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center px-6">
          {/* Animated Processing State */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-3 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <i className="fi fi-rr-shield-check text-emerald-400 text-3xl"></i>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            {verifyingStripe ? 'Processing Your Payment' : 'Activating Subscription'}
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            {verifyingStripe ? 'Verifying transaction...' : 'Please wait a moment...'}
          </p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full mb-6 border-2 border-emerald-500/50">
            <i className="fi fi-rr-check text-emerald-400 text-5xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-gray-400">Redirecting you to Premium in 3 seconds...</p>
        </div>
      </div>
    );
  }

  // Get plan details
  const planDetails = {
    '15days': { name: '15 Days Premium', days: 15, icon: 'fi-rr-rocket' },
    '30days': { name: '30 Days Premium', days: 30, icon: 'fi-rr-star' },
    'yearly': { name: 'Yearly Premium', days: 365, icon: 'fi-rr-crown' }
  };

  const plan = searchParams.get('plan') || transaction?.plan_type || subscription?.subscription?.plan_duration || '30days';
  const planInfo = planDetails[plan] || planDetails['30days'];

  console.log('🎨 RENDERING CONGRATULATIONS PAGE');
  console.log('📦 Transaction:', transaction);
  console.log('📦 Subscription:', subscription);
  console.log('📦 Plan:', plan);
  console.log('📦 Loading:', loading);
  console.log('📦 VerifyingStripe:', verifyingStripe);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
        
        {/* Floating confetti */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <span className="text-2xl opacity-40">
              {['🎉', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)]}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-confetti {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-float-confetti { animation: float-confetti linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-checkmark { animation: checkmark 0.8s ease-out forwards; }
        .animate-ring-pulse { animation: ring-pulse 2s ease-in-out infinite; }
      `}</style>

      <div className="max-w-xl w-full relative z-10 px-6 animate-fadeIn">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 w-32 h-32 bg-emerald-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-32 h-32 bg-emerald-500/30 rounded-full animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <svg className="w-16 h-16 text-white animate-scaleIn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white mb-3 animate-slideUp">
            🎉 Congratulations!
          </h1>
          <p className="text-2xl font-bold text-emerald-400 mb-2 animate-slideUp" style={{animationDelay: '0.1s'}}>
            Your Subscription is Active! ✨
          </p>
          <p className="text-lg text-gray-400 animate-slideUp" style={{animationDelay: '0.15s'}}>
            Redirecting to Premium Dashboard in 3 seconds...
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-slideUp" style={{animationDelay: '0.2s'}}>
          
          {/* Active Subscription Status */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-2xl shadow-lg shadow-emerald-500/20">
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-emerald-300 font-black text-xl tracking-wide">SUBSCRIPTION ACTIVE</span>
              <i className="fi fi-rr-check-circle text-emerald-400 text-2xl"></i>
            </div>
          </div>

          {/* Plan Details Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Plan Name */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
              <i className={`fi ${planInfo.icon} text-emerald-400 text-4xl mb-3 block`}></i>
              <p className="text-gray-400 text-sm mb-2">Your Plan</p>
              <p className="text-white font-bold text-2xl">{planInfo.name}</p>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 text-center">
              <i className="fi fi-rr-calendar text-blue-400 text-4xl mb-3 block"></i>
              <p className="text-gray-400 text-sm mb-2">Valid For</p>
              <p className="text-white font-bold text-2xl">{planInfo.days} Days</p>
            </div>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <i className="fi fi-rr-money-check-alt text-emerald-400"></i>
                  Amount Paid
                </span>
                <span className="text-emerald-400 font-bold text-2xl">৳{transaction.amount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <i className="fi fi-rr-credit-card text-blue-400"></i>
                  Payment Method
                </span>
                <span className="text-white font-semibold capitalize">{transaction.payment_method || 'Online Payment'}</span>
              </div>
            </div>
          )}

          {/* Subscription Info (if available) */}
          {subscription && subscription.subscription && (
            <div className="space-y-3 mb-8 pt-6 border-t border-slate-700/50">
              {subscription.subscription.expiry_date && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                  <span className="text-gray-400 flex items-center gap-2">
                    <i className="fi fi-rr-calendar-clock text-purple-400"></i>
                    Valid Until
                  </span>
                  <span className="text-white font-semibold">
                    {new Date(subscription.subscription.expiry_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Features Unlocked */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <i className="fi fi-rr-sparkles text-purple-400"></i>
              Premium Features Unlocked
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <i className="fi fi-rr-check text-emerald-400"></i>
                Unlimited Posts
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="fi fi-rr-check text-emerald-400"></i>
                Premium Badge
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="fi fi-rr-check text-emerald-400"></i>
                Priority Support
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="fi fi-rr-check text-emerald-400"></i>
                Advanced Analytics
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => {
              const planType = searchParams.get('plan') || subscription?.subscription?.plan_duration || '30days';
              navigate(`/premium?status=success&from_payment=true&plan=${planType}`);
            }} 
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <i className="fi fi-rr-arrow-right"></i>
            Go to Premium Dashboard
          </button>
          
          {/* Auto Redirect Notice */}
          <div className="text-center mt-6">
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <i className="fi fi-rr-time-forward text-sm"></i>
              Auto-redirecting in 3 seconds...
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
      `}</style>
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
