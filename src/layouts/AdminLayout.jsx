import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FiMenu, FiLogOut, FiSettings } from "react-icons/fi";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/");

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || (data.role !== "admin" && data.role !== "superadmin")) {
        return navigate("/");
      }
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    setLoadingPage(true);
    const timer = setTimeout(() => setLoadingPage(false), 1200); // Longer delay
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const links = [
    { href: "/admin-overview", label: "Overview", icon: "📊" },
    { href: "/admin-dashboard", label: "Dashboard", icon: "📁" },
    { href: "/streamers", label: "Streamers", icon: "🎥" },
    { href: "/user-management", label: "User Management", icon: "👥" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-30 transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 lg:w-64"
        } overflow-hidden bg-white dark:bg-gray-800 shadow-lg min-h-screen px-4 py-6`}
      >
        <h2 className="text-xl font-bold mb-6 tracking-wide">Admin Panel</h2>
        <nav className="space-y-2 text-sm">
          {links.map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              className={`flex items-center px-4 py-2 rounded transition font-medium ${
                location.pathname === href
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2 text-lg">{icon}</span> <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-2xl text-gray-700 dark:text-gray-300"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu />
            </button>
            <h1 className="text-lg font-semibold tracking-wide">Obscura Admin</h1>
          </div>
          <div className="flex items-center gap-4 text-xl text-gray-600 dark:text-gray-300">
            <FiSettings className="cursor-pointer hover:text-blue-500 transition" title="Settings" />
            <FiLogOut
              className="cursor-pointer hover:text-red-500 transition"
              title="Logout"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            />
          </div>
        </header>

        {/* Loading Screen */}
        {loadingPage ? (
          <div className="flex flex-col items-center justify-center flex-1 bg-black text-white animate-fade-in">
            <img
              src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png"
              alt="Loading Logo"
              className="w-48 h-auto animate-pulse mb-6"
            />
            <h2 className="text-xl font-semibold">Loading Obscura Dashboard...</h2>
          </div>
        ) : (
          <section className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </section>
        )}

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Obscura. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
