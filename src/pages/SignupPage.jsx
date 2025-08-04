import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const t = {
    heading: "Create an Account",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Minimum 6 characters",
    signUp: "Sign Up",
    alreadyHave: "Already have an account?",
    logIn: "Log in here",
    checkEmailTitle: "Check your email",
    checkEmailText: "We've sent a confirmation link to",
    resend: "Resend Email",
    resent: "Email resent!",
    autoClose: "Auto-closing in",
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;

        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser && !fetchError) {
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              role: "user",
            },
          ]);

          if (insertError) {
            console.error("❌ Failed to insert user:", insertError.message);
          }
        }

        navigate("/entry");
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
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showConfirmation]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (!error) setResent(true);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 sm:px-2 relative"
      style={{
        backgroundImage:
          "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg')",
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-4 text-center">
        <img
          src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png"
          alt="Obscura Logo"
          className="h-16 mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{t.heading}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Signing up..." : t.signUp}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          {t.alreadyHave}{" "}
          <a href="/" className="text-blue-500 hover:underline">
            {t.logIn}
          </a>
        </p>

        <div className="flex justify-center space-x-6 mt-6">
          {["youtube", "Facebook", "TikTok"].map((platform) => (
            <a
              key={platform}
              href={`https://${platform.toLowerCase()}.com`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/${platform}.png`}
                alt={platform}
                className="h-6 w-6 hover:scale-110 transition"
              />
            </a>
          ))}
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 sm:p-4 rounded-xl text-center shadow-lg max-w-sm w-full transform scale-95 animate-scale-in">
            <h2 className="text-xl font-bold mb-3 text-gray-900">{t.checkEmailTitle}</h2>
            <p className="text-gray-700 mb-2">
              {t.checkEmailText} <span className="font-medium">{email}</span>.
            </p>
            <p className="text-gray-500 mb-3">{t.autoClose} {countdown}s</p>
            {!resent ? (
              <button
                onClick={resendEmail}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              >
                {t.resend}
              </button>
            ) : (
              <p className="text-green-600 font-medium">{t.resent}</p>
            )}
          </div>
        </div>
      )}

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
}
