import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndakHamakaLogo from "../assets/IndakHamakaLogo.png";
import "./Register.css";
import { supabase } from "../supabasebaseClient"; // Import Supabase client

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Check password strength (optional)
    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Insert user info into users table
    const { user } = data;
    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: user?.id || data?.user?.id, // Supabase user id
          username,
          email,
          role: "user", // default role
          status: "active",
        },
      ]);

    if (dbError) {
      alert(dbError.message);
      return;
    }

    alert("Registration successful! Please login with your credentials.");
    navigate("/login");
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
                    required
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

              <button type="submit" className="register-button">
                Register
              </button>
            </form>

            <p className="register-footer">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="register-link"
              >
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;