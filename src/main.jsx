import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import EntryPage from "./components/EntryPage";
import RecruitmentForm from "./components/RecruitmentForm";
import MinorRecruitmentForm from "./components/MinorRecruitmentform";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminStatusHistoryTab from "./components/AdminStatusHistoryTab";
import SignupPage from "./Pages/SignupPage";
import LoginPage from "./Pages/LoginPage";
import UserManagementPage from "./pages/UserManagementPage";

export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setCheckingAuth(false);
    };S

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checkingAuth) return <div className="p-6 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Always show Login as landing page */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Only show protected routes if user is authenticated */}
        {user ? (
          <>
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/recruitment" element={<RecruitmentForm />} />
            <Route path="/minor-recruitment" element={<MinorRecruitmentForm />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-history" element={<AdminStatusHistoryTab />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="*" element={<Navigate to="/entry" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
