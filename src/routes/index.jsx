// File: src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";


import EntryPage from "../components/EntryPage";
import RecruitmentForm from "../components/RecruitmentForm";
import MinorRecruitmentForm from "../components/MinorRecruitmentform";
import AdminLogin from "../pages/pages/AdminLogin.jsx";
import AdminDashboard from "../components/AdminDashboard";
import UserManagementPage from "../pages/pages/UserManagementPage.jsx";
import LoginPage from "../pages/pages/LoginPage.jsx";
import SignupPage from "../pages/pages/SignupPage.jsx";

// Role-based guard HOC
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ user, role }) => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/entry"
        element={<ProtectedRoute user={user}><EntryPage /></ProtectedRoute>}
      />
      <Route
        path="/recruitment"
        element={<ProtectedRoute user={user}><RecruitmentForm /></ProtectedRoute>}
      />
      <Route
        path="/minor-recruitment"
        element={<ProtectedRoute user={user}><MinorRecruitmentForm /></ProtectedRoute>}
      />

      <Route
        path="/admin-login"
        element={<ProtectedRoute user={user}><AdminLogin /></ProtectedRoute>}
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute user={user} role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute user={user} role="superadmin">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/entry" : "/"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
