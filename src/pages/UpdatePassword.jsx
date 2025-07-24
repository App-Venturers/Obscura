import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeSession = async () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const hasAccessToken = hash.includes("access_token") || urlParams.get("code");

      if (hasAccessToken) {
        try {
          await supabase.auth.exchangeCodeForSession();
        } catch (err) {
          console.error("Exchange error:", err.message);
          setError("Session error. Please reopen the link or request a new password reset.");
        }
      }
    };

    exchangeSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Something went wrong. Try again.");
    } else {
      setMessage("✅ Password updated! Redirecting to login...");
      setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage:
          "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/wallpaperflare.com_wallpaper%20(57).jpg')",
      }}
    >
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl text-center relative z-10">
        <img
          src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/ObscuraLogo.png"
          alt="Obscura Logo"
          className="h-16 mx-auto mb-4 animate-bounce"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Reset Your Password
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-3">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
              required
              minLength={6}
              placeholder="Re-type your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
