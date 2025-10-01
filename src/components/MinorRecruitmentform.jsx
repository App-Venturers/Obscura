import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
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
            boxShadow: '0 0 4px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  icon: Icon
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-2"
  >
    <label className="block text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
    />
  </motion.div>
);

export default function MinorRecruitmentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    dob: null,
    guardian_name: "",
    guardian_email: "",
    guardian_phone: "",
    is_creator: "no",
    creator_name: "",
    timezone: "",
    platforms: [],
    other_platform: "",
    schedule: "",
    content_type: "",
    games: "",
    languages: [],
    other_language: "",
    internet: "",
    software: [],
    other_software: "",
    equipment: "",
    years_creating: "",
    sponsors: false,
    sponsor_list: "",
    camera: false,
    collabs: "no",
    creator_goals: "",
    creator_notes: "",
  });

  const [showCreatorFields, setShowCreatorFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const updatedValue = type === "checkbox" ? checked : type === "file" ? files[0] : value;

    if (name === "is_creator") setShowCreatorFields(value === "yes");

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const sanitizePayload = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("Authentication error. Please re-login.");
        return navigate("/login");
      }

      const rawData = {
        ...formData,
        is_creator: formData.is_creator === "yes",
        years_creating: formData.years_creating ? parseInt(formData.years_creating, 10) : null,
        sponsors: !!formData.sponsors,
        camera: !!formData.camera,
        is_minor: true,
        status: "pending",
        nda_agreement: true,
        dob: formData.dob ? formData.dob.toISOString() : null,
      };

      const cleanedData = sanitizePayload(rawData);

      const { error: updateError } = await supabase
        .from("users")
        .update(cleanedData)
        .eq("id", user.id);

      if (updateError) {
        alert("Submission failed. Please try again.");
        return;
      }

      alert("Minor application submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
          />
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500"
          >
            Loading Minor Recruitment Form...
          </motion.h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black relative overflow-hidden">
      <FloatingParticles />

      {/* Background overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/wallpaperflare.com_wallpaper%20(57).jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6 px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </motion.button>

            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.img
                src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/ObscuraLogo.png"
                alt="Obscura Logo"
                className="h-20 mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              />
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
                Minor Recruitment
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Special application process for aspiring creators under 18. Parental consent and additional verification required.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-2xl p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-3">
                  <UserIcon className="w-6 h-6 text-purple-400" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full legal name"
                    required
                    icon={UserIcon}
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    icon={EnvelopeIcon}
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    required
                    icon={PhoneIcon}
                  />

                  {/* Date of Birth */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <DatePicker
                      selected={formData.dob}
                      onChange={(date) => setFormData({ ...formData, dob: date })}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      placeholderText="Select your birth date"
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Guardian Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                  Parent / Guardian Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Guardian Full Name"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    placeholder="Parent/Guardian full name"
                    required
                    icon={UserIcon}
                  />
                  <InputField
                    label="Guardian Email"
                    name="guardian_email"
                    type="email"
                    value={formData.guardian_email}
                    onChange={handleChange}
                    placeholder="guardian@example.com"
                    required
                    icon={EnvelopeIcon}
                  />
                  <InputField
                    label="Guardian Phone"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={handleChange}
                    placeholder="Guardian phone number"
                    required
                    icon={PhoneIcon}
                  />
                </div>
              </motion.div>

              {/* NDA Warning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-amber-300 font-semibold mb-1">Important Notice</h3>
                    <p className="text-amber-200 text-sm">
                      If the NDA is not completed via Adobe Sign, your application may be declined.
                      Please ensure both the minor and guardian complete the required documentation.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* NDA Document */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                  Minor NDA Agreement
                </h3>
                <div className="bg-black/60 rounded-xl p-2 border border-purple-700/30">
                  <iframe
                    src="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhCg2181RCPfiGFpIaJLaS-BatNww51WnL9ot-nG0MvM1uc4x-sER1bMcVj3JTVD3Qg*"
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    className="rounded-lg"
                    title="Minor NDA Document"
                  />
                </div>
              </motion.div>

              {/* Creator Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-purple-400" />
                  Content Creator Status
                </h3>
                <label className="block text-sm font-bold text-purple-300 uppercase tracking-wider">
                  Are you a content creator?
                </label>
                <select
                  name="is_creator"
                  value={formData.is_creator}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                >
                  <option value="no">No, I'm not a content creator</option>
                  <option value="yes">Yes, I create content</option>
                </select>
              </motion.div>

              {/* Creator Fields */}
              {showCreatorFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CreatorFieldsCard
                    formData={formData}
                    handleChange={handleChange}
                  />
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="pt-6 text-center"
              >
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-3 mx-auto"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-5 h-5" />
                      Submit Minor Application
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}