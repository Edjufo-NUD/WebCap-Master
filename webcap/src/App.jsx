import React from "react";
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
import Analytics from "./Admin/Analytics";
import UserRatings from "./Admin/UserRatings";
import ManageDance from "./Admin/ManageDance";
import ProtectedRoute from "./Components/ProtectedRoute";

// Get session and role from localStorage
const accessToken = localStorage.getItem("access_token");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const role = currentUser?.role;

function App() {
  return (
    <Router>
      <Routes>
        {/* Root: redirect to proper dashboard */}
        <Route
          path="/"
          element={
            accessToken && role === "user" ? (
              <Navigate to="/home" />
            ) : accessToken && (role === "admin" || role === "superadmin") ? (
              <Navigate to="/manage-dance" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login route */}
        <Route
          path="/login"
          element={
            accessToken && role === "user" ? (
              <Navigate to="/home" />
            ) : accessToken && (role === "admin" || role === "superadmin") ? (
              <Navigate to="/manage-dance" />
            ) : (
              <Login />
            )
          }
        />

        {/* Register route */}
        <Route
          path="/register"
          element={
            accessToken && role === "user" ? (
              <Navigate to="/home" />
            ) : accessToken && (role === "admin" || role === "superadmin") ? (
              <Navigate to="/manage-dance" />
            ) : (
              <Register />
            )
          }
        />

        {/* User routes */}
        <Route
          path="/navbar"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Navbar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dances"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dances />
            </ProtectedRoute>
          }
        />
        <Route
          path="/culture"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Culture />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Profile />
            </ProtectedRoute>
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
