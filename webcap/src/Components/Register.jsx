import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
  };

  const validatePassword = (password) => password.length >= 8 && password.length <= 24;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Username validation: min 6, max 16
    if (username.length < 6 || username.length > 16) {
      showSnackbar("Username must be between 6 and 16 characters!", "error");
      setLoading(false);
      return;
    }

    // Password validation: min 8, max 24
    if (!validatePassword(password)) {
      showSnackbar("Password must be between 8 and 24 characters.", "error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar("Passwords do not match!", "error");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Sign up in Supabase Auth and set display_name
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
        showSnackbar(
          `Auth error: ${signUpError.message || JSON.stringify(signUpError)}`,
          "error"
        );
        setLoading(false);
        return;
      }

      // Step 2: Insert into your custom users table (mirror username from Auth)
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
          showSnackbar(`User profile creation failed: ${dbError.message}`, "error");
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

              <button type="submit" className="register-button" disabled={loading}>
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
    </div>
  );
};

export default Register;
