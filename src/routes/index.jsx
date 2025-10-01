// File: src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
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
import OnboardingProtectedRoute from "./OnboardingProtectedRoute";
import ReferPage from "../pages/ReferPage";
import UpdateDetailsPage from "../pages/UpdateDetailsPage";
import HRSupportPage from "../pages/HRSupportPage";
import MyHRTicketsPage from "../pages/MyHRTicketsPage";
import AdminHRTicketsPage from "../pages/AdminHRTicketsPage";
import TeamManagementPage from "../pages/TeamManagementPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const AppRoutes = ({ user, role, hasCompletedOnboarding }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Authenticated Routes */}
      <Route
        path="/refer"
        element={
          <OnboardingProtectedRoute user={user} userRole={role} hasCompletedOnboarding={hasCompletedOnboarding}>
            <ReferPage />
          </OnboardingProtectedRoute>
        }
      />
      <Route
        path="/update-details"
        element={
          <OnboardingProtectedRoute user={user} userRole={role} hasCompletedOnboarding={hasCompletedOnboarding}>
            <UpdateDetailsPage />
          </OnboardingProtectedRoute>
        }
      />
      <Route
        path="/hr-support"
        element={
          <OnboardingProtectedRoute user={user} userRole={role} hasCompletedOnboarding={hasCompletedOnboarding}>
            <HRSupportPage />
          </OnboardingProtectedRoute>
        }
      />
      <Route
        path="/my-hr-tickets"
        element={
          <OnboardingProtectedRoute user={user} userRole={role} hasCompletedOnboarding={hasCompletedOnboarding}>
            <MyHRTicketsPage />
          </OnboardingProtectedRoute>
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
          <OnboardingProtectedRoute user={user} userRole={role} hasCompletedOnboarding={hasCompletedOnboarding}>
            <ExitForm />
          </OnboardingProtectedRoute>
        }
      />

      {/* Admin Routes */}
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

      <Route
  path="/admin-hr-tickets"
  element={
    <ProtectedRoute user={user} userRole={role} role="admin">
      <AdminLayout>
        <AdminHRTicketsPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

      <Route
        path="/team-management"
        element={
          <ProtectedRoute user={user} userRole={role} role="admin">
            <AdminLayout>
              <TeamManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
