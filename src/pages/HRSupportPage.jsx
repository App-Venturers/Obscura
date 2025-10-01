import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  CalendarDaysIcon,
  ComputerDesktopIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
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

export default function HRSupportPage() {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: ""
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: "Dispute", icon: ExclamationTriangleIcon, color: "from-red-600 to-orange-600" },
    { value: "Wellbeing", icon: HeartIcon, color: "from-pink-600 to-rose-600" },
    { value: "Leave", icon: CalendarDaysIcon, color: "from-blue-600 to-cyan-600" },
    { value: "Technical", icon: ComputerDesktopIcon, color: "from-purple-600 to-indigo-600" },
    { value: "Other", icon: QuestionMarkCircleIcon, color: "from-gray-600 to-gray-500" }
  ];

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
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.category || !form.message) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    let attachment = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `ticket_${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("hr-support-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("File upload failed.");
        setSubmitting(false);
        return;
      }

      const { data: publicUrl } = supabase
        .storage
        .from("hr-support-files")
        .getPublicUrl(filePath);

      attachment = publicUrl?.publicUrl;
    }

    const { error } = await supabase.from("hr_support").insert({
      user_id: userId,
      subject: form.subject,
      category: form.category,
      message: form.message,
      attachment
    });

    setSubmitting(false);

    if (error) {
      console.error(error.message);
      toast.error("Failed to submit ticket.");
    } else {
      toast.success("HR ticket submitted successfully.");
      setForm({ subject: "", category: "", message: "" });
      setFile(null);
    }
  };

  const handleBack = () => navigate("/");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <FloatingParticles />

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-6xl w-full mx-auto px-4 mt-4">
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mt-8"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-flex p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full mb-4"
            >
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-400" />
            </motion.div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
              HR Support Center
            </h1>
            <p className="text-gray-400">Submit a ticket for assistance with workplace matters</p>
          </div>

          {/* Form Container */}
          <div className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-8 shadow-2xl">

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label className="block mb-2 text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Subject
                </label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label className="block mb-2 text-sm font-bold text-purple-300 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${
                          form.category === cat.value
                            ? `bg-gradient-to-r ${cat.color} border-transparent text-white shadow-lg`
                            : 'bg-black/30 border-purple-700/30 text-gray-400 hover:border-purple-500/50'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-semibold">{cat.value}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label className="block mb-2 text-sm font-bold text-purple-300 uppercase tracking-wider">Message</label>
                <textarea
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Provide detailed information about your request..."
                  className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  {form.message.length} characters
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <label className="block mb-2 text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <PaperClipIcon className="w-4 h-4" />
                  Attachment (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-dashed border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                  >
                    <PaperClipIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-gray-400 group-hover:text-gray-300">
                      {file ? file.name : "Click to upload a file"}
                    </span>
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="pt-4"
              >
                <motion.button
                  type="submit"
                  disabled={submitting || !form.category}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Submit Support Ticket
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
