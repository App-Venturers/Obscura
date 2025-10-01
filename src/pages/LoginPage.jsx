import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

      // Check if email is verified
      if (!user.email_confirmed_at) {
        setError("Please verify your email before logging in. Check your inbox for the confirmation link.");
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      const { data: userRecord, error: roleError } = await supabase
        .from("users")
        .select("role, onboarding")
        .eq("id", user.id)
        .single();

      if (roleError || !userRecord?.role) {
        setError("Unable to determine user role.");
        setLoading(false);
        return;
      }

      const role = userRecord.role;
      const hasCompletedOnboarding = userRecord.onboarding;

      localStorage.setItem("userRole", role);
      localStorage.setItem("hasCompletedOnboarding", hasCompletedOnboarding);

      // If user hasn't completed onboarding and is not an admin, redirect to recruitment form
      if (!hasCompletedOnboarding && role === "user") {
        navigate("/recruitment");
      } else {
        navigate("/");  // Redirect to landing page after successful login
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Unexpected error. Please try again.");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background - Similar to Landing Page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Floating Particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500 rounded-full blur-sm"
          animate={{
            y: [0, -30, 0],
            x: [0, 30, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full blur-sm"
          animate={{
            y: [0, 40, 0],
            x: [0, -40, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Home</span>
      </motion.button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-purple-700/30 shadow-[0_0_40px_rgba(147,51,234,0.3)] p-8">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.h1
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              OBSCURA
            </motion.h1>
            <p className="text-gray-400">Welcome back, champion</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <Link
                to="/forgot-password"
                className="block w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">New to Obscura?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/signup")}
              className="w-full px-6 py-3 border-2 border-purple-500 text-purple-400 font-bold rounded-lg hover:bg-purple-500/10 transition-all duration-300"
            >
              Create Account
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center space-x-6 mt-8"
          >
            {[
              { href: "https://twitter.com", icon: "𝕏", name: "Twitter" },
              { href: "https://discord.com", icon: "💬", name: "Discord" },
              { href: "https://twitch.tv", icon: "📺", name: "Twitch" },
            ].map(({ href, icon, name }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110"
                title={name}
              >
                <span className="text-xl">{icon}</span>
              </a>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-purple-700/30 p-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-purple-400 font-medium">Authenticating...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}