import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaShieldAlt } from 'react-icons/fa';

export default function Terms() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <Link 
          to="/signup" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#10b981', 
            fontSize: '14px', 
            marginBottom: '32px', 
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.color = '#10b981'}
        >
          <FaArrowLeft /> Back to Sign Up
        </Link>

        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
          }}>
            <FaFileContract style={{ fontSize: '36px', color: '#fff' }} />
          </div>
          <h1 style={{ 
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>Terms of Service</h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: '16px',
            margin: 0
          }}>
            Last Updated: November 21, 2025
          </p>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <Section 
            title="1. Acceptance of Terms"
            content="By accessing and using Campus Gigs, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our service."
          />

          <Section 
            title="2. Description of Service"
            content="Campus Gigs is a platform designed to connect students and professionals for collaboration, networking, and career opportunities. We provide tools for communication, project collaboration, and professional development."
          />

          <Section 
            title="3. User Accounts"
            content={`
              • You must be at least 16 years old to create an account
              • You are responsible for maintaining the confidentiality of your account credentials
              • You are responsible for all activities that occur under your account
              • You must provide accurate, current, and complete information during registration
              • You may not use another person's account without permission
            `}
          />

          <Section 
            title="4. User Conduct"
            content={`
              You agree not to:
              • Post false, inaccurate, misleading, or fraudulent content
              • Harass, abuse, or harm other users
              • Violate any laws or regulations
              • Infringe on intellectual property rights
              • Upload viruses or malicious code
              • Spam or send unsolicited messages
              • Impersonate any person or entity
              • Scrape or harvest user data without permission
            `}
          />

          <Section 
            title="5. Content Ownership"
            content="You retain ownership of content you post on Campus Gigs. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform."
          />

          <Section 
            title="6. Intellectual Property"
            content="The Campus Gigs platform, including its design, features, and functionality, is owned by Campus Gigs and protected by international copyright, trademark, and other intellectual property laws."
          />

          <Section 
            title="7. Privacy and Data Protection"
            content="Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information."
          />

          <Section 
            title="8. Termination"
            content="We reserve the right to suspend or terminate your account at any time for violation of these Terms of Service. You may also delete your account at any time through your account settings."
          />

          <Section 
            title="9. Limitation of Liability"
            content="Campus Gigs is provided 'as is' without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the service."
          />

          <Section 
            title="10. Changes to Terms"
            content="We reserve the right to modify these terms at any time. We will notify users of any material changes. Continued use of Campus Gigs after changes constitutes acceptance of the new terms."
          />

          <Section 
            title="11. Contact Information"
            content="For questions about these Terms of Service, please contact us at support@campusgigs.com"
          />

          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <FaShieldAlt style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Your trust is our priority
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              We're committed to creating a safe, respectful, and professional environment for all users.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Link 
            to="/privacy" 
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              marginRight: '24px'
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/signup" 
            style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#3b82f6'
      }}>
        {title}
      </h2>
      <p style={{
        color: '#ffffff',
        lineHeight: '1.8',
        fontSize: '15px',
        whiteSpace: 'pre-line',
        margin: 0,
        fontWeight: '600'
      }}>
        {content}
      </p>
    </div>
  );
}
