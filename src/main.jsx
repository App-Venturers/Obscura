import { BrowserRouter, Routes, Route } from "react-router-dom";
import EntryPage from "./components/EntryPage";
import RecruitmentForm from "./components/RecruitmentForm";
import MinorRecruitmentForm from "./components/MinorRecruitmentform";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminStatusHistoryTab from "./components/AdminStatusHistoryTab";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/recruitment" element={<RecruitmentForm />} />
        <Route path="/minor-recruitment" element={<MinorRecruitmentForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-history" element={<AdminStatusHistoryTab />} />
      </Routes>
    </BrowserRouter>
  );
}