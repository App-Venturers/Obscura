import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Home,
  UserPlus,
  Edit3,
  FilePlus,
  ClipboardList,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";

export default function NavigationBar() {
  const [gamertag, setGamertag] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("gamertag, role, is_admin, is_superadmin")
        .eq("id", user.id)
        .single();

      if (!error && data?.gamertag) {
        setGamertag(data.gamertag);
        if (
          data.role === "admin" ||
          data.role === "superadmin" ||
          data.is_admin ||
          data.is_superadmin
        ) {
          setIsAdmin(true);
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const commonLinks = [
    { label: "Home", path: "/", icon: <Home size={18} /> },
    { label: "Refer", path: "/refer", icon: <UserPlus size={18} /> },
    { label: "Update Details", path: "/update-details", icon: <Edit3 size={18} /> },
    { label: "HR Support", path: "/hr-support", icon: <FilePlus size={18} /> },
    { label: "My HR Tickets", path: "/my-hr-tickets", icon: <ClipboardList size={18} /> },
  ];

  const adminLinks = [
    { label: "Admin Dashboard", path: "/admin-dashboard", icon: <ShieldCheck size={18} /> },
  ];

  const navLinks = [...commonLinks, ...(isAdmin ? adminLinks : [])];

  return (
    <nav className="w-full bg-black/80 text-white border-b border-purple-700 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Brand + Toggle */}
        <div className="flex items-center gap-4">
          <button onClick={toggleMenu} className="md:hidden focus:outline-none text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-lg font-bold text-purple-300 hidden md:inline-block">Obscura</span>
        </div>

        {/* Right: Nav Links + Logout (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map(({ label, path, icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-1 text-sm font-medium transition hover:text-purple-300 ${
                location.pathname === path ? "text-purple-400 underline" : "text-white"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
          <span className="text-sm font-semibold text-purple-200 hidden md:inline">
            {gamertag ? `Welcome, ${gamertag}` : ""}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-semibold"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-3">
            {navLinks.map(({ label, path, icon }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 text-sm font-medium px-2 py-2 rounded hover:bg-purple-800 transition ${
                  location.pathname === path ? "bg-purple-900 text-purple-300" : "text-white"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
            <div className="flex justify-between items-center mt-4 px-1">
              <span className="text-sm font-semibold text-purple-200">
                {gamertag ? `Welcome, ${gamertag}` : ""}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
