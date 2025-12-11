import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createStripeCheckout, initiateSSLCommerzSubscription } from '../../../services/api';
import api from '../../../services/api';
import '../styles/Premium.css';

const Premium = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('stripe'); // stripe, sslcommerz, mock
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('🚀🚀🚀 Premium.jsx useEffect TRIGGERED 🚀🚀🚀');
    console.log('📍 Full URL:', window.location.href);
    
    // Check for payment callback status
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const fromPayment = searchParams.get('from_payment');
    
    console.log('🔍 Premium.jsx - Checking URL params:', { status, plan, fromPayment });
    
    // If no special URL params, just check subscription status normally
    if (!status && !plan && !fromPayment) {
      console.log('📡 No URL params - checking subscription status normally');
      checkSubscriptionStatus();
      return;
    }
    
    if (status === 'success' && plan && !fromPayment) {
      // Redirect to PaymentResult page for proper congratulations display
      console.log('✅ Payment success detected in Premium.jsx!');
      console.log('🎯 Redirecting to: /payment/success?status=success&plan=' + plan);
      navigate(`/payment/success?status=success&plan=${plan}`, { replace: true });
      return; // Don't continue with other logic
    } else if (status === 'success' && fromPayment === 'true') {
      // Coming back from payment success page - show welcome message
      console.log('✅✅✅ PAYMENT SUCCESS DETECTED! ✅✅✅');
      console.log('🎉 Returning from payment success!');
      console.log('🎉 Plan received:', plan);
      const planName = plan === 'yearly' ? 'Yearly' : plan === '15days' ? '15 Days' : '30 Days';
      const message = `🎉 Congratulations! You Got ${planName} Premium!\n\n✨ All premium features are now unlocked. You can cancel your subscription anytime using the button below.`;
      console.log('💾 Setting success message to state:', message);
      console.log('💾 Message length:', message.length, 'characters');
      setSuccessMessage(message);
      console.log('✅ Success message has been set in state!');
      // Clean URL but keep the message showing
      navigate('/premium', { replace: true });
      
      // Force refresh subscription status after 1 second
      setTimeout(() => {
        console.log('🔄 Force refreshing subscription after payment...');
        checkSubscriptionStatus();
      }, 1000);
      
      // ✅ DON'T auto-hide the success message anymore!
      // Users need to see the Cancel button at all times
      console.log('✅ Success message will stay visible (not auto-hiding after 15 seconds)'); // Show for 15 seconds
    } else if (status === 'failed') {
      const message = searchParams.get('message') || 'Payment failed';
      setError(`❌ ${decodeURIComponent(message)}`);
      setTimeout(() => {
        navigate('/premium', { replace: true });
        setTimeout(() => setError(''), 5000);
      }, 100);
    } else if (status === 'cancelled') {
      setError('⚠️ Payment was cancelled. You can try again anytime.');
      setTimeout(() => {
        navigate('/premium', { replace: true });
        setTimeout(() => setError(''), 5000);
      }, 100);
    }
    
    checkSubscriptionStatus();
    
    // Refresh subscription status when user returns to this page
    const handleFocus = () => {
      checkSubscriptionStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [searchParams]);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('🔍 Checking subscription status...');
      const response = await api.get('/subscription/status');
      console.log('📊 Subscription data received:', response.data);
      console.log('📊 Plan type:', response.data?.subscription?.plan_type);
      console.log('📊 Is premium:', response.data?.is_premium);
      console.log('📊 Subscription status:', response.data?.subscription?.status);
      console.log('📊 Expiry date:', response.data?.subscription?.expiry_date);
      console.log('📊 Days remaining:', response.data?.subscription?.days_remaining);
      setSubscription(response.data);
      
      if (response.data?.is_premium) {
        console.log('✅ User is premium!', response.data.subscription);
      } else {
        console.log('❌ User is not premium');
        console.log('❌ Reason: status =', response.data?.subscription?.status, ', expiry =', response.data?.subscription?.expiry_date);
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
        console.log('🔵 Initiating SSLCommerz payment for plan:', planType);
        response = await initiateSSLCommerzSubscription({ plan_type: planType });
        console.log('🔵 SSLCommerz full response:', response);
        console.log('🔵 SSLCommerz response data:', response.data);
        
        if (response.data.success && response.data.gatewayUrl) {
          console.log('✅ SSLCommerz gateway URL received:', response.data.gatewayUrl);
          
          // Store transaction info for callback
          localStorage.setItem('ssl_subscription_transaction', response.data.transaction_id);
          localStorage.setItem('ssl_subscription_plan', planType);
          
          window.location.href = response.data.gatewayUrl; // Redirect to SSLCommerz
          return;
        } else {
          console.error('❌ SSLCommerz payment initiation failed:', response.data);
          setError(response.data.message || response.data.error || 'Failed to initiate SSLCommerz payment');
        }
      } else if (paymentGateway === 'mock') {
        console.log('🔵 Initiating Mock payment for plan:', planType);
        response = await api.post('/mock-payment/initiate', { plan_type: planType });
        console.log('🔵 Mock payment response:', response.data);
        
        if (response.data.success && response.data.gateway_url) {
          // Store plan type for the payment page
          localStorage.setItem('mock_payment_plan', planType);
          localStorage.setItem('mock_payment_transaction', response.data.transaction_id);
          
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
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to start payment process';
      
      if (errorMessage.toLowerCase().includes('already have an active subscription') || 
          errorMessage.toLowerCase().includes('active subscription') ||
          err.response?.status === 400) {
        setError(
          '⚠️ You already have an active premium subscription!\n\n' +
          '💡 To change your plan:\n' +
          '1️⃣ Cancel your current subscription using the button below\n' +
          '2️⃣ Then purchase the new plan you want\n\n' +
          'Your current subscription will end immediately when cancelled.'
        );
        
        // Scroll to cancel subscription section after a brief delay
        setTimeout(() => {
          const cancelSection = document.querySelector('.mt-12.border.border-red-500\\/30');
          if (cancelSection) {
            cancelSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a pulse animation to draw attention
            cancelSection.classList.add('animate-pulse');
            setTimeout(() => cancelSection.classList.remove('animate-pulse'), 2000);
          }
        }, 500);
      } else {
        setError('❌ ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    console.log('🔵 handleCancelSubscription called');
    
    // Professional confirmation dialog
    const confirmed = window.confirm(
      '⚠️ CANCEL PREMIUM SUBSCRIPTION?\n\n' +
      '🚫 Your premium access will end IMMEDIATELY\n' +
      '❌ All premium features will be disabled\n' +
      '💳 You can purchase a new subscription anytime\n' +
      '📜 Payment history will be preserved\n\n' +
      'Are you absolutely sure you want to cancel?'
    );
    
    if (!confirmed) {
      console.log('❌ User cancelled the confirmation dialog');
      return;
    }

    try {
      setCancelLoading(true);
      console.log('🚀 Calling cancel subscription API...');
      
      const response = await api.post('/subscription/cancel');
      console.log('✅ Cancel response:', response.data);
      
      // Success notification
      setSuccessMessage('✅ Subscription cancelled successfully! Your premium access has ended.');
      
      // Refresh subscription status
      await checkSubscriptionStatus();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('❌ Cancel error:', err);
      console.error('Error response:', err.response);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      err.message || 
                      'Failed to cancel subscription. Please try again or contact support.';
      
      setError('❌ ' + errorMsg);
      
      // Auto-hide error after 7 seconds
      setTimeout(() => setError(''), 7000);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleTurnOffAutoRenew = async () => {
    const confirmed = window.confirm(
      '🔄 Turn off auto-renewal?\n\n' +
      '✅ You will keep premium access until ' + 
      (subscription?.subscription?.expiry_date ? 
        new Date(subscription.subscription.expiry_date).toLocaleDateString() : 
        'the end date') + '\n' +
      '❌ Subscription won\'t renew automatically\n' +
      '♻️ You can turn it back on anytime\n\n' +
      'Confirm to disable auto-renewal?'
    );
    
    if (!confirmed) return;

    try {
      console.log('🚀 Calling turn off auto-renew API...');
      const response = await api.post('/subscription/turn-off-auto-renew');
      console.log('✅ Auto-renew response:', response.data);
      
      setSuccessMessage('✅ Auto-renewal disabled! Your subscription will not renew automatically.');
      await checkSubscriptionStatus();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('❌ Auto-renew error:', err);
      console.error('Error response:', err.response);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      err.message || 
                      'Failed to turn off auto-renew';
      
      setError('❌ ' + errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await api.post('/subscription/reactivate');
      
      setSuccessMessage('✅ ' + response.data.message);
      await checkSubscriptionStatus();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Failed to reactivate subscription';
      
      setError('❌ ' + errorMsg);
      setTimeout(() => setError(''), 5000);
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

  // Show premium view if user is premium OR if showing success message (just after payment)
  const showPremiumView = subscription?.is_premium || successMessage;
  
  console.log('═══════════════════════════════════════════');
  console.log('🎯 PREMIUM VIEW DECISION:');
  console.log('  - Success Message State:', successMessage ? `YES (${successMessage.substring(0, 50)}...)` : 'NO');
  console.log('  - Is Premium (from API):', subscription?.is_premium ? 'YES' : 'NO');
  console.log('  - Show Premium View:', showPremiumView ? '✅ YES (Premium Section)' : '❌ NO (Upgrade Cards)');
  console.log('  - Subscription Status:', subscription?.subscription?.status || 'N/A');
  console.log('═══════════════════════════════════════════');
  
  if (showPremiumView) {
    console.log('✅ Premium view - Showing congratulations + subscription details');
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
        <div className="flex-1 overflow-y-auto backdrop-blur-xl bg-transparent relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
            
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
            {/* Error Messages */}
            {error && (
              <div className="mb-6 relative overflow-hidden animate-slideDown">
                <div className="p-5 bg-gradient-to-r from-red-500/20 via-red-600/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl shadow-2xl shadow-red-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fi fi-rr-exclamation text-white text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-base whitespace-pre-line">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError('')}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <i className="fi fi-rr-cross text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Header with Animation */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-12 mb-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-full mb-6 animate-bounce shadow-lg shadow-yellow-400/20">
                  <i className="fi fi-br-crown text-yellow-400 text-6xl drop-shadow-lg"></i>
                </div>
                <div className="flex items-center justify-center gap-4 mb-4">
                  {(() => {
                    console.log('═══════════════════════════════════════════');
                    console.log('🎨 RENDERING PREMIUM HEADER');
                    console.log('  - successMessage exists?', !!successMessage);
                    console.log('  - successMessage value:', successMessage || 'NULL/EMPTY');
                    console.log('  - Will render:', successMessage ? 'CONGRATULATIONS MESSAGE' : 'YOU\'RE PREMIUM DEFAULT');
                    console.log('═══════════════════════════════════════════');
                    return successMessage ? (
                      <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl whitespace-pre-line leading-tight">
                        {successMessage.split('\n\n')[0]}
                      </h1>
                    ) : (
                      <>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">You're Premium!</h1>
                        <img src="https://cdn-icons-png.flaticon.com/512/3386/3386773.png" alt="Celebration" className="w-12 h-12 drop-shadow-lg" />
                      </>
                    );
                  })()}
                </div>
                {successMessage ? (
                  <p className="text-lg text-emerald-300 font-bold tracking-wide mb-6 whitespace-pre-line">
                    {successMessage.split('\n\n')[1]}
                  </p>
                ) : (
                  <p className="text-lg text-gray-300 font-semibold tracking-wide">Enjoying all the exclusive features</p>
                )}
                <div className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                  <span className="text-emerald-300 font-bold text-base tracking-wider">ACTIVE SUBSCRIPTION</span>
                </div>
              </div>
            </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="border border-cyan-500/20 rounded-2xl p-7 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group bg-gradient-to-br from-cyan-500/5 to-transparent">
            <div className="flex items-center gap-4 mb-5">
              <i className="fi fi-rr-crown text-cyan-400 text-2xl group-hover:scale-110 transition-transform"></i>
              <h3 className="text-lg font-bold text-gray-200">Current Plan</h3>
            </div>
            <p className="text-xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-3">
              {subscription.subscription.plan_name || 'Premium Plan'}
            </p>
            <p className="text-3xl font-extrabold text-gray-100">
              ৳{subscription.subscription.amount || 
                (subscription.subscription.plan_type === 'yearly' ? '1,500' : '150')}
            </p>
          </div>

          <div className="border border-emerald-500/20 rounded-2xl p-7 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center gap-4 mb-5">
              <i className="fi fi-rr-shield-check text-emerald-400 text-2xl group-hover:scale-110 transition-transform"></i>
              <h3 className="text-lg font-bold text-gray-200">Subscription Status</h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-bold text-base">
                  {subscription.subscription.status === 'active' ? '✓ ACTIVE' : 
                   subscription.subscription.status === 'completed' ? '✓ COMPLETED' :
                   subscription.subscription.status.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-base mb-2 flex items-center gap-2">
              <i className="fi fi-rr-clock text-emerald-400"></i>
              {subscription.subscription.days_remaining > 0 
                ? `${subscription.subscription.days_remaining} days remaining`
                : 'Expired'}
            </p>
            {subscription.subscription.expiry_date && (
              <p className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                <i className="fi fi-rr-calendar text-emerald-400 text-xs"></i>
                Valid until {new Date(subscription.subscription.expiry_date).toLocaleDateString()}
              </p>
            )}
            {subscription.subscription.payment_info && (
              <p className="text-gray-400 text-sm flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/20">
                <i className={`fi ${
                  subscription.subscription.payment_info.payment_method === 'stripe' ? 'fi-brands-stripe text-purple-400' : 
                  subscription.subscription.payment_info.payment_method === 'sslcommerz' ? 'fi-rr-credit-card text-cyan-400' : 
                  'fi-rr-money-check-edit-alt text-green-400'
                } text-xs`}></i>
                Paid via {
                  subscription.subscription.payment_info.payment_method === 'stripe' ? 'Stripe' : 
                  subscription.subscription.payment_info.payment_method === 'sslcommerz' ? 'SSLCommerz' : 
                  subscription.subscription.payment_info.payment_method.toUpperCase()
                }
                {subscription.subscription.payment_info.card_brand && 
                  ` (${subscription.subscription.payment_info.card_brand})`
                }
              </p>
            )}
          </div>

          <div className="border border-purple-500/20 rounded-2xl p-7 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-4 mb-5">
              <i className="fi fi-rr-refresh text-purple-400 text-2xl group-hover:scale-110 transition-transform"></i>
              <h3 className="text-lg font-bold text-gray-200">Auto-Renewal</h3>
            </div>
            <p className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              subscription.subscription.auto_renew ? 'text-green-400' : 'text-gray-400'
            }`}>
              {subscription.subscription.auto_renew ? (
                <><i className="fi fi-sr-check-circle"></i> Enabled</>
              ) : (
                <><i className="fi fi-sr-cross-circle"></i> Disabled</>
              )}
            </p>
            {subscription.subscription.auto_renew ? (
              <button 
                onClick={handleTurnOffAutoRenew} 
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 border-2 border-orange-500/30 hover:border-orange-500/50 text-orange-400 font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <i className="fi fi-rr-cross-circle"></i>
                Turn Off Auto-Renewal
              </button>
            ) : (
              <button 
                onClick={handleReactivate} 
                className="w-full bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/30 hover:border-green-500/50 text-green-400 font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <i className="fi fi-rr-refresh"></i>
                Turn On Auto-Renewal
              </button>
            )}
          </div>
        </div>

        {/* Premium Features Section */}
        <div className="border border-white/20 rounded-3xl p-10 bg-gradient-to-br from-slate-800/20 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-10">
            <i className="fi fi-br-sparkles text-yellow-400 text-3xl drop-shadow-lg"></i>
            <h2 className="text-3xl font-black bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">Your Premium Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="border border-green-500/20 rounded-2xl p-6 hover:scale-105 hover:border-green-400/40 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group bg-gradient-to-br from-green-500/5 to-transparent">
              <i className="fi fi-rr-infinity text-green-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-green-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Unlimited Posts</span>
              <p className="text-gray-400 text-sm">Create as many posts as you want</p>
            </div>
            <div className="border border-blue-500/20 rounded-2xl p-6 hover:scale-105 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group bg-gradient-to-br from-blue-500/5 to-transparent">
              <i className="fi fi-rr-star text-blue-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-blue-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Priority Placement</span>
              <p className="text-gray-400 text-sm">Your posts appear at the top</p>
            </div>
            <div className="border border-purple-500/20 rounded-2xl p-6 hover:scale-105 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group bg-gradient-to-br from-purple-500/5 to-transparent">
              <i className="fi fi-rr-chart-line-up text-purple-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-purple-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Advanced Analytics</span>
              <p className="text-gray-400 text-sm">Track your post performance</p>
            </div>
            <div className="border border-orange-500/20 rounded-2xl p-6 hover:scale-105 hover:border-orange-400/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group bg-gradient-to-br from-orange-500/5 to-transparent">
              <i className="fi fi-rr-badge-check text-orange-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-orange-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Premium Badge</span>
              <p className="text-gray-400 text-sm">Stand out with verified badge</p>
            </div>
            <div className="border border-cyan-500/20 rounded-2xl p-6 hover:scale-105 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group bg-gradient-to-br from-cyan-500/5 to-transparent">
              <i className="fi fi-rr-eye text-cyan-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-cyan-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Read Receipts</span>
              <p className="text-gray-400 text-sm">See who viewed your posts</p>
            </div>
            <div className="border border-pink-500/20 rounded-2xl p-6 hover:scale-105 hover:border-pink-400/40 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 group bg-gradient-to-br from-pink-500/5 to-transparent">
              <i className="fi fi-rr-thumbtack text-pink-400 text-3xl mb-4 block group-hover:scale-110 transition-transform"></i>
              <span className="text-pink-400 text-2xl mb-3 block font-bold">✓</span>
              <span className="text-gray-100 font-bold text-lg block mb-2">Pin Posts</span>
              <p className="text-gray-400 text-sm">Keep important posts at top</p>
            </div>
          </div>
        </div>

        {/* Cancel Subscription Section - Professional Bottom Placement */}
        <div className="mt-12 border border-red-500/30 rounded-3xl p-8 bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent backdrop-blur-sm hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-100 mb-3 flex items-center gap-3">
                Cancel Subscription
                <span className="text-xs font-normal text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  Destructive Action
                </span>
              </h3>
              <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                Canceling your subscription will immediately revoke your premium features and benefits.
              </p>
              <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                You will lose access to: Unlimited Posts, Priority Placement, Advanced Analytics, Premium Badge, Read Receipts, and Post Pinning.
              </p>
              <p className="text-cyan-400 text-xs mb-6 leading-relaxed flex items-center gap-2">
                <i className="fi fi-rr-info-circle"></i>
                <span><strong>Note:</strong> To change your plan or purchase a different subscription, you must cancel your current subscription first.</span>
              </p>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center gap-3">
                  {cancelLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Canceling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-trash text-lg"></i>
                      <span>Cancel Subscription Now</span>
                    </>
                  )}
                </div>
              </button>
            </div>
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
          {/* Congratulations Banner - Show if coming from payment */}
          {successMessage ? (
            <div className="mb-8 relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-cyan-500/20 backdrop-blur-sm p-8 shadow-2xl shadow-emerald-500/20">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/10 to-emerald-500/5 animate-pulse"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent mb-2">
                      {successMessage.split('\n\n')[0]}
                    </h2>
                    <p className="text-emerald-200 text-lg font-medium leading-relaxed">
                      {successMessage.split('\n\n')[1]}
                    </p>
                  </div>
                </div>
                
                {/* Features Unlocked */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <i className="fi fi-sr-check-circle text-emerald-400"></i>
                    <span>Unlimited Posts</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <i className="fi fi-sr-check-circle text-emerald-400"></i>
                    <span>Priority Placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <i className="fi fi-sr-check-circle text-emerald-400"></i>
                    <span>Premium Badge</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-hero">
              <h1>Upgrade to Premium</h1>
              <p>Unlock powerful features to grow your presence on Campus Gigs</p>
            </div>
          )}

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

      {/* Cancel Subscription Section - Show if user has active subscription */}
      {subscription?.subscription && (subscription?.subscription?.status === 'active' || subscription?.subscription?.status === 'completed') && (
        <div className="mt-12 border border-red-500/30 rounded-3xl p-8 bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent backdrop-blur-sm hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-100 mb-3 flex items-center gap-3">
                Cancel Subscription
                <span className="text-xs font-normal text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  Destructive Action
                </span>
              </h3>
              <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20">
                <p className="text-cyan-400 text-sm mb-2 font-semibold">📋 Current Subscription:</p>
                <p className="text-gray-200 text-base">
                  {subscription.subscription.plan_name || 'Premium Plan'} - ৳{subscription.subscription.amount}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Status: <span className="text-emerald-400 font-semibold">{subscription.subscription.status?.toUpperCase()}</span>
                  {subscription.subscription.days_remaining > 0 && (
                    <> • {subscription.subscription.days_remaining} days remaining</>
                  )}
                </p>
              </div>
              <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                Canceling your subscription will immediately revoke your premium features and benefits.
              </p>
              <p className="text-gray-400 text-xs mb-2 leading-relaxed">
                You will lose access to: Unlimited Posts, Priority Placement, Advanced Analytics, Premium Badge, Read Receipts, and Post Pinning.
              </p>
              <p className="text-cyan-400 text-xs mb-6 leading-relaxed flex items-center gap-2">
                <i className="fi fi-rr-info-circle"></i>
                <span><strong>Note:</strong> To change your plan or purchase a different subscription, you must cancel your current subscription first.</span>
              </p>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center gap-3">
                  {cancelLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Canceling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-trash text-lg"></i>
                      <span>Cancel Subscription Now</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Premium;

// Add these styles to your CSS file or use styled-components
const styles = `
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-slideDown {
  animation: slideDown 0.5s ease-out;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.confetti {
  position: absolute;
  font-size: 24px;
  animation: confettiFall 3s ease-in-out infinite;
  top: -50px;
  left: 10%;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
