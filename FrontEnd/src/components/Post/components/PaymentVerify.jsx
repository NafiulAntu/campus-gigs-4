import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        console.error('No token provided');
        navigate('/premium');
        return;
      }

      try {
        console.log('🔐 Verifying payment token...');
        
        // Verify the one-time token
        const response = await api.get(`/stripe/verify-token?token=${token}`);
        
        if (response.data.success && response.data.sessionId) {
          console.log('✅ Token verified! Redirecting to success page...');
          
          // Redirect to actual success page with session_id
          navigate(`/payment/success?session_id=${response.data.sessionId}`, { replace: true });
        } else {
          console.error('Token verification failed');
          navigate('/premium');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        navigate('/premium');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-white mb-2">
          Verifying Payment
        </p>
        <p className="text-gray-400">
          Please wait...
        </p>
      </div>
    </div>
  );
};

export default PaymentVerify;
