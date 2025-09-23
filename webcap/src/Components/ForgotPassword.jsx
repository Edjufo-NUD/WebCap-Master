import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Get the current domain for redirect URL
      const currentDomain = window.location.origin;
      
      console.log("Attempting to send reset email to:", email);
      console.log("Redirect URL:", `${currentDomain}/reset-password`);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentDomain}/reset-password`,
      });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Reset password error:", error);
        
        // Handle specific error cases
        if (error.message.includes("rate limit")) {
          setError("Too many reset attempts. Please wait before trying again.");
        } else if (error.message.includes("user not found")) {
          // For security reasons, we still show success message even if user doesn't exist
          setMessage("If an account with that email exists, we've sent you a password reset link. Please check your inbox and spam folder.");
        } else {
          setError("Failed to send reset email. Please try again later.");
        }
      } else {
        console.log("Reset email request successful");
        setMessage("Password reset email sent! Please check your inbox and spam folder. It may take 1-5 minutes to arrive.");
        
        // Clear the email field after successful submission
        setTimeout(() => {
          setEmail("");
        }, 2000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="login-title">Forgot Password</h1>
          <p className="login-subtitle">Enter your email to reset your password</p>
          <div className="form-box">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              {message && (
                <div className="demo-credentials" style={{ color: "#155724", background: "#d4edda", border: "1px solid #c3e6cb" }}>
                  {message}
                </div>
              )}
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Email"}
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

export default ForgotPassword;