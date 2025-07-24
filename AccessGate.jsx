import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AccessGate() {
  const navigate = useNavigate();
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && ["admin", "superadmin"].includes(userRecord?.role)) {
        setShowAdminButton(true);
      }
    };

    checkAdmin();
  }, []);

  const handleChoice = (isRecruit) => {
    navigate(isRecruit ? "/recruitment" : "/admin-login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-purple-900 to-black flex items-center justify-center px-4">
      <section
        className="bg-gray-900 text-white p-8 rounded-xl shadow-xl max-w-lg w-full text-center"
        role="dialog"
        aria-labelledby="access-title"
        aria-describedby="access-description"
      >
        <h1 id="access-title" className="text-3xl font-bold text-purple-400 mb-4">
          Welcome to Obscura E-Sports
        </h1>
        <p id="access-description" className="mb-6 text-gray-300">
          Are you here to complete a recruitment application?
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => handleChoice(true)}
            className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 px-6 py-3 rounded text-white font-semibold transition focus:outline-none"
            aria-label="Recruitment access"
          >
            I'm being recruited
          </button>

          {showAdminButton && (
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 px-6 py-3 rounded text-white font-semibold transition focus:outline-none"
              aria-label="Admin access"
            >
              Admin Access
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
