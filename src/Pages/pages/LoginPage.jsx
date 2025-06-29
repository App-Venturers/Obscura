import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    navigate("/entry");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg')",
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        {/* Logo */}
        <img
          src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png"
          alt="Obscura Logo"
          className="h-16 mx-auto mb-3"
        />

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Welcome Back</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

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
    </div>
  );
}
