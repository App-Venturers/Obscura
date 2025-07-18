import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background:
      "https://eetgxwgbysyezclsecwd.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Invalid email or password.");
        return;
      }

      const user = data.user;
      console.log("🧠 USER DEBUG:", user);

      // Fetch role from users table
      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData?.role) {
        console.warn("⚠️ Role fetch error:", roleError?.message || "Missing role");
        setError("Unable to fetch user role. Please contact support.");
        return;
      }

      const role = roleData.role;
      console.log("🔐 Resolved Role:", role);

      // ✅ Store role in localStorage for App.js to access early
      localStorage.setItem("userRole", role);

      // Navigate
      if (role === "superadmin" || role === "admin") {
        navigate("/admin-overview", { replace: true });
      } else {
        setError("Access denied. This page is for admins only.");
      }

    } catch (err) {
      console.error("Login error:", err.message);
      setError("Network or server error. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url('${assets.background}')` }}
    >
      <div className="bg-black bg-opacity-80 p-8 rounded-xl shadow-xl max-w-sm w-full">
        <img
          src={assets.logo}
          alt="Obscura Logo"
          className="w-32 mx-auto mb-4 animate-bounce"
        />
        <h1 className="text-center text-2xl font-bold text-purple-400 mb-6">
          Admin Login
        </h1>
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
