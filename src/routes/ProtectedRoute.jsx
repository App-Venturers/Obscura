import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Check if user's role satisfies required access level
 * @param {string} userRole - Role from Supabase ("user", "admin", "superadmin")
 * @param {string} requiredRole - Required role to access the route
 */
const hasAccess = (userRole, requiredRole) => {
  if (!requiredRole) return true; // No role required
  if (requiredRole === "admin") return ["admin", "superadmin"].includes(userRole);
  if (requiredRole === "superadmin") return userRole === "superadmin";
  return false;
};

/**
 * ProtectedRoute
 * Wrap routes that require authentication and (optionally) specific roles
 *
 * @param {object} props
 * @param {object} props.user - Supabase authenticated user object
 * @param {string} [props.userRole="user"] - Role from Supabase `users` table
 * @param {string} [props.role] - Required role for this route (e.g., "admin")
 * @param {JSX.Element} props.children - The protected component to render
 */
const ProtectedRoute = ({ user, userRole = "user", role: requiredRole, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (!hasAccess(userRole, requiredRole)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
