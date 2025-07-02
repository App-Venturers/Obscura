// File: src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import EntryPage from "../components/EntryPage";
import RecruitmentForm from "../components/RecruitmentForm";
import MinorRecruitmentForm from "../components/MinorRecruitmentform";
import ExitForm from "../components/ExitForm";
import AdminLogin from "../pages/AdminLogin.jsx";
import AdminDashboard from "../components/AdminDashboard";
import UserManagementPage from "../pages/UserManagementPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ user, role }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated User Routes */}
      <Route
        path="/entry"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <EntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <RecruitmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minor-recruitment"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <MinorRecruitmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exitform"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <ExitForm />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin-login"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <AdminLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute user={user} userRole={role} role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute user={user} userRole={role} role="superadmin">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/entry" : "/"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
