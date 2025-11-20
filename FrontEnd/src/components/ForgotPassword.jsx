import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Aurora animation colors
  const COLORS = [];
  const color = useMotionValue(COLORS[0]);

  React.useEffect(() => {
    const controls = animate(color, COLORS, {
      ease: "easeInOut",
      duration: 0,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(0% 0% at 0% 0%, #020617 100%, ${color})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess('Password reset link sent to your email!');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
      {/* Forgot Password Form */}
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
            to="/login" 
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
            <FaArrowLeft /> Back to Sign In
          </Link>

          <h2 className="signin-title">Reset Password</h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginBottom: '32px', 
            textAlign: 'left', 
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="signin-button" 
              disabled={loading || success}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Sending...' : success ? '✓ Sent!' : 'Send Reset Link'}
            </button>

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
            
            {success && (
              <p style={{ 
                color: '#10b981', 
                marginTop: '16px', 
                fontSize: '14px', 
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                ✓ {success}
              </p>
            )}
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '28px', 
            fontSize: '15px', 
            color: 'rgba(255, 255, 255, 0.7)' 
          }}>
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="signup-link"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
