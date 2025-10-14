import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { validateUserSession, clearSession } from "../utils/sessionUtils";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const accessToken = localStorage.getItem("access_token");
  const role = currentUser?.role;

  useEffect(() => {
    const checkSession = async () => {
      if (!currentUser || !accessToken) {
        setSessionValid(false);
        setIsValidating(false);
        return;
      }

      const validation = await validateUserSession();
      
      if (!validation.isValid) {
        // Session is invalid, clear it
        const reason = validation.reason === 'user_disabled' ? 'disabled' : 'session_expired';
        await clearSession(reason);
        setSessionValid(false);
      } else {
        setSessionValid(true);
      }
      
      setIsValidating(false);
    };

    checkSession();
  }, [currentUser, accessToken]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#f8f9fa',
        zIndex: 9999
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #a0855b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            fontSize: '18px',
            color: '#666',
            fontWeight: '500'
          }}>Loading...</div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Redirect if session is invalid
  if (!sessionValid || !currentUser || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to correct dashboard for admin/superadmin
    if (role === "superadmin") return <Navigate to="/user-management" replace />;
    if (role === "admin") return <Navigate to="/manage-dance" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;