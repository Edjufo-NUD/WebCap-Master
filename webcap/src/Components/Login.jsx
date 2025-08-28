import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndakHamakaLogo from "../assets/IndakHamakaLogo.png";
import "./Login.css";
import { supabase } from "../supabasebaseClient"; // Import Supabase client

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (email && password) {
      // Login with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Store session token in localStorage
      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("user_id", data.user.id);
      }

      // Get user id from Supabase Auth
      const userId = data.user?.id;

      // Fetch user role and status from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, status")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        setError("User not found.");
        return;
      }

      // ✅ Block login if status is Disabled
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
        })
      );

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

              <button type="submit" className="login-button">
                Login
              </button>
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
    </div>
  );
};

export default Login;
