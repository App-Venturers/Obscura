import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AppRoutes from "./routes";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const sessionUser = data?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        let resolvedRole = sessionUser.user_metadata?.role;

        if (!resolvedRole) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", sessionUser.id)
            .single();

          resolvedRole = profile?.role || "user";
        }

        setRole(resolvedRole);
      }

      setChecking(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="p-6 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      <AppRoutes user={user} role={role} />
    </BrowserRouter>
  );
}

export default App;
