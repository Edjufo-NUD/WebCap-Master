import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const accessToken = localStorage.getItem("access_token");
  const role = currentUser?.role;

  if (!currentUser || !accessToken) {
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