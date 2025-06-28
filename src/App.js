// File: src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EntryPage from "./components/EntryPage";
import RecruitmentForm from "./components/RecruitmentForm";
import MinorRecruitmentForm from "./components/MinorRecruitmentform";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/recruitment" element={<RecruitmentForm />} />
        <Route path="/minor-recruitment" element={<MinorRecruitmentForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
