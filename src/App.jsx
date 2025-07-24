// File: src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AppRoutes from "./routes";
import { ToastProvider } from "./context/ToastContext";
import ThemeProvider from "./context/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const [userLoading, setUserLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.error("Session error:", sessionError);

        const currentUser = session?.user || null;
        setUser(currentUser);
        setUserLoading(false);

        if (!currentUser) {
          console.log("🟡 No logged-in user — showing public routes.");
          setRole(null);
          setRoleLoading(false);
          return;
        }

        console.log("👤 Found user:", currentUser.email);

        const { data: roleData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        if (roleError || !roleData?.role) {
          console.warn("⚠️ Role lookup failed, defaulting to 'user'.", roleError?.message);
          setRole("user");
          localStorage.setItem("userRole", "user");
        } else {
          setRole(roleData.role);
          localStorage.setItem("userRole", roleData.role);
        }

        setRoleLoading(false);
      } catch (err) {
        console.error("Unexpected error in App init:", err);
        setUserLoading(false);
        setRoleLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (!currentUser) {
        console.log("🔌 User signed out.");
        setRole(null);
        localStorage.removeItem("userRole");
        return;
      }

      console.log("🔁 Auth state change: signed in", currentUser.email);

      const { data: roleData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      const newRole = roleData?.role || "user";
      setRole(newRole);
      localStorage.setItem("userRole", newRole);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (userLoading || roleLoading) {
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
          <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <AppRoutes user={user} role={role} />
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </ToastProvider>
  );
}
