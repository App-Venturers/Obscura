// File: src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AppRoutes from "./routes";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
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
      <AppRoutes user={user} />
    </BrowserRouter>
  );
}

export default App;
