import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { X, Copy, Check } from 'lucide-react';
import './Footer.css';
import edrian from '../assets/edrian.jpeg';
import anji from '../assets/anjformal.png';
import matthew from '../assets/mattformal.png';

// Developers Modal Component
const DevelopersModal = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(null);

  if (!isOpen) return null;

  const developers = [
    {
      name: "Edrian Formilleza",
      email: "ejformilleza@gmail.com",
      image: edrian
    },
    {
      name: "Femie Estepa",
      email: "ynaestepa1515@gmail.com",
      image: anji
    },
    {
      name: "Matthew Faner",
      email: "matthewfaner13@gmail.com",
      image: matthew
    }
  ];

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="footer-modal-header">
          <h2>Developers</h2>
          <button 
            className="footer-x-close-btn" 
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#6b7280',
              padding: '0',
              minWidth: '36px',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="footer-modal-body">
          <div className="developer-list">
            {developers.map((dev, index) => (
              <div key={index} className="developer-item">
                <img 
                  src={dev.image} 
                  alt={dev.name}
                  className="developer-image"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=a0855b&color=fff&size=200`;
                  }}
                />
                <div className="developer-info">
                  <h4 className="developer-name">{dev.name}</h4>
                  <div className="developer-email-container">
                    <span className="developer-email">{dev.email}</span>
                    <span
                      className="footer-copy-icon-btn"
                      onClick={() => handleCopyEmail(dev.email)}
                      title="Copy email"
                      style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {copiedEmail === dev.email ? (
                        <Check size={16} style={{ color: '#10b981', display: 'block' }} />
                      ) : (
                        <Copy size={16} style={{ color: '#9ca3af', display: 'block' }} />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Terms Modal Component
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal-content terms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="footer-modal-header">
          <h2>Terms and Conditions</h2>
          <button 
            className="footer-x-close-btn" 
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#6b7280',
              padding: '0',
              minWidth: '36px',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="footer-modal-body">
          <div className="terms-content">
            <h3>Terms of Service - FLIPino</h3>         
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing or using FLIPino ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.</p>
            
            <h4>2. Description of Service</h4>
            <p>FLIPino is an educational platform dedicated to Filipino traditional dance learning and cultural preservation. The Service provides:</p>
            <ul>
              <li>Dance tutorials and step-by-step instructions</li>
              <li>Performance tracking and progress analytics</li>
              <li>Cultural education resources</li>
            </ul>
            
            <h4>3. User Accounts and Registration</h4>
            <p><strong>3.1 Account Requirements</strong></p>
            <ul>
              <li>You must provide a valid Gmail address (@gmail.com)</li>
              <li>Username must be 6-16 characters long and unique</li>
              <li>Password must meet security requirements (8-24 characters with uppercase, lowercase, number, and special character)</li>
            </ul>
            
            <h4>4. Data Collection and Privacy</h4>
            <p><strong>4.1 Personal Information Collected</strong></p>
            <ul>
              <li>Email address (Gmail accounts only)</li>
              <li>Account creation date and status</li>
              <li>User role and permissions</li>
            </ul>
            
            <p><strong>4.2 Performance and Learning Data</strong></p>
            <ul>
              <li>Dance attempt scores and timestamps</li>
              <li>Figure-specific performance metrics</li>
              <li>Progress tracking and completion rates</li>
              <li>User feedback and ratings (0-5 scale)</li>
              <li>Learning analytics and preferences</li>
            </ul>
            
            <h4>5. Acceptable Use Policy</h4>
            <p><strong>5.1 Permitted Uses</strong></p>
            <ul>
              <li>Educational and cultural learning purposes</li>
              <li>Personal skill development in Filipino traditional dance</li>
              <li>Sharing knowledge and cultural appreciation</li>
            </ul>
            
            <p><strong>5.2 Prohibited Activities</strong></p>
            <ul>
              <li>Uploading false, misleading, or culturally insensitive content</li>
              <li>Attempting to gain unauthorized access to other user accounts</li>
              <li>Using the Service for commercial purposes without permission</li>
              <li>Harassment, bullying, or inappropriate behavior toward other users</li>
              <li>Violating intellectual property rights</li>
            </ul>
            
            <h4>6. Cultural Sensitivity and Respect</h4>
            <ul>
              <li>Content must respect Filipino cultural traditions</li>
              <li>Regional variations and interpretations are acknowledged</li>
              <li>Traditional knowledge is treated with appropriate reverence</li>
              <li>Primary goal is cultural preservation and education</li>
            </ul>
            
            <p className="terms-footer">
              <strong>By using FLIPino, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  const [showDevelopersModal, setShowDevelopersModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Main Footer Content */}
          <div className="footer-content">
            {/* Social Media Section - First */}
            <div className="footer-section footer-social">
              <div className="footer-social-icons">
                <a 
                  href="https://www.facebook.com/IndakHamakaDanceCompany?mibextid=ZbWKwL" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/indakhamakadancecompany?igsh=ZHBwM2Yzbm1lMjZ6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
                <a 
                  href="https://m.youtube.com/@indakhamakadancecompany" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  aria-label="YouTube"
                >
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>

            {/* Navigation Links - Second (combined nav and links) */}
            <div className="footer-section footer-nav">
              <span 
                onClick={() => handleNavigation('/home')} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  width: 'fit-content'
                }}
              >
                Home
              </span>
              <span 
                onClick={() => handleNavigation('/dances')} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  width: 'fit-content'
                }}
              >
                Folk Dances
              </span>
              <span 
                onClick={() => handleNavigation('/culture')} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  width: 'fit-content'
                }}
              >
                Dance Tradition
              </span>
              <span 
                onClick={() => handleNavigation('/about')} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  width: 'fit-content'
                }}
              >
                About
              </span>
              <span 
                onClick={() => setShowDevelopersModal(true)} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                Developers
              </span>
              <span 
                onClick={() => setShowTermsModal(true)} 
                style={{ 
                  background: 'transparent !important', 
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  padding: '0.25rem 0',
                  borderRadius: '0',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                Terms & Conditions
              </span>
            </div>

            {/* Copyright Section - Third */}
            <div className="footer-section footer-copyright">
              <p>© 2025 By FLIPino in partnership with <span className="footer-partner">INDAK Hamaka Dance Company</span></p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DevelopersModal 
        isOpen={showDevelopersModal} 
        onClose={() => setShowDevelopersModal(false)} 
      />
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </>
  );
};

export default Footer;
