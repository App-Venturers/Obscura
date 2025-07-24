import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FiMenu, FiLogOut, FiSettings, FiX } from "react-icons/fi";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/");

      const { data, error } = await supabase
        .from("users")
        .select("role, full_name, photo_url")
        .eq("id", user.id)
        .single();

      if (error || (data.role !== "admin" && data.role !== "superadmin")) {
        return navigate("/");
      }

      setAdminInfo({ name: data.full_name, avatar: data.photo_url });
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    setLoadingPage(true);
    const timer = setTimeout(() => setLoadingPage(false), 1200);
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
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed z-30 lg:static transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg h-full
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          lg:translate-x-0 ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        <div className="px-4 py-6 flex flex-col h-full justify-between">
          <div>
            <div className="hidden lg:flex justify-end mb-4">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
              </button>
            </div>

            <h2
              className={`text-xl font-bold mb-6 tracking-wide transition-all ${
                sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Admin Panel
            </h2>

            <nav className="space-y-2 text-sm">
              {links.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2 rounded transition font-medium ${
                    location.pathname === href
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2 text-lg">{icon}</span>
                  {!sidebarCollapsed && <span>{label}</span>}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden lg:block text-xs text-gray-400">
            {!sidebarCollapsed && (
              <p className="mt-8">&copy; {new Date().getFullYear()} Obscura</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="text-2xl text-gray-700 dark:text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="text-lg font-semibold tracking-wide">Obscura Admin</h1>
          </div>

          <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
            {adminInfo && (
              <div className="flex items-center gap-2">
                {adminInfo.avatar ? (
                  <img
                    src={adminInfo.avatar}
                    alt="Admin Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    {adminInfo.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium">{adminInfo.name}</span>
              </div>
            )}
            <FiSettings className="cursor-pointer hover:text-blue-500 transition" />
            <FiLogOut
              className="cursor-pointer hover:text-red-500 transition"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            />
          </div>
        </header>

        {/* Loading */}
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
