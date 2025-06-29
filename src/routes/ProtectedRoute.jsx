// File: src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const hasAccess = (userRole, requiredRole) => {
  if (!requiredRole) return true;
  if (requiredRole === "admin") return ["admin", "superadmin"].includes(userRole);
  if (requiredRole === "superadmin") return userRole === "superadmin";
  return false;
};

const ProtectedRoute = ({ user, role, children }) => {
  const userRole = role || "user"; // ✅ use passed-down role from App.js

  if (!user) return <Navigate to="/" replace />;
  if (!hasAccess(userRole, role)) return <Navigate to="/entry" replace />;

  return children;
};

export default ProtectedRoute;
