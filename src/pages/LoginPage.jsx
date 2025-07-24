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
    setError("");
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData?.user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const user = signInData.user;

      const { data: userRecord, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !userRecord?.role) {
        setError("Unable to determine user role.");
        setLoading(false);
        return;
      }

      const role = userRecord.role;
      setRoleBadge(role);
      localStorage.setItem("userRole", role);

      navigate("/entry");
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Unexpected error. Please try again.");
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      console.error("Password reset error:", error.message);
      setError("Failed to send reset link. Try again.");
    } else {
      alert("✅ Password reset link sent. Check your email.");
    }
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

        <form onSubmit={handleLogin} className="space-y-4 text-left" aria-label="Login form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            className="text-sm text-blue-600 hover:underline mt-2 block"
          >
            Forgot Password?
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </a>
        </p>

        <div className="flex justify-center space-x-6 mt-6">
          {[
            { href: "https://youtube.com", src: "youtube.png", alt: "YouTube" },
            { href: "https://facebook.com", src: "Facebook.png", alt: "Facebook" },
            { href: "https://tiktok.com", src: "TikTok.png", alt: "TikTok" },
          ].map(({ href, src, alt }) => (
            <a href={href} key={alt} target="_blank" rel="noreferrer" title={alt}>
              <img
                src={`https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//${src}`}
                alt={alt}
                className="h-6 w-6 hover:scale-110 transition rounded-full"
              />
            </a>
          ))}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
