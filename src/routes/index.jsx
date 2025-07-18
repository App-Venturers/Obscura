// File: src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import EntryPage from "../components/EntryPage";
import RecruitmentForm from "../components/RecruitmentForm";
import MinorRecruitmentForm from "../components/MinorRecruitmentform";
import ExitForm from "../components/ExitForm";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";
import UserManagementPage from "../pages/UserManagementPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import AdminLayout from "../layouts/AdminLayout";
import UpdatePassword from "../pages/UpdatePassword";
import AdminOverview from "../pages/AdminOverview";
import StreamerDashboard from "../pages/StreamerDashboard";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ user, role }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* Authenticated Routes */}
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

      {/* Admin Login */}
      <Route
        path="/admin-login"
        element={
          <ProtectedRoute user={user} userRole={role}>
            <AdminLogin />
          </ProtectedRoute>
        }
      />

      {/* Admin Overview */}
      <Route
        path="/admin-overview"
        element={
          <ProtectedRoute user={user} userRole={role} role="admin">
            <AdminLayout>
              <AdminOverview />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute user={user} userRole={role} role="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Streamer Dashboard */}
      <Route
        path="/streamers"
        element={
          <ProtectedRoute user={user} userRole={role} role="admin">
            <AdminLayout>
              <StreamerDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Superadmin User Management */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute user={user} userRole={role} role="superadmin">
            <AdminLayout>
              <UserManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/entry" : "/"} replace />} />
    </Routes>
  );
};

export default AppRoutes;