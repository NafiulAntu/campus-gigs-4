import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpWithEmail, signInWithGoogle, getCurrentToken } from '../../../services/firebaseAuth';
import { syncUserWithBackend } from '../../../services/api';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import GmailIcon from "../../../assets/icons/GmailIcon";
import GitHubIcon from "../../../assets/icons/GitHubIcon";
import LinkedInIcon from "../../../assets/icons/LinkedInIcon";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion, useMotionValue, useMotionTemplate, animate } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const COLORS = ["#ef4444 ", "#0ea5e9", "#14b8a6", "#3b82f6"];
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

  const backgroundImage = useMotionTemplate`radial-gradient(200% 140% at 50% 0%, #020617 50%, ${color})`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAgreed) {
      setError('You must agree to terms');
      return;
    }
    
    setLoading(true);
    try {
      // Create Firebase account
      const firebaseUser = await signUpWithEmail(
        formData.email, 
        formData.password,
        formData.full_name
      );
      
      // Get Firebase token
      const token = await getCurrentToken();
      
      // Sync with backend
      const backendUser = await syncUserWithBackend(token, {
        email: firebaseUser.email,
        full_name: formData.full_name
      });
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(backendUser));
      
      setSuccess('Account created! Redirecting...');
      
      // Redirect to post page after 1.5 seconds
      setTimeout(() => {
        navigate('/post');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (platform) => {
    setError('');
    setLoading(true);
    
    try {
      let firebaseUser;
      
      if (platform === "Gmail") {
        firebaseUser = await signInWithGoogle();
      } else {
        setError(`${platform} sign-up coming soon!`);
        setLoading(false);
        return;
      }
      
      // Get Firebase token
      const token = await getCurrentToken();
      
      // Sync with backend
      const backendUser = await syncUserWithBackend(token, {
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        profile_picture: firebaseUser.photoURL
      });
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(backendUser));
      
      setSuccess('Account created! Redirecting...');
      
      // Redirect to post page
      setTimeout(() => {
        navigate('/post');
      }, 1500);
    } catch (err) {
      console.error('Social signup error:', err);
      setError(err.message || 'Social sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <motion.div 
        className="signup-branding-panel"
        style={{ background: backgroundImage }}
      >
        <div className="aurora-canvas-wrapper">
          <Canvas>
            <Stars radius={50} count={2500} factor={4} fade speed={2} />
          </Canvas>
        </div>
        <div className="branding-content">
          <h1 className="branding-logo">Campus Gigs</h1>
          <p className="branding-tagline">Connect. Collaborate. Succeed.</p>
        </div>
      </motion.div>

      <div className="signup-form-panel">
        <div className="form-content">
          <h2 className="signup-title">Join Campus Gigs</h2>

          <div className="social-signup-group">
            <button
              className="social-button gmail"
              onClick={() => handleSocialSignUp("Gmail")}
            >
              <GmailIcon className="social-icon-svg" /> 
              <span>Gmail</span>
            </button>
            <button
              className="social-button github"
              onClick={() => handleSocialSignUp("GitHub")}
            >
              <GitHubIcon className="social-icon-svg" /> 
              <span>GitHub</span>
            </button>
            <button
              className="social-button linkedin"
              onClick={() => handleSocialSignUp("LinkedIn")}
            >
              <LinkedInIcon className="social-icon-svg" /> 
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="or-divider">
            <span>Or</span>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="full_name"
                placeholder="Full name"
                value={formData.full_name}
                onChange={handleChange}
                className="signup-input"
                required
              />
            </div>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="signup-input"
                required
              />
            </div>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="signup-input"
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
            <div className="input-wrapper">
              <FaCheckCircle className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="signup-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="terms-link" target="_blank">Terms</Link> and{" "}
                <Link to="/privacy" className="terms-link" target="_blank">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            {error && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
            {success && <p style={{ color: '#10b981', marginTop: '10px', fontSize: '14px' }}>{success}</p>}
          </form>

          <p className="signin-link-text">
            Already have an account?{" "}
            <Link to="/login" className="signin-link">
              Sign in
            </Link>
          </p>
          
          {/* Add Another Account Info */}
          <p className="signin-link-text" style={{ marginTop: '10px', fontSize: '13px', color: '#9ca3af' }}>
            Creating another account? You can switch between accounts after signing up.
          </p>
        </div>
      </div>
    </div>
  );
}