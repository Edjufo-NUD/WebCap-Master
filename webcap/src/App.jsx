import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Dances from "./Components/Dances";
import Culture from "./Components/Culture";
import About from "./Components/About";
import Profile from "./Components/Profile";
import UserManagement from "./Admin/UserManagement";
import DanceUpload from "./Admin/DanceUpload";
import DanceRequest from "./Admin/DanceRequest";
import DanceApproval from "./Admin/DanceApproval";
import Analytics from "./Admin/Analytics";
import UserRatings from "./Admin/UserRatings";
import ManageDance from "./Admin/ManageDance";
import ProtectedRoute from "./Components/ProtectedRoute";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import ScrollToTop from "./Components/ScrollToTop";

// Component to handle auth-protected routes
const AuthProtectedRoute = ({ children }) => {
  // Check authentication state dynamically
  const accessToken = localStorage.getItem("access_token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const role = currentUser?.role;

  if (accessToken) {
    if (role === "user") {
      return <Navigate to="/home" replace />;
    } else if (role === "admin" || role === "superadmin") {
      return <Navigate to="/manage-dance" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

// Component to restrict admin/superadmin access to only their designated pages
const AdminRestrictedRoute = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem("access_token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const role = currentUser?.role;

  // If logged in as admin or superadmin, check if they have access to this route
  if (accessToken && (role === "admin" || role === "superadmin")) {
    // Define allowed pages for each role
    const adminPages = ["/manage-dance", "/dance-upload", "/dance-request", "/analytics", "/user-ratings"];
    const superadminPages = ["/manage-dance", "/dance-upload", "/dance-approval", "/analytics", "/user-ratings", "/user-management"];
    
    const currentPath = window.location.pathname;
    
    // Check if current user role has access to this page
    const hasAccess = (role === "admin" && adminPages.includes(currentPath)) ||
                     (role === "superadmin" && superadminPages.includes(currentPath));
    
    if (!hasAccess) {
      // Redirect to manage-dance if they don't have access
      return <Navigate to="/manage-dance" replace />;
    }
  }

  return children;
};

function App() {
  const [authState, setAuthState] = useState({
    accessToken: localStorage.getItem("access_token"),
    user: JSON.parse(localStorage.getItem("currentUser"))
  });

  // Listen for storage changes to update auth state
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState({
        accessToken: localStorage.getItem("access_token"),
        user: JSON.parse(localStorage.getItem("currentUser"))
      });
    };

    // Listen for manual localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when we manually update localStorage
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);
  
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Root: Restricted for admin/superadmin */}
        <Route path="/" element={
          <AdminRestrictedRoute>
            <Home />
          </AdminRestrictedRoute>
        } />

        {/* Auth routes - prevent access if logged in */}
        <Route
          path="/login"
          element={
            <AuthProtectedRoute key={authState.accessToken || 'no-auth'}>
              <Login />
            </AuthProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={
            <AuthProtectedRoute key={authState.accessToken || 'no-auth'}>
              <Register />
            </AuthProtectedRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <AuthProtectedRoute key={authState.accessToken || 'no-auth'}>
              <ForgotPassword />
            </AuthProtectedRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <AuthProtectedRoute key={authState.accessToken || 'no-auth'}>
              <ResetPassword />
            </AuthProtectedRoute>
          }
        />

        {/* Public routes - restricted for admin/superadmin */}
        <Route path="/home" element={
          <AdminRestrictedRoute>
            <Home />
          </AdminRestrictedRoute>
        } />
        <Route path="/dances" element={
          <AdminRestrictedRoute>
            <Dances />
          </AdminRestrictedRoute>
        } />
        <Route path="/culture" element={
          <AdminRestrictedRoute>
            <Culture />
          </AdminRestrictedRoute>
        } />
        <Route path="/about" element={
          <AdminRestrictedRoute>
            <About />
          </AdminRestrictedRoute>
        } />

        {/* Protected user-only routes */}
        <Route
          path="/profile"
          element={
            <AdminRestrictedRoute>
              <ProtectedRoute allowedRoles={["user"]}>
                <Profile />
              </ProtectedRoute>
            </AdminRestrictedRoute>
          }
        />

        {/* Admin + Superadmin routes */}
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dance-upload"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <DanceUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dance-request"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DanceRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dance-approval"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <DanceApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-ratings"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <UserRatings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-dance"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <ManageDance />
            </ProtectedRoute>
          }
        />



        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
