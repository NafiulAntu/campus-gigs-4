import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid payment session');
      return;
    }

    try {
      const response = await api.get(`/stripe/verify-session?session_id=${sessionId}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Payment successful! Your premium subscription is now active.');
        
        // Redirect to premium page after 3 seconds
        setTimeout(() => {
          navigate('/premium');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to verify payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-gray-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to Premium page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-3 bg-primary-teal text-white rounded-lg font-semibold hover:bg-primary-teal/90 transition-colors"
              >
                Back to Premium
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
