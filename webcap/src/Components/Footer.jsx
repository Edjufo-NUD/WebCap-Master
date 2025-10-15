import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { X, Copy, Check, Mail } from 'lucide-react';
import './Footer.css';
import edrian from '../assets/edrian.jpeg';
import anji from '../assets/anjformal.png';
import matthew from '../assets/mattformal.png';
import logo from '../assets/FLIPinoNLogo.png';

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
          {/* Contact Us Section */}

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

// Privacy Modal Component
const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal-content terms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="footer-modal-header">
          <h2>Privacy Policy</h2>
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
            <h3>Privacy Policy</h3>
            <p className="last-updated"><strong>Last Updated: October 10, 2025</strong></p>
            
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            
            <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
            
            <h4>Interpretation and Definitions</h4>
            <p><strong>Interpretation</strong></p>
            <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            
            <p><strong>Definitions</strong></p>
            <p>For the purposes of this Privacy Policy:</p>
            <ul>
              <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
              <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to FLIPino</li>
              <li><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
              <li><strong>Country</strong> refers to: Philippines</li>
              <li><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</li>
              <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
              <li><strong>Service</strong> refers to the Website.</li>
              <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself.</li>
              <li><strong>Website</strong> refers to FLIPino, accessible from https://web-cap-master.vercel.app/</li>
              <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
            </ul>
            
            <h4>Collecting and Using Your Personal Data</h4>
            <p><strong>Types of Data Collected</strong></p>
            
            <p><strong>Personal Data</strong></p>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
            <ul>
              <li>Username</li>
              <li>Email address</li>
              <li>Date of Birth</li>
              <li>Gender (Optional)</li>
              <li>Usage Data</li>
            </ul>
            
            <p><strong>Usage Data</strong></p>
            <p>Usage Data is collected automatically when using the Service.</p>
            <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            
            <p><strong>Performance and Learning Data</strong></p>
            <p>When you use our dance learning features, we collect and store the following data to track your progress and improve your learning experience:</p>
            <ul>
              <li><strong>Dance Performance Metrics:</strong> Your scores, accuracy ratings, and completion status for each dance attempt</li>
              <li><strong>Practice History:</strong> Timestamps and frequency of your dance practice sessions</li>
              <li><strong>Figure-Specific Performance:</strong> Individual performance data for specific dance moves and figures</li>
              <li><strong>User Ratings and Feedback:</strong> Your ratings (0-5 scale) and feedback on dances and learning materials</li>
              <li><strong>Progress Analytics:</strong> Completion rates, improvement trends, and learning patterns</li>
              <li><strong>Video Processing Data (Mobile App):</strong> When you record yourself performing a dance on our mobile app, the video is temporarily uploaded to our server for motion comparison and analysis. This video is automatically deleted immediately after processing is complete and is never stored permanently.</li>
            </ul>
            <p>This performance data helps us provide personalized learning recommendations, track your progress over time, and improve our educational content.</p>
            
            <h4>Third-Party Services</h4>
            <p>We use the following third-party service providers to operate and improve our Service. These providers may have access to your Personal Data only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose:</p>
            <ul>
              <li><strong>Supabase:</strong> We use Supabase for user authentication, database management, and secure data storage. Supabase processes your account information, login credentials, and performance data. Supabase is GDPR and SOC 2 Type II compliant. Learn more at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a></li>
              <li><strong>EmailJS:</strong> We use EmailJS to send transactional emails such as account verification, password resets, and important notifications. EmailJS processes your email address for this purpose. Learn more at <a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">https://www.emailjs.com/legal/privacy-policy/</a></li>
              <li><strong>Vercel:</strong> Our web application is hosted on Vercel's infrastructure. Vercel may collect usage logs and technical data necessary for hosting and performance monitoring. Learn more at <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">https://vercel.com/legal/privacy-policy</a></li>
            </ul>
            <p>By using our Service, you acknowledge and agree that your data may be transferred to and processed by these third-party service providers in accordance with their respective privacy policies.</p>
            
            <h4>Security of Your Personal Data</h4>
            <p>The security of Your Personal Data is important to Us. We implement industry-standard security measures including:</p>
            <ul>
              <li><strong>Secure Authentication:</strong> Authentication and password management are handled through Supabase's secure infrastructure, which uses industry-standard encryption and hashing algorithms. Passwords are never stored in plain text.</li>
              <li><strong>Database Security:</strong> All Personal Data is stored securely using Supabase's GDPR-compliant and SOC 2 Type II certified infrastructure.</li>
              <li><strong>HTTPS Encryption:</strong> All data transmission between your device and our servers is encrypted using SSL/TLS protocols.</li>
              <li><strong>Access Controls:</strong> Strict access controls limit who can view or modify your Personal Data.</li>
            </ul>
            <p>However, remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect Your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h4>Children's Privacy</h4>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.</p>
            
            <h4>Contact Us</h4>
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <p><strong>By email:</strong> flipinoteam@gmail.com</p>
            
            <p className="terms-footer">
              <strong>By using FLIPino, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</strong>
            </p>
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
            <p className="last-updated"><strong>Last Updated: October 10, 2025</strong></p>
            
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
              <li>Username (6-16 characters, used as display name)</li>
              <li>Email address (Gmail accounts only)</li>
              <li>Date of Birth (to verify minimum age of 13)</li>
              <li>Gender (optional)</li>
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
              <li><strong>Video recordings (Mobile App):</strong> Temporary video uploads for motion analysis, automatically deleted after processing</li>
            </ul>
            
            <p>For complete details on how we collect, use, and protect your data, please review our Privacy Policy.</p>
            
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
            
            <h4>7. Disclaimer and Limitation of Liability</h4>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. FLIPino does not guarantee:</p>
            <ul>
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of dance instruction or cultural information</li>
              <li>Achievement of specific learning outcomes</li>
            </ul>
            <p>FLIPino shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
            
            <h4>8. Changes to These Terms</h4>
            <p>We reserve the right to modify these Terms at any time. When we make changes:</p>
            <ul>
              <li>We will update the "Last Updated" date at the top of this document</li>
              <li>Significant changes will be communicated via email</li>
              <li>Continued use of the Service after changes constitutes acceptance of the new Terms</li>
              <li>If you do not agree to the updated Terms, you must stop using the Service</li>
            </ul>
            
            <h4>9. Contact Us</h4>
            <p>If you have any questions about these Terms of Service, you can contact us:</p>
            <p><strong>By email:</strong> flipinoteam@gmail.com</p>
            
            <h4>10. Governing Law and Jurisdiction</h4>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. We comply with the Data Privacy Act of 2012 (Republic Act No. 10173) and regulations enforced by the National Privacy Commission.</p>
            <p>Any disputes, claims, or legal proceedings arising from or related to your use of FLIPino shall be resolved exclusively in the competent courts of the Philippines. By using our Service, you consent to the jurisdiction and venue of such courts.</p>
            
            <p className="terms-footer">
              <strong>By using FLIPino, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=flipinoteam@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  aria-label="Email"
                >
                  <Mail size={20} />
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
              <span 
                onClick={() => setShowPrivacyModal(true)} 
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
                Privacy Policy
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
      <PrivacyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </>
  );
};

export default Footer;
