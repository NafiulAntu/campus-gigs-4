import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess('Reset link sent successfully! Check your email.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container" style={{ minHeight: '100vh', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Left Panel: Branding */}
      <div className="signin-branding-panel" style={{ overflow: 'hidden', height: '100%', background: '#1e293b' }}>
        <div className="branding-content">
          <h1 className="branding-logo">Campus Gigs</h1>
          <p className="branding-tagline">Connect. Collaborate. Succeed.</p>
        </div>
      </div>

      {/* Right Panel: Forgot Password Form */}
      <div className="signin-form-panel" style={{ overflow: 'auto', height: '100%' }}>
        <div className="form-content">
          {/* Back Button */}
          <Link to="/login" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#10d1dfff', 
            fontSize: '14px',
            marginBottom: '20px',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#0ea5e9'}
          onMouseLeave={(e) => e.target.style.color = '#10d1dfff'}
          >
            <FaArrowLeft /> Back to Sign In
          </Link>

          <h2 className="signin-title">Reset Your Password</h2>
          <p style={{ 
            color: '#9ca3af', 
            marginBottom: '32px', 
            textAlign: 'center',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input"
                required
              />
            </div>

            <button type="submit" className="signin-button" disabled={loading || success}>
              {loading ? 'Sending...' : success ? 'Link Sent!' : 'Send Reset Link'}
            </button>
            
            {error && (
              <p style={{ 
                color: '#ef4444', 
                marginTop: '16px', 
                fontSize: '14px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}
            
            {success && (
              <p style={{ 
                color: '#10b981', 
                marginTop: '16px', 
                fontSize: '14px',
                padding: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ✓ {success}
              </p>
            )}
          </form>

          {/* Additional Info */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '13px',
              margin: 0,
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              💡 Didn't receive the email? Check your spam folder or{' '}
              <span 
                onClick={() => email && handleSubmit(new Event('submit'))}
                style={{ 
                  color: '#10d1dfff', 
                  cursor: email ? 'pointer' : 'not-allowed',
                  textDecoration: 'underline',
                  opacity: email ? 1 : 0.5
                }}
              >
                resend
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}