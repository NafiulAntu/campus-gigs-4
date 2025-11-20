import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
      {/* Reset Password Form */}
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

          <h2 className="signin-title">Create New Password</h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginBottom: '32px', 
            textAlign: 'left', 
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            Enter your new password below.
          </p>

          {success ? (
            <div style={{ 
              padding: '20px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderLeft: '4px solid #10b981', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#10b981' 
              }}>
                ✓ Password Reset Successful!
              </p>
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '14px', 
                color: 'rgba(16, 185, 129, 0.8)' 
              }}>
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="signin-form">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="signin-input"
                  required
                  disabled={loading || !token}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="signin-input"
                  required
                  disabled={loading || !token}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button 
                type="submit" 
                className="signin-button" 
                disabled={loading || !token}
                style={{ marginTop: '16px' }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
