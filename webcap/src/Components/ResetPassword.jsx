import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Add this import

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add state
  const [showConfirm, setShowConfirm] = useState(false);   // Add state
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("new password should be different")
      ) {
        setError("Your new password cannot be the same as your previous password.");
      } else {
        setError("Failed to reset password. Please try again or use a different password.");
      }
    } else {
      setMessage("Password updated! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
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
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter your new password below</p>
          <div className="form-box">
            <form onSubmit={handleSubmit} className="login-form">
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
              <button type="submit" className="login-button">
                Reset Password
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