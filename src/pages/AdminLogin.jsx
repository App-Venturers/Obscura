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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const user = data.user;
      console.log("🧠 USER DEBUG:", user);

      // Try to get role from user metadata first
      let role = user?.user_metadata?.role;

      // If missing, fallback to users table
      if (!role) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.warn("Could not fetch role from users table:", profileError.message);
        }

        role = profile?.role || "user";
      }

      console.log("🔐 Resolved Role:", role);

      // Redirect based on role
      if (role === "superadmin") {
        navigate("/admin-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/entry");
      }

    } catch (err) {
      console.error("Login error:", err);
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
