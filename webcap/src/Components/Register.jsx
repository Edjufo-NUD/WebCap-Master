import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Register.css";
import { supabase } from "../supabasebaseClient"; // Make sure this path is correct

// Snackbar component for feedback
const Snackbar = ({ message, type, onClose }) => (
  <div
    className={`snackbar ${type}`}
    onClick={onClose}
    role="alert"
    aria-live="assertive"
  >
    {message}
  </div>
);

// Password Requirements component
const PasswordRequirements = ({ password, isVisible }) => {
  const requirements = [
    { key: 'length', text: '8-24 characters', check: password.length >= 8 && password.length <= 24 },
    { key: 'lowercase', text: 'One lowercase letter', check: /(?=.*[a-z])/.test(password) },
    { key: 'uppercase', text: 'One uppercase letter', check: /(?=.*[A-Z])/.test(password) },
    { key: 'number', text: 'One number', check: /(?=.*\d)/.test(password) },
    { key: 'special', text: 'One special character', check: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password) }
  ];

  if (!isVisible) return null;

  return (
    <div className="password-requirements">
      <div className="requirements-title">Password Requirements:</div>
      {requirements.map(req => (
        <div key={req.key} className={`requirement-item ${req.check ? 'valid' : 'invalid'}`}>
          <span className="requirement-icon">
            {req.check ? <FaCheck /> : <FaTimes />}
          </span>
          <span className="requirement-text">{req.text}</span>
        </div>
      ))}
    </div>
  );
};

// Terms Modal component
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-content" onClick={e => e.stopPropagation()}>
        <div className="terms-modal-header">
          <h2>Terms and Conditions</h2>
          <button className="terms-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="terms-modal-body">
          <div className="terms-content">
            <h3>Terms of Service - FLIPino</h3>
            <p><strong>Last Updated:</strong> October 6, 2025</p>
            
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
        <div className="terms-modal-footer">
          <button className="terms-modal-accept" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    // Show error messages longer than success messages
    const timeout = type === "error" ? 5000 : 3000;
    setTimeout(() => setSnackbar({ message: "", type: "" }), timeout);
  };

  const validatePassword = (password) => {
    const requirements = [
      { check: password.length >= 8 && password.length <= 24, message: "Password must be between 8-24 characters long." },
      { check: /(?=.*[a-z])/.test(password), message: "Password must contain at least one lowercase letter." },
      { check: /(?=.*[A-Z])/.test(password), message: "Password must contain at least one uppercase letter." },
      { check: /(?=.*\d)/.test(password), message: "Password must contain at least one number." },
      { check: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password), message: "Password must contain at least one special character." }
    ];
    
    const failedRequirements = requirements.filter(req => !req.check);
    if (failedRequirements.length > 0) {
      return failedRequirements[0].message;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Terms and Conditions validation
    if (!acceptTerms) {
      showSnackbar("Please accept the Terms and Conditions to continue", "error");
      setLoading(false);
      return;
    }

    // Gmail validation
    if (!email.endsWith("@gmail.com")) {
      showSnackbar("Please use a Gmail address (@gmail.com)", "error");
      setLoading(false);
      return;
    }

    // Username validation: min 6, max 16
    if (username.length < 6 || username.length > 16) {
      showSnackbar("Username must be between 6 and 16 characters!", "error");
      setLoading(false);
      return;
    }

    // Password validation: min 8, max 24, with complexity requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      showSnackbar(passwordError, "error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar("Passwords do not match!", "error");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found (which is good)
        console.error("Error checking username:", checkError);
        showSnackbar("Error checking username availability. Please try again.", "error");
        setLoading(false);
        return;
      }

      if (existingUser) {
        showSnackbar("This username is already taken. Please choose a different username.", "error");
        setLoading(false);
        return;
      }

      // Step 2: Sign up in Supabase Auth and set display_name
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username, // save username in Auth metadata
          },
        },
      });

      if (signUpError) {
        console.error("Supabase signUp error:", signUpError);
        
        // Handle specific error cases with user-friendly messages
        let errorMessage = "Registration failed. Please try again.";
        
        if (signUpError.message?.toLowerCase().includes("email")) {
          if (signUpError.message.toLowerCase().includes("already") || 
              signUpError.message.toLowerCase().includes("registered") ||
              signUpError.message.toLowerCase().includes("exists")) {
            errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
          } else if (signUpError.message.toLowerCase().includes("invalid")) {
            errorMessage = "Please enter a valid email address.";
          }
        } else if (signUpError.message?.toLowerCase().includes("password")) {
          errorMessage = "Password does not meet requirements. Please check and try again.";
        } else if (signUpError.message?.toLowerCase().includes("network") || 
                   signUpError.message?.toLowerCase().includes("connection")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        showSnackbar(errorMessage, "error");
        setLoading(false);
        return;
      }

      // Step 3: Insert into your custom users table (mirror username from Auth)
      if (signUpData?.user?.id) {
        const { error: dbError } = await supabase.from("users").insert([
          {
            id: signUpData.user.id, // link to auth.users.id
            username: signUpData.user.user_metadata.display_name, // always mirrors Auth
            email,
            role: "user", // default role
            status: "active", // default status
          },
        ]);

        if (dbError) {
          console.error("Insert into users failed:", dbError.message);
          
          // Handle specific database errors with user-friendly messages
          let errorMessage = "Failed to create user profile. Please try again.";
          
          if (dbError.message?.toLowerCase().includes("duplicate key") || 
              dbError.message?.toLowerCase().includes("unique constraint")) {
            if (dbError.message.toLowerCase().includes("email")) {
              errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
            } else if (dbError.message.toLowerCase().includes("username")) {
              errorMessage = "This username is already taken. Please choose a different username.";
            } else {
              errorMessage = "An account with these details already exists. Please try different information.";
            }
          } else if (dbError.message?.toLowerCase().includes("network") || 
                     dbError.message?.toLowerCase().includes("connection")) {
            errorMessage = "Network error. Please check your connection and try again.";
          }
          
          showSnackbar(errorMessage, "error");
          setLoading(false);
          return;
        }
      }

      showSnackbar(
        "Registration successful! Please check your email to confirm your account.",
        "success"
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      showSnackbar(`Unexpected error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <div className="register-logo">
          <img src={IndakHamakaLogo} alt="FLIPino" className="logo-image" />
          <span className="logo-text">FLIPino</span>
        </div>
      </div>

      <div className="register-content">
        <div className="register-box">
          <h1 className="register-title">Hello!</h1>
          <p className="register-subtitle">Let's Register Your Account</p>

          <div className="form-box">
            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="register-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="register-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="register-input password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 150)}
                    required
                    minLength={8}
                    maxLength={24}
                    style={{ paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "18px",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <PasswordRequirements 
                  password={password} 
                  isVisible={showPasswordRequirements} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="register-input password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={24}
                    style={{ paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "18px",
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="terms-checkbox-container">
                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="terms-checkbox"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-text">
                    I have read and agree to the{" "}
                    <span
                      className="terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                    >
                      Terms and Conditions
                    </span>
                  </span>
                </label>
              </div>

              <button type="submit" className="register-button" disabled={loading || !acceptTerms}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="register-footer">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="register-link">
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
      {snackbar.message && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ message: "", type: "" })}
        />
      )}
      
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default Register;
