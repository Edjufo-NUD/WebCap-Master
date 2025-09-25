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
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Countdown timer effect
  React.useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isButtonDisabled]);

  // Start countdown after successful email send
  const startCountdown = () => {
    setCountdown(120); // 2 minutes to prevent rate limiting
    setIsButtonDisabled(true);
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
      // Step 1: Check if email exists in the database first
      console.log("Checking if email exists in database:", email);
      
      const { data: userData, error: userCheckError } = await supabase
        .from("users")
        .select("email, status")
        .eq("email", email)
        .single();

      if (userCheckError || !userData) {
        console.log("Email not found in database:", userCheckError);
        setError("No account found with this email address. Please check your email or create a new account.");
        setIsLoading(false);
        return;
      }

      // Step 2: Check if the account is disabled
      if (userData.status && userData.status.toLowerCase() === "disabled") {
        setError("Your account is disabled. Please contact support for assistance.");
        setIsLoading(false);
        return;
      }

      console.log("Email found in database, proceeding with reset request");

      // Step 3: Send password reset email (only for registered users)
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
        if (error.message.includes("rate limit") || error.message.includes("email rate limit exceeded")) {
          setError("Too many reset attempts. Please wait at least 5 minutes before trying again. This helps protect your account security.");
          // Start a longer countdown to prevent immediate retry
          setCountdown(300); // 5 minutes
          setIsButtonDisabled(true);
        } else if (error.status === 429) {
          setError("Request limit exceeded. Please wait a few minutes before trying again.");
          setCountdown(300); // 5 minutes
          setIsButtonDisabled(true);
        } else {
          setError("Failed to send reset email. Please try again later.");
        }
      } else {
        console.log("Reset email request successful");
        setMessage("Password reset email sent! Please check your inbox and spam folder. It may take 1-5 minutes to arrive.");
        
        // Start countdown timer
        startCountdown();
        
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
              {isButtonDisabled && countdown > 60 && (
                <div className="demo-credentials" style={{ color: "#856404", background: "#fff3cd", border: "1px solid #ffeaa7", marginTop: "8px" }}>
                  <strong>Rate limit protection:</strong> Please wait before sending another reset email. This helps prevent spam and protects your account.
                </div>
              )}
              <button 
                type="submit" 
                className="login-button" 
                disabled={isLoading || isButtonDisabled}
                style={{
                  opacity: isLoading || isButtonDisabled ? 0.6 : 1,
                  cursor: isLoading || isButtonDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading 
                  ? "Sending..." 
                  : isButtonDisabled 
                    ? countdown >= 60
                      ? `Wait ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')} minutes`
                      : `Wait ${countdown} seconds`
                    : "Send Reset Email"
                }
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