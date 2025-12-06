import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyMobileWalletPayment, checkPaymentStatus } from '../../../services/api';

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get transaction ID from localStorage (stored before redirect)
      const transactionId = localStorage.getItem('pending_transaction_id');
      const paymentMethod = localStorage.getItem('payment_method');

      if (!transactionId || !paymentMethod) {
        throw new Error('Transaction information not found');
      }

      // Get payment parameters from URL (different gateways pass different params)
      const paymentID = searchParams.get('paymentID'); // bKash
      const payment_ref_id = searchParams.get('payment_ref_id'); // Nagad
      const transaction_id = searchParams.get('transaction_id'); // Rocket
      const statusParam = searchParams.get('status');

      console.log('Payment callback received:', {
        transactionId,
        paymentMethod,
        paymentID,
        payment_ref_id,
        transaction_id,
        status: statusParam
      });

      // Verify payment with backend
      const response = await verifyMobileWalletPayment({
        transaction_id: transactionId,
        payment_method: paymentMethod
      });

      if (response.data.success) {
        setStatus('success');
        setMessage('Payment successful! Money has been sent.');
        setTransactionDetails(response.data.transaction);

        // Clear localStorage
        localStorage.removeItem('pending_transaction_id');
        localStorage.removeItem('payment_method');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/post');
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage(error.response?.data?.error || error.message || 'Payment verification failed');

      // Clear localStorage
      localStorage.removeItem('pending_transaction_id');
      localStorage.removeItem('payment_method');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full mb-4">
                <i className="fi fi-rr-spinner animate-spin text-cyan-400 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-gray-400">{message}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl shadow-emerald-500/20 animate-scaleIn">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full mb-4 animate-pulse">
                <i className="fi fi-rr-check-circle text-emerald-400 text-5xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">{message}</p>
              
              {transactionDetails && (
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Amount</span>
                    <span className="text-white font-bold text-lg">৳{transactionDetails.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Payment Method</span>
                    <span className="text-white font-semibold uppercase">{transactionDetails.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Transaction ID</span>
                    <span className="text-white font-mono text-xs">{transactionDetails.id}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Redirecting to home...</p>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl shadow-red-500/20 animate-scaleIn">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full mb-4">
                <i className="fi fi-rr-cross-circle text-red-400 text-5xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-gray-400 mb-6">{message}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/post/send-money')}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <i className="fi fi-rr-rotate-right mr-2"></i>
                Try Again
              </button>
              <button
                onClick={() => navigate('/post')}
                className="w-full py-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <i className="fi fi-rr-home mr-2"></i>
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
