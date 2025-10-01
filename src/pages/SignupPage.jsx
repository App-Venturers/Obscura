import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;

        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        // Only create profile if user doesn't exist (fetchError means no user found)
        if (!existingUser && fetchError?.code === 'PGRST116') {
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              role: "user",
              onboarding: false, // New users need to complete onboarding
            },
          ]);

          if (insertError) {
            console.error("❌ Failed to insert user:", insertError.message);
            // Could show user-friendly error here
          }
        } else if (fetchError && fetchError.code !== 'PGRST116') {
          // Handle other database errors
          console.error("❌ Database error checking user:", fetchError.message);
        }

        // Don't navigate yet - wait for email confirmation
        // navigate("/entry");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (showConfirmation) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setShowConfirmation(false);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showConfirmation, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setCountdown(5);
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error("Signup error:", err.message || err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (!error) {
      setResent(true);
      setTimeout(() => setResent(false), 3000);
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
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-500 rounded-full blur-sm"
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-500 rounded-full blur-sm"
          animate={{
            y: [0, 30, 0],
            x: [0, -30, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 11,
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

      {/* Signup Card */}
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
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 mb-2"
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
            <p className="text-gray-400">Join the elite</p>
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

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-6">
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
                placeholder="Minimum 6 characters"
                required
              />
              <p className="text-gray-500 text-xs mt-2">
                Password must be at least 6 characters long
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          </form>

          {/* Terms Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-gray-500 text-xs text-center mt-6"
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </motion.p>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 border-2 border-purple-500 text-purple-400 font-bold rounded-lg hover:bg-purple-500/10 transition-all duration-300"
            >
              Sign In
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
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

      {/* Email Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/90 backdrop-blur-lg rounded-2xl border border-purple-700/30 shadow-[0_0_40px_rgba(147,51,234,0.3)] p-8 max-w-sm w-full"
            >
              <div className="text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1
                  }}
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Check Your Email
                </h2>

                <p className="text-gray-300 mb-2">
                  We've sent a confirmation link to
                </p>

                <p className="text-purple-400 font-medium mb-6">
                  {email}
                </p>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 mb-6">
                  <p className="text-gray-400 text-sm">
                    Redirecting to login in{" "}
                    <span className="text-purple-400 font-bold">{countdown}</span> seconds...
                  </p>
                </div>

                {!resent ? (
                  <button
                    onClick={resendEmail}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/50 text-purple-400 font-medium rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Resend Email
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 font-medium"
                  >
                    ✓ Email resent successfully!
                  </motion.div>
                )}

                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    navigate("/login");
                  }}
                  className="mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Go to login now →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && !showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-purple-700/30 p-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-purple-400 font-medium">Processing...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}