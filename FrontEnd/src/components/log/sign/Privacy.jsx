import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUserShield, FaLock, FaDatabase, FaCookie } from 'react-icons/fa';

export default function Privacy() {
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
            <FaUserShield style={{ fontSize: '36px', color: '#fff' }} />
          </div>
          <h1 style={{ 
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>Privacy Policy</h1>
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
            icon={<FaDatabase />}
            title="1. Information We Collect"
            content={`
              Personal Information:
              • Name and email address
              • Profile information you choose to provide
              • Educational background and professional experience
              • Profile picture and other uploaded content

              Usage Information:
              • Device information and IP address
              • Browser type and operating system
              • Pages visited and features used
              • Time spent on the platform
              • Interaction with other users
            `}
          />

          <Section 
            icon={<FaLock />}
            title="2. How We Use Your Information"
            content={`
              We use your information to:
              • Provide, maintain, and improve our services
              • Create and manage your account
              • Facilitate connections between users
              • Send you updates, notifications, and promotional materials
              • Respond to your inquiries and provide customer support
              • Detect and prevent fraud, abuse, and security incidents
              • Analyze usage patterns to improve user experience
              • Comply with legal obligations
            `}
          />

          <Section 
            icon={<FaUserShield />}
            title="3. Information Sharing"
            content={`
              We do not sell your personal information. We may share information with:

              • Other Users: Profile information you choose to make public
              • Service Providers: Third-party vendors who help us operate our platform
              • Legal Requirements: When required by law or to protect our rights
              • Business Transfers: In connection with mergers, acquisitions, or asset sales

              Your profile visibility settings control what information other users can see.
            `}
          />

          <Section 
            icon={<FaCookie />}
            title="4. Cookies and Tracking"
            content={`
              We use cookies and similar technologies to:
              • Keep you logged in
              • Remember your preferences
              • Analyze site traffic and usage patterns
              • Provide personalized content and advertisements

              You can control cookies through your browser settings, but some features may not function properly if you disable them.
            `}
          />

          <Section 
            title="5. Data Security"
            content="We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure."
          />

          <Section 
            title="6. Your Rights and Choices"
            content={`
              You have the right to:
              • Access and download your data
              • Correct inaccurate information
              • Delete your account and data
              • Opt-out of marketing communications
              • Control your privacy settings
              • Request data portability

              To exercise these rights, visit your account settings or contact us at privacy@campusgigs.com
            `}
          />

          <Section 
            title="7. Data Retention"
            content="We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, fraud prevention, and legitimate business purposes."
          />

          <Section 
            title="8. Children's Privacy"
            content="Campus Gigs is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If we discover that a child under 16 has provided personal information, we will delete it immediately."
          />

          <Section 
            title="9. International Data Transfers"
            content="Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy."
          />

          <Section 
            title="10. Changes to Privacy Policy"
            content="We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date."
          />

          <Section 
            title="11. Contact Us"
            content={`
              For questions about this Privacy Policy or our data practices, contact us at:
              
              Email: privacy@campusgigs.com
              Address: Campus Gigs Privacy Team
              [Your Address Here]
            `}
          />

          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <FaUserShield style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Your privacy matters to us
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              We're committed to transparency and protecting your personal information. If you have any concerns, please don't hesitate to reach out.
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
            to="/terms" 
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              marginRight: '24px'
            }}
          >
            Terms of Service
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

function Section({ icon, title, content }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {icon && <span style={{ color: '#3b82f6' }}>{icon}</span>}
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
