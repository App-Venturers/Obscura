// File: src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Pages
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import EntryPage from "./components/EntryPage";
import RecruitmentForm from "./components/RecruitmentForm";
import MinorRecruitmentForm from "./components/MinorRecruitmentform";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setChecking(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="p-6 text-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {user ? (
          <>
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/recruitment" element={<RecruitmentForm />} />
            <Route path="/minor-recruitment" element={<MinorRecruitmentForm />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="*" element={<Navigate to="/entry" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
