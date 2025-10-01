import { Navigate } from "react-router-dom";

const OnboardingProtectedRoute = ({ user, userRole, hasCompletedOnboarding, children }) => {
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't completed onboarding and they're a regular user, redirect to recruitment form
  if (!hasCompletedOnboarding && userRole === "user") {
    return <Navigate to="/recruitment" replace />;
  }

  // Otherwise, render the protected component
  return children;
};

export default OnboardingProtectedRoute;