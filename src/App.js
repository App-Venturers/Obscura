// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EntryPage from "./components/EntryPage";
import SignupPage from "./Pages/SignupPage";
import AdminDashboard from "./components/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import NotFound from "./pages/NotFound"; // optional fallback

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;S