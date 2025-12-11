import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmail, signInWithGoogle, signInWithGitHub, getCurrentToken } from '../../../services/firebaseAuth';
import { syncUserWithBackend, checkAdminStatus } from '../../../services/api';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";
import GmailIcon from "../../../assets/icons/GmailIcon";
import GitHubIcon from "../../../assets/icons/GitHubIcon";
import LinkedInIcon from "../../../assets/icons/LinkedInIcon";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";

export default function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if logged-in user is admin
  useEffect(() => {
    const checkIfAdmin = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (token && user) {
        // Quick check from local storage first
        if (user.role === 'admin' || user.role === 'super_admin') {
          setIsAdmin(true);
        } else {
          // Verify with backend
          try {
            const response = await checkAdminStatus();
            setIsAdmin(response.data.isAdmin);
          } catch (err) {
            setIsAdmin(false);
          }
        }
      }
    };
    
    checkIfAdmin();
  }, []);

  // Aurora animation colors
  const COLORS = ["#ef4444", "#0ea5e9", "#14b8a6", "#3b82f6"];
  const color = useMotionValue(COLORS[0]);

  React.useEffect(() => {
    const controls = animate(color, COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(180% 160% at 100% 0%, #020617 50%, ${color})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Only valid Gmail addresses (@gmail.com) are allowed');
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with Firebase (this already syncs with backend)
      const result = await signInWithEmail(email, password);
      
      // Store token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.backendUser));
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to post page after 1 second
      setTimeout(() => {
        navigate('/post');
      }, 1000);
    } catch (err) {
      console.error('Signin error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (platform) => {
    setError('');
    setLoading(true);
    
    try {
      let firebaseUser;
      
      let result;
      
      if (platform === "Gmail") {
        result = await signInWithGoogle();
      } else if (platform === "GitHub") {
        result = await signInWithGitHub();
      } else {
        setError(`${platform} sign-in coming soon!`);
        setLoading(false);
        return;
      }
      
      // Store token and user info
      console.log('🔍 Google Sign-In - backendUser:', result.backendUser);
      console.log('🔍 Profile picture URL:', result.backendUser?.profile_picture);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.backendUser));
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to post page
      setTimeout(() => {
        navigate('/post');
      }, 1000);
    } catch (err) {
      console.error('Social signin error:', err);
      setError(err.message || 'Social sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {/* Left Panel: Aurora Background with Campus Gigs */}
      <motion.div 
        className="signin-branding-panel"
        style={{ background: backgroundImage }}
      >
        <div className="aurora-canvas-wrapper">
          <Canvas>
            <Stars radius={50} count={2500} factor={4} fade speed={2} />
          </Canvas>
        </div>
        <div className="branding-content ">
          <h1 className="branding-logo">Campus Gigs</h1>
          <p className="branding-tagline">Connect. Collaborate. Succeed.</p>
        </div>
      </motion.div>

      {/* Right Panel: Sign In Form */}
      <div className="signin-form-panel">
        <div className="form-content">
          <h2 className="signin-title">Welcome Back</h2>

          {/* Social Sign-In Buttons */}
          <div className="social-signin-group">
            <button
              className="social-button gmail"
              onClick={() => handleSocialSignIn("Gmail")}
            >
              <GmailIcon className="social-icon-svg" /> 
              <span>Gmail</span>
            </button>
            <button
              className="social-button github"
              onClick={() => handleSocialSignIn("GitHub")}
            >
              <GitHubIcon className="social-icon-svg" /> 
              <span>GitHub</span>
            </button>
            <button
              className="social-button linkedin"
              onClick={() => handleSocialSignIn("LinkedIn")}
            >
              <LinkedInIcon className="social-icon-svg" /> 
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="or-divider">
            <span>Or</span>
          </div>

          {/* Email/Password Form */}
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
              />
            </div>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signin-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="remember-forgot">
              <label className="remember-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="signin-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Admin Panel Button - Only visible to admins */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
                }}
              >
                <FaUserShield size={18} />
                Admin Panel
              </button>
            )}

            {error && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
            {success && <p style={{ color: '#10b981', marginTop: '10px', fontSize: '14px' }}>{success}</p>}
          </form>

          {/* Sign Up Link */}
          <p className="signup-link-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
          
          {/* Add Another Account Link */}
          <p className="signup-link-text" style={{ marginTop: '10px' }}>
            Already have multiple accounts?{" "}
            <Link to="/signup" className="signup-link">
              Add another account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}