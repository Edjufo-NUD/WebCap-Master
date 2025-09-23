import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState(""); // Add state for user email
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        setError("Invalid reset link. Please request a new password reset.");
        return;
      }

      if (!session) {
        setError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }

      // Get user email from the session
      if (session.user && session.user.email) {
        setUserEmail(session.user.email);
      }

      setIsValidSession(true);
    };

    checkSession();
  }, []);

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (password.length > 24) return "Password must be no more than 24 characters long.";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number.";
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isValidSession) {
      setError("Invalid session. Please request a new password reset.");
      return;
    }

    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Password update error:", error);
        
        if (error.message && error.message.toLowerCase().includes("new password should be different")) {
          setError("Your new password must be different from your current password.");
        } else if (error.message && error.message.toLowerCase().includes("weak password")) {
          setError("Password is too weak. Please choose a stronger password.");
        } else {
          setError("Failed to reset password. Please try again or request a new reset link.");
        }
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        
        // Sign out the user and redirect to login
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If session is invalid, show error message and back to login option
  if (!isValidSession && error) {
    return (
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <img src={IndakHamakaLogo} alt="FLIPino" className="logo-image" />
            <span className="logo-text">FLIPino</span>
          </div>
        </div>
        <div className="login-content">
          <div className="login-box">
            <h1 className="login-title">Reset Password</h1>
            <p className="login-subtitle">Session Expired</p>
            <div className="form-box">
              <div className="error-message">{error}</div>
              <button 
                className="login-button" 
                onClick={() => navigate("/forgot-password")}
                style={{ marginTop: "1rem" }}
              >
                Request New Reset Link
              </button>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span
                  className="login-link"
                  onClick={() => navigate("/login")}
                  style={{ cursor: "pointer" }}
                >
                  Back to Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="login-logo">
          <img src={IndakHamakaLogo} alt="FLIPino" className="logo-image" />
          <span className="logo-text">FLIPino</span>
        </div>
      </div>
      <div className="login-content">
        <div className="login-box">
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter your new password below</p>
          <div className="form-box">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Display the user's email */}
              {userEmail && (
                <div className="input-group">
                  <label className="input-label">Resetting password for:</label>
                  <div 
                    style={{
                      background: "#f8f9fa",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontSize: "16px",
                      color: "#495057",
                      fontWeight: "500",
                      marginBottom: "8px"
                    }}
                  >
                    {userEmail}
                  </div>
                </div>
              )}
              
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={24}
                    placeholder="Enter new password"
                    style={{ paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
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
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="login-input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    maxLength={24}
                    placeholder="Confirm new password"
                    style={{ paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowConfirm((prev) => !prev)}
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
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              {message && (
                <div className="demo-credentials" style={{ color: "#155724", background: "#d4edda", border: "1px solid #c3e6cb" }}>
                  {message}
                </div>
              )}
              <button type="submit" className="login-button" disabled={isLoading || !isValidSession}>
                {isLoading ? "Updating Password..." : "Reset Password"}
              </button>
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <span
                  className="login-link"
                  onClick={() => navigate("/login")}
                  style={{ cursor: "pointer" }}
                >
                  Back to Login
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;