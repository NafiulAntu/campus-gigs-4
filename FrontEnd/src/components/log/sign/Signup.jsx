import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, oauthGoogle, oauthGithub, oauthLinkedIn } from '../../../services/api';
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
      const res = await signup({ ...formData, terms_agreed: true });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Account created! Redirecting to login...');
      
      // Redirect to login page after 1.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (platform) => {
    if (platform === "Gmail") oauthGoogle();
    else if (platform === "GitHub") oauthGithub();
    else if (platform === "LinkedIn") oauthLinkedIn();
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
                <a href="#" className="terms-link">Terms</a> and{" "}
                <a href="#" className="terms-link">Privacy Policy</a>
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
        </div>
      </div>
    </div>
  );
}