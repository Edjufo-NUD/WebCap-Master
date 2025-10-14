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
import AdminProfile from "./Admin/AdminProfile";
import ProtectedRoute from "./Components/ProtectedRoute";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import ScrollToTop from "./Components/ScrollToTop";
import { supabase } from "./supabasebaseClient";

// Component to validate user session in real-time
const SessionValidator = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  useEffect(() => {
    const validateSession = async () => {
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      
      if (!accessToken || !userId) {
        setIsValidating(false);
        return;
      }

      try {
        // Check if user still exists and get their current status
        const { data: userData, error } = await supabase
          .from("users")
          .select("status, role, username")
          .eq("id", userId)
          .single();

        if (error || !userData) {
          // User doesn't exist anymore, clear session
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("currentUser");
          await supabase.auth.signOut();
          window.location.href = '/login?reason=session_expired';
          return;
        }

        // Check if user is disabled
        if (userData.status.toLowerCase() === "disabled") {
          // User is disabled, clear session and redirect
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("currentUser");
          await supabase.auth.signOut();
          window.location.href = '/login?reason=disabled';
          return;
        }

        // Update current user data in localStorage if it has changed
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser && 
            (currentUser.role !== userData.role || 
             currentUser.username !== userData.username)) {
          localStorage.setItem("currentUser", JSON.stringify({
            email: currentUser.email,
            role: userData.role,
            username: userData.username
          }));
          // Trigger auth state update
          window.dispatchEvent(new Event('authChange'));
        }

      } catch (error) {
        console.error("Session validation error:", error);
        // On error, clear session to be safe
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("currentUser");
        await supabase.auth.signOut();
        window.location.href = '/login?reason=session_expired';
        return;
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();

    // Set up periodic validation every 30 seconds
    const interval = setInterval(validateSession, 30000);

    // Also validate on window focus (when user comes back to the tab)
    const handleFocus = () => validateSession();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Show loading while validating
  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Validating session...
      </div>
    );
  }

  // Redirect to login if session is invalid
  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
    const adminPages = ["/manage-dance", "/dance-upload", "/dance-request", "/analytics", "/user-ratings", "/admin-profile"];
    const superadminPages = ["/manage-dance", "/dance-upload", "/dance-approval", "/analytics", "/user-ratings", "/user-management", "/admin-profile"];
    
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

  // Component to conditionally wrap with SessionValidator
  const ConditionalSessionValidator = ({ children }) => {
    const accessToken = localStorage.getItem("access_token");
    
    // Only validate session for authenticated users
    if (accessToken) {
      return <SessionValidator>{children}</SessionValidator>;
    }
    
    return children;
  };
  
  return (
    <Router>
      <ScrollToTop />
      <ConditionalSessionValidator>
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
        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />



        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ConditionalSessionValidator>
    </Router>
  );
}

export default App;
