import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen px-4 py-6 space-y-6">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <nav className="space-y-2">
          <a
            href="/admin-dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Dashboard
          </a>
          <a
            href="/user-management"
            className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            User Management
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Obscura Admin</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">Admin View</span>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-6">{children}</section>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Obscura. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
