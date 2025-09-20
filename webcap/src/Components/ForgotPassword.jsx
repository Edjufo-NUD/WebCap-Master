import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) {
      setError("Failed to send reset email. Please check your email address.");
    } else {
      setMessage("Password reset email sent! Please check your inbox.");
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
              <button type="submit" className="login-button">
                Send Reset Email
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