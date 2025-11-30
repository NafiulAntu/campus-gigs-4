import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../../services/api';
import { FaArrowLeft, FaRedo } from 'react-icons/fa';
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Aurora animation colors
  const COLORS = [];
  const color = useMotionValue(COLORS[0]);

  useEffect(() => {
    const controls = animate(color, COLORS, {
      ease: "easeInOut",
      duration: 0,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const backgroundImage = useMotionTemplate`radial-gradient(0% 0% at 0% 0%, #020617 100%, ${color})`;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
        handleVerify(newOtp.join(''));
      }
    }
  };

  const handleVerify = async (code = otp.join('')) => {
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyOTP({ email, otp: code });
      const { token } = response.data;
      
      // Navigate to reset password with token
      navigate('/reset-password', { state: { token, email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setError('');

    try {
      await resendOTP({ email });
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      background: '#000000',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* OTP Verification Form */}
      <div style={{
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '50px'
      }}>
        <div className="form-content">
          <Link 
            to="/forgot-password" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#4a90e2', 
              fontSize: '14px', 
              marginBottom: '24px', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#357abd'}
            onMouseLeave={(e) => e.target.style.color = '#4a90e2'}
          >
            <FaArrowLeft /> Back
          </Link>

          <h2 className="signin-title" style={{ fontSize: '2rem', marginBottom: '16px' }}>
            Enter Verification Code
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginBottom: '40px', 
            textAlign: 'center', 
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            We've sent a 6-digit code to<br />
            <strong style={{ color: '#4a90e2' }}>{email}</strong>
          </p>

          {/* OTP Input Boxes */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoFocus={index === 0}
                disabled={loading}
                style={{
                  width: '56px',
                  height: '64px',
                  fontSize: '24px',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4a90e2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button 
            onClick={() => handleVerify()}
            className="signin-button" 
            disabled={loading || otp.some(d => !d)}
            style={{ 
              width: '100%',
              marginBottom: '16px',
              opacity: loading || otp.some(d => !d) ? 0.5 : 1,
              cursor: loading || otp.some(d => !d) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          {/* Error Message */}
          {error && (
            <p style={{ 
              color: '#ef4444', 
              marginTop: '16px', 
              fontSize: '14px', 
              textAlign: 'center',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </p>
          )}

          {/* Resend Code */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              style={{
                background: 'transparent',
                border: 'none',
                color: canResend && !loading ? '#4a90e2' : 'rgba(255, 255, 255, 0.4)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: canResend && !loading ? 'pointer' : 'not-allowed',
                textDecoration: canResend && !loading ? 'underline' : 'none',
                padding: '4px 8px',
                transition: 'color 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (canResend && !loading) {
                  e.target.style.color = '#357abd';
                }
              }}
              onMouseLeave={(e) => {
                if (canResend && !loading) {
                  e.target.style.color = '#4a90e2';
                }
              }}
            >
              <FaRedo style={{ fontSize: '12px' }} />
              {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
