import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiLogOut, FiSettings, FiX } from "react-icons/fi";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 4px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

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
    const timer = setTimeout(() => setLoadingPage(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole");

  // Base links available to all admins
  const baseLinks = [
    { href: "/admin-overview", label: "Overview", icon: "📊" },
    { href: "/admin-dashboard", label: "Dashboard", icon: "📁" },
    { href: "/streamers", label: "Streamers", icon: "🎥" },
    { href: "/team-management", label: "Team Management", icon: "⚔️" },
    { href: "/admin-hr-tickets", label: "HR Tickets", icon: "📨" },
  ];

  // Add User Management only for superadmins
  const links = userRole === "superadmin"
    ? [
        baseLinks[0], // Overview
        baseLinks[1], // Dashboard
        baseLinks[2], // Streamers
        baseLinks[3], // Team Management
        { href: "/user-management", label: "User Management", icon: "👥" },
        baseLinks[4], // HR Tickets
      ]
    : baseLinks;

  return (
    <div className="flex min-h-screen bg-black text-white relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-black to-blue-900/10 pointer-events-none" />
      <FloatingParticles />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-30 lg:static lg:translate-x-0 transition-all duration-300 ease-in-out bg-black/40 backdrop-blur-lg border-r border-purple-700/30 h-full shadow-2xl ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64`}
      >
        <div className="px-4 py-6 flex flex-col h-full justify-between">
          <div>
            {/* Collapse button - Desktop only */}
            <div className="hidden lg:flex justify-end mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
              </motion.button>
            </div>

            {/* Logo/Title */}
            <h2
              className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-8 text-center transition-all duration-200 ${
                sidebarCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
              }`}
            >
              ADMIN PANEL
            </h2>

            {/* Back to Home Button */}
            <motion.button
              onClick={() => navigate("/")}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium group relative overflow-hidden mb-4 bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-500/30 text-gray-300 hover:from-gray-600/30 hover:to-gray-500/30 hover:text-white hover:border-gray-400/50"
            >
              <span className="relative mr-3 text-lg">🏠</span>
              {!sidebarCollapsed && (
                <span className="relative">Back to Home</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/0 to-gray-500/0 group-hover:from-gray-600/10 group-hover:to-gray-500/10 transition-all duration-300" />
            </motion.button>

            {/* Navigation Links */}
            <nav className="space-y-2">
              {links.map(({ href, label, icon }, index) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(href);
                    setSidebarOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium group relative overflow-hidden ${
                    location.pathname === href
                      ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/30 text-white shadow-lg shadow-purple-500/20"
                      : "hover:bg-purple-600/10 hover:border hover:border-purple-700/30 text-purple-300 hover:text-white"
                  }`}
                >
                  {/* Active indicator */}
                  {location.pathname === href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <span className="relative mr-3 text-lg">{icon}</span>
                  {!sidebarCollapsed && (
                    <span className="relative">{label}</span>
                  )}

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all duration-300" />
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="hidden lg:block">
            {!sidebarCollapsed && (
              <p className="text-xs text-purple-400/50 text-center">
                © {new Date().getFullYear()} Obscura
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-lg border-b border-purple-700/30 px-6 py-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl text-purple-400 hover:text-purple-300 lg:hidden transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Sidebar"
              >
                {sidebarOpen ? <FiX /> : <FiMenu />}
              </motion.button>

              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Obscura Administration
              </h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {adminInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  {adminInfo.avatar ? (
                    <img
                      src={adminInfo.avatar}
                      alt="Admin Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/25"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
                      {adminInfo.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-purple-300 hidden sm:block">
                    {adminInfo.name}
                  </span>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <FiSettings className="text-xl" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-red-400 hover:text-red-300 transition-colors"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/");
                }}
              >
                <FiLogOut className="text-xl" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content with Loading */}
        <AnimatePresence mode="wait">
          {loadingPage ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-black relative overflow-hidden"
            >
              <FloatingParticles />
              <motion.img
                src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png"
                alt="Loading Logo"
                className="w-48 h-auto mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500"
              >
                Loading Dashboard...
              </motion.h2>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full mt-4"
              />
            </motion.div>
          ) : (
            <motion.section
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/20"
            >
              {children}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-lg border-t border-purple-700/30 p-4 text-center">
          <p className="text-sm text-purple-400/50">
            © {new Date().getFullYear()} Obscura eSports. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}