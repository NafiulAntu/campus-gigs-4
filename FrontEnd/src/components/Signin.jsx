import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin, oauthGoogle, oauthGithub, oauthLinkedIn } from '../services/api';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import GmailIcon from "../assets/icons/GmailIcon";
import GitHubIcon from "../assets/icons/GitHubIcon";
import LinkedInIcon from "../assets/icons/LinkedInIcon";
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

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await signin({ email, password, rememberMe });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to post page after 1 second
      setTimeout(() => {
        navigate('/post');
      }, 1000);
    } catch (err) {
      console.error('Signin error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (platform) => {
    if (platform === "Gmail") oauthGoogle();
    else if (platform === "GitHub") oauthGithub();
    else if (platform === "LinkedIn") oauthLinkedIn();
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
        </div>
      </div>
    </div>
  );
}