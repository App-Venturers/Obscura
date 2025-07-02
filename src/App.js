import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AppRoutes from "./routes";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      const sessionUser = data?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        // 1. Try cached role first
        let resolvedRole = localStorage.getItem("userRole");

        // 2. Fallback to metadata
        if (!resolvedRole) resolvedRole = sessionUser.user_metadata?.role;

        // 3. Final fallback to users table
        if (!resolvedRole) {
          const { data: profile, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("id", sessionUser.id)
            .single();

          resolvedRole = profile?.role || "user";
        }

        setRole(resolvedRole);
        localStorage.setItem("userRole", resolvedRole); // ✅ Keep cache in sync
      }

      setChecking(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);

      if (!sessionUser) {
        setRole(null);
        localStorage.removeItem("userRole");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} role={role} />
    </BrowserRouter>
  );
}

export default App;
