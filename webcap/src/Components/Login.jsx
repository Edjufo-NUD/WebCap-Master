import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndakHamakaLogo from "../assets/FLIPinoNLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient"; // Import Supabase client

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user was redirected due to session invalidation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    
    if (reason === 'disabled') {
      setError("Your account has been disabled. Please contact support.");
    } else if (reason === 'session_expired') {
      setError("Your session has expired. Please log in again.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate Gmail format
    if (!email.endsWith("@gmail.com")) {
      setError("Please use a Gmail address (@gmail.com)");
      return;
    }

    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message &&
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setError("Please confirm your email before logging in.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
        return;
      }

      // Store session token in localStorage
      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("user_id", data.user.id);
      }

      // Get user id from Supabase Auth
      const userId = data.user?.id;

      // Fetch user role, status, and username from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, status, username")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        setError("User not found.");
        return;
      }

      // ✅ Block login only if status is Disabled (Allow Enabled and Maintenance users)
      if (userData.status.toLowerCase() === "disabled") {
        await supabase.auth.signOut(); // Clear session
        setError("Your account is disabled. Please contact support.");
        return;
      }

      // Store user info for later use
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email,
          role: userData.role,
          username: userData.username,
        })
      );

      // Trigger custom event to update auth state in App.jsx
      window.dispatchEvent(new Event('authChange'));

      // Redirect based on role
      if (userData.role === "superadmin") {
        navigate("/manage-dance");
      } else if (userData.role === "admin") {
        navigate("/manage-dance");
      } else {
        navigate("/home");
      }
    } else {
      setError("Please enter both email and password.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h1 className="login-title">Login!</h1>
          <p className="login-subtitle">Access Your Account</p>

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

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="login-input password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: "40px" }}
                  />
                  <span
                    onClick={togglePasswordVisibility}
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

              {error && <div className="error-message">{error}</div>}

              <div style={{ textAlign: "right", marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{
                    color: "#0d6efd", // Bootstrap blue
                    fontSize: "14px",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    padding: -50,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forgot-password");
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <button type="submit" className="login-button">
                Login
              </button>
              <div style={{ textAlign: "right", marginTop: "8px" }}></div>
            </form>

            <p className="login-footer">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="login-link"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Explore as Guest Button */}
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="explore-guest-button"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "linear-gradient(135deg, #a0855b, #c9a876)",
          border: "none",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "25px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(160, 133, 91, 0.3), 0 0 0 0 rgba(160, 133, 91, 0.3)",
          transition: "all 0.3s ease",
          zIndex: 1000,
          whiteSpace: "nowrap",
          animation: "bounce 2s infinite, pulse 3s infinite"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-4px) scale(1.05)";
          e.target.style.boxShadow = "0 8px 25px rgba(160, 133, 91, 0.5), 0 0 20px rgba(160, 133, 91, 0.3)";
          e.target.style.animation = "none"; // Stop animations on hover
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0) scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(160, 133, 91, 0.3), 0 0 0 0 rgba(160, 133, 91, 0.3)";
          e.target.style.animation = "bounce 2s infinite, pulse 3s infinite"; // Resume animations
        }}
      >
        🎭 Explore as Guest
      </button>
    </div>
  );
};

export default Login;
