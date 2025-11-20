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
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '48px',
        maxWidth: '480px',
        width: '90%',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%' }}>
          <Link 
            to="/login" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#10b981', 
              fontSize: '14px', 
              marginBottom: '32px', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              padding: '8px 0'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#8b5cf6';
              e.target.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#10b981';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <FaArrowLeft /> Back to Sign In
          </Link>

          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
            }}>
              <FaLock style={{ fontSize: '28px', color: '#fff' }} />
            </div>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em'
            }}>Create New Password</h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '15px',
              lineHeight: '1.6',
              margin: 0
            }}>
              Your new password must be different from previous passwords.
            </p>
          </div>

          {success ? (
            <div style={{ 
              padding: '32px', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px', 
              textAlign: 'center',
              animation: 'successPulse 2s ease infinite'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'bounce 1s ease infinite'
              }}>
                <span style={{ fontSize: '32px' }}>✓</span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: 700, 
                color: '#10b981',
                marginBottom: '8px'
              }}>
                Password Reset Successful!
              </p>
              <p style={{ 
                margin: 0,
                fontSize: '14px', 
                color: 'rgba(16, 185, 129, 0.8)' 
              }}>
                Redirecting to sign in...
              </p>
              <style>{
                `@keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes successPulse {
                  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
                  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
                }`
              }</style>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: '32px' }}>
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
                disabled={loading || !token}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !token ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '24px',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                  opacity: loading || !token ? 0.7 : 1,
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && token) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #fff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
              
              <style>{
                `@keyframes spin {
                  to { transform: rotate(360deg); }
                }`
              }</style>

              {error && (
                <div style={{ 
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  animation: 'slideIn 0.3s ease'
                }}>
                  <span style={{ color: '#ef4444', fontSize: '18px', flexShrink: 0 }}>⚠</span>
                  <p style={{ 
                    color: '#fca5a5', 
                    fontSize: '14px', 
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {error}
                  </p>
                </div>
              )}
              
              <style>{
                `@keyframes slideIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }`
              }</style>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
