import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleBadge, setRoleBadge] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoleBadge("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const user = data.user;
      console.log("🔐 Auth ID:", user.id);

      // 🔍 Get role from users table by matching ID
      const { data: userRecord, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = userRecord?.role || "user";
      console.log("🎖 Logged in as:", role);
      setRoleBadge(role);

      // Redirect based on role after short badge delay
      setTimeout(() => {
        if (role === "superadmin") navigate("/entry");
        else if (role === "admin") navigate("/entry");
        else navigate("/entry");
      }, 1200);

    } catch (err) {
      console.error("Unexpected login error:", err.message);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage:
          "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg')",
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center relative z-10">
        <img
          src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png"
          alt="Obscura Logo"
          className="h-16 mx-auto mb-3"
        />

        <h2 className="text-3xl font-bold mb-4 text-gray-900">Welcome Back</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {roleBadge && (
          <p className="text-sm mb-4">
            Role detected:{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-white font-semibold text-xs ${
                roleBadge === "superadmin"
                  ? "bg-red-600"
                  : roleBadge === "admin"
                  ? "bg-green-600"
                  : "bg-blue-600"
              }`}
            >
              {roleBadge}
            </span>
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </a>
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-6">
          <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube">
            <img
              src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//youtube.png"
              alt="YouTube"
              className="h-6 w-6 hover:scale-110 transition rounded-full"
            />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
            <img
              src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Facebook.png"
              alt="Facebook"
              className="h-6 w-6 hover:scale-110 transition rounded-full"
            />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok">
            <img
              src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//TikTok.png"
              alt="TikTok"
              className="h-6 w-6 hover:scale-110 transition rounded-full"
            />
          </a>
        </div>
      </div>

      {/* 🔄 Spinner Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
