// AdminSignUp.jsx — Secure Sign-Up with Secret Code, Supabase Auth, and Admin Role Assignment

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminSignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  const SECRET_CODE = process.env.REACT_APP_ADMIN_SECRET



  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("role", "admin");

      if (!error && data && data.length > 0) {
        setAdminExists(true);
      }
    };
    checkAdmin();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (adminExists) return setError("Admin account already exists.");
    if (password !== confirm) return setError("Passwords do not match");
    if (code !== SECRET_CODE) return setError("Invalid admin sign-up code");

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: userId, role: "admin" });

      if (profileError) {
        setError("Signup succeeded but failed to assign admin role.");
      } else {
        navigate("/admin-login");
      }
    } else {
      setError("Signup succeeded, but no user returned.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-purple-400 text-center">Create Admin Account</h1>
        {adminExists ? (
          <p className="text-red-400 text-sm text-center mb-4">Admin already exists.</p>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 rounded bg-gray-900 border border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full p-3 rounded bg-gray-900 border border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full p-3 rounded bg-gray-900 border border-gray-700"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Admin Sign-Up Code</label>
              <input
                type="text"
                required
                className="w-full p-3 rounded bg-gray-900 border border-gray-700"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
