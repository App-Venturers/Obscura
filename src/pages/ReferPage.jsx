import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserGroupIcon,
  EnvelopeIcon,
  LinkIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 3px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

// Success animation component
const SuccessAnimation = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="relative"
    >
      {/* Success particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [1, 3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 blur-xl" />
        </motion.div>
      ))}

      {/* Success icon */}
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 10, 0],
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
        className="relative z-10 w-32 h-32 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50"
      >
        <CheckCircleIcon className="w-20 h-20 text-white" />
      </motion.div>
    </motion.div>
  );
};

export default function ReferPage() {
  const [form, setForm] = useState({
    referred_name: "",
    referred_email: "",
    notes: "",
    social_link: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "notes") {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("referrals").insert({
      ...form,
      referred_by: userId
    });

    setLoading(false);

    if (error) {
      alert("Failed to submit referral. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setForm({
      referred_name: "",
      referred_email: "",
      notes: "",
      social_link: ""
    });
    setCharCount(0);
  };

  const handleBack = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      </div>

      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Home
        </motion.button>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-700/30 shadow-[0_0_40px_rgba(147,51,234,0.3)] p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <UserGroupIcon className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
                Refer a Friend
              </h1>
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Help grow the Obscura community
              </p>
            </motion.div>

            {/* Form or Success State */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-6"
                >
                  <SuccessAnimation />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                      Referral Submitted Successfully!
                    </h2>
                    <p className="text-gray-400">
                      Thank you for referring someone to Obscura. We'll reach out to them soon!
                    </p>

                    <div className="flex gap-4 justify-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmitAnother}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                      >
                        <UserPlusIcon className="w-5 h-5" />
                        Refer Another
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBack}
                        className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-lg border border-gray-700"
                      >
                        Back to Dashboard
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </span>
                      Full Name
                    </label>
                    <div className="relative">
                      <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        type="text"
                        name="referred_name"
                        value={form.referred_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter their full name"
                        className="w-full pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </span>
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        type="email"
                        name="referred_email"
                        value={form.referred_email}
                        onChange={handleChange}
                        required
                        placeholder="their.email@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                  </motion.div>

                  {/* Social Link Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </span>
                      Social Handle or Link
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                      <input
                        type="text"
                        name="social_link"
                        value={form.social_link}
                        onChange={handleChange}
                        placeholder="@username or social profile URL"
                        className="w-full pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-10">
                      Twitter, Instagram, TikTok, or any social platform
                    </p>
                  </motion.div>

                  {/* Notes Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                  >
                    <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        4
                      </span>
                      Additional Notes
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Tell us why they'd be a great fit for Obscura..."
                        className="w-full pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                      />
                      <span className={`absolute bottom-3 right-3 text-xs ${charCount > 500 ? 'text-red-400' : 'text-gray-500'}`}>
                        {charCount}/500
                      </span>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-center pt-4"
                  >
                    <motion.button
                      type="submit"
                      disabled={loading || charCount > 500}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transform transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mx-auto min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-5 h-5" />
                          Submit Referral
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}