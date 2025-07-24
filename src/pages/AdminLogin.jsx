import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleBadge, setRoleBadge] = useState("");

  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background:
      "https://eetgxwgbysyezclsecwd.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
  };

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

      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData?.role) {
        setError("Unable to fetch user role. Please contact support.");
        setLoading(false);
        return;
      }

      const role = roleData.role;
      setRoleBadge(role);
      localStorage.setItem("userRole", role);

      if (["admin", "superadmin"].includes(role)) {
        navigate("/admin-overview");
      } else {
        setError("Access denied. You do not have admin privileges.");
      }

    } catch (err) {
      console.error("Login error:", err.message);
      setError("Unexpected error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url('${assets.background}')` }}
    >
      <div className="bg-black bg-opacity-80 p-8 rounded-xl shadow-xl max-w-sm w-full relative z-10">
        <img
          src={assets.logo}
          alt="Obscura Logo"
          className="w-32 mx-auto mb-4 animate-bounce"
        />
        <h1 className="text-center text-2xl font-bold text-purple-400 mb-6">
          Admin Login
        </h1>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        {roleBadge && (
          <p className="text-sm text-center mb-4">
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

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-gray-100 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-gray-100 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition"
          >
            {loading ? "Logging in..." : "Log In"}
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
