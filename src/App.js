// File: src/App.js
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "./supabaseClient";
import AppRoutes from "./routes";
import { ToastProvider } from "./context/ToastContext";
import ThemeProvider from "./context/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        const userRole = profile?.role || "user";
        setRole(userRole);
        localStorage.setItem("userRole", userRole);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        localStorage.removeItem("userRole");
        return;
      }

      supabase
        .from("users")
        .select("role")
        .eq("id", currentUser.id)
        .single()
        .then(({ data }) => {
          const newRole = data?.role || "user";
          setRole(newRole);
          localStorage.setItem("userRole", newRole);
        });
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <ToastProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Toaster position="top-right" />
            <AppRoutes user={user} role={role} />
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </ToastProvider>
  );
}
