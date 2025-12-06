/**
 * Mock Payment Frontend Component
 * Simulates payment gateway page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { processMockPayment } from '../../../services/api';

export default function MockPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [planType, setPlanType] = useState('');

  const tranId = searchParams.get('tran_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'BDT';

  // Extract plan type from transaction ID
  useEffect(() => {
    if (tranId) {
      // Try to extract plan from transaction ID or localStorage
      const storedPlan = localStorage.getItem('mock_payment_plan');
      if (storedPlan) {
        setPlanType(storedPlan);
      }
    }
  }, [tranId]);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
    { id: 'bkash', name: 'bKash', icon: 'fa-mobile-alt', color: '#E2136E' },
    { id: 'nagad', name: 'Nagad', icon: 'fa-mobile-alt', color: '#F27121' },
    { id: 'rocket', name: 'Rocket', icon: 'fa-rocket', color: '#8B3A8B' }
  ];

  const testCards = [
    { number: '4111111111111111', label: 'Success Card', type: 'success' },
    { number: '4000000000000002', label: 'Declined Card', type: 'error' },
    { number: '4000000000000069', label: 'Expired Card', type: 'error' }
  ];

  const handlePayment = async (isSuccess = true) => {
    if (isSuccess && selectedMethod === 'card' && !cardNumber) {
      alert('Please enter a card number');
      return;
    }

    setProcessing(true);
    try {
      const response = await processMockPayment({
        transaction_id: tranId,
        payment_method: selectedMethod,
        card_number: selectedMethod === 'card' ? cardNumber : null
      });

      if (response.data.success) {
        // Show success animation
        setShowSuccess(true);
        
        // Wait 2 seconds then navigate to premium with success
        setTimeout(() => {
          navigate(response.data.redirect_url || '/premium?status=success');
        }, 2000);
      } else {
        // Navigate to failed URL
        navigate(response.data.redirect_url || '/premium?status=failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment processing failed: ' + (error.response?.data?.message || error.message));
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Demo Payment Gateway</h1>
          <p className="text-gray-400 text-sm">Secure Mock Transaction</p>
        </div>

        {/* Amount */}
        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">Amount to Pay</div>
          <div className="text-3xl font-bold text-white">
            {currency} {parseFloat(amount).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-2">
            <i className="fas fa-info-circle mr-1"></i>
            This is a DEMO transaction - No real money will be charged
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-300 mb-3 block">Select Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                }`}
              >
                <i className={`fas ${method.icon} text-2xl mb-2`} style={{ color: method.color || '#10b981' }}></i>
                <div className="text-white text-sm font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Card Input */}
        {selectedMethod === 'card' && (
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              placeholder="4111 1111 1111 1111"
              maxLength={16}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            />
            
            {/* Test Cards */}
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-400 mb-2">Quick Test Cards:</div>
              {testCards.map(card => (
                <button
                  key={card.number}
                  onClick={() => setCardNumber(card.number)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    card.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  <i className={`fas ${card.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                  {card.label}: {card.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Banking Instructions */}
        {['bkash', 'nagad', 'rocket'].includes(selectedMethod) && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-blue-400 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              In demo mode, all mobile banking payments succeed automatically.
            </div>
          </div>
        )}

        {/* Quick Test Buttons - Like Real Gateway */}
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl">
          <div className="text-gray-300 text-sm mb-4 font-semibold flex items-center gap-2">
            <i className="fas fa-flask text-cyan-400"></i>
            Test Payment Gateway (Choose Outcome)
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Success Button */}
            <button
              onClick={() => window.location.href = `http://localhost:5000/api/mock-payment/success?tran_id=${tranId}`}
              disabled={processing}
              className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transform"
            >
              <span className="flex flex-col items-center gap-1">
                <i className="fas fa-check-circle text-2xl"></i>
                <span className="text-sm">Success</span>
              </span>
            </button>

            {/* Fail Button */}
            <button
              onClick={() => window.location.href = `http://localhost:5000/api/mock-payment/fail?tran_id=${tranId}&error=Payment declined`}
              disabled={processing}
              className="py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-red-500/50 hover:scale-105 transform"
            >
              <span className="flex flex-col items-center gap-1">
                <i className="fas fa-times-circle text-2xl"></i>
                <span className="text-sm">Failed</span>
              </span>
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Click Success to activate Premium or Failed to test error handling
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => window.location.href = `http://localhost:5000/api/mock-payment/cancel?tran_id=${tranId}`}
          disabled={processing}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-50 border border-slate-600"
        >
          <span className="flex items-center justify-center gap-2">
            <i className="fas fa-times"></i>
            Cancel Payment
          </span>
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <i className="fas fa-shield-alt mr-1"></i>
          Demo Mode - No real transactions
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 max-w-md mx-4 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-scaleIn">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
                <i className="fas fa-check text-white text-5xl"></i>
              </div>
              
              {/* Success Message */}
              <h2 className="text-3xl font-bold text-white mb-3">
                Payment Successful! 🎉
              </h2>
              <p className="text-emerald-400 text-lg mb-6 font-semibold">
                Premium Activated
              </p>
              
              {/* Loading Indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Redirecting to Premium...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
