import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndakHamakaLogo from "../assets/IndakHamakaLogo.png";
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

  const validatePassword = (password) => password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Register form submitted"); // Debug: confirm handler runs

    if (username.length < 6) {
      showSnackbar("Username must be at least 6 characters!", "error");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      showSnackbar("Password must be at least 8 characters.", "error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar("Passwords do not match!", "error");
      setLoading(false);
      return;
    }

    try {
      // Check if username or email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .or(`username.eq.${username},email.eq.${email}`)
        .maybeSingle();

      if (checkError) {
        console.error("Supabase checkError:", checkError);
        throw checkError;
      }

      if (existingUser) {
        console.error("User already exists:", existingUser);
        showSnackbar("Username or email already exists!", "error");
        setLoading(false);
        return;
      }

      // Sign up with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: { display_name: username },
          },
        }
      );

      if (signUpError || !signUpData?.user) {
        console.error("Supabase signUpError:", signUpError, signUpData);
        showSnackbar(
          `Auth error: ${signUpError?.message || "Signup failed"}`,
          "error"
        );
        setLoading(false);
        return;
      }

      // Get authenticated user
      const {
        data: { user },
        error: userFetchError,
      } = await supabase.auth.getUser();

      if (userFetchError || !user) {
        console.error("Supabase userFetchError:", userFetchError, user);
        showSnackbar(
          `Error retrieving user info: ${userFetchError?.message}`,
          "error"
        );
        setLoading(false);
        return;
      }

      // Update username in users table
      const { error: updateError } = await supabase
        .from("users")
        .update({ username })
        .eq("id", user.id);

      if (updateError) {
        console.error("Supabase updateError:", updateError);
        showSnackbar(`Error updating username: ${updateError.message}`, "error");
        setLoading(false);
        return;
      }

      showSnackbar("Registration successful! Redirecting...", "success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Registration error:", err); // Debug: log errors
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