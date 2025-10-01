import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import CreatorFieldsCard from "../components/CreatorFieldsCard";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 6px rgba(168, 85, 247, 0.5)',
          }}
        />
      ))}
    </div>
  );
};

const InputField = ({ label, name, value, onChange, disabled = false, type = "text", placeholder }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-purple-300 mb-2">
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    />
  </motion.div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder = "Select an option" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-purple-300 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em',
      }}
    >
      <option value="" className="bg-gray-900">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-gray-900">
          {option}
        </option>
      ))}
    </select>
  </motion.div>
);

export default function UpdateDetailsPage() {
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const genderOptions = ["Male", "Female", "Other"];
  const divisionOptions = [
    "Call of Duty",
    "FIFA",
    "Clash of Clans",
    "Siege",
    "Valorant",
    "Counter Strike",
    "Apex",
    "Overwatch 2",
    "GTA/ RP",
    "Motorsports",
    "All of The Above",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      setUserId(user.id);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        toast.error("Failed to load your profile.");
        return;
      }

      setFormData({
        ...data,
        platforms: data.platforms || [],
        languages: data.languages || [],
        software: data.software || [],
        is_minor: !!data.is_minor,
      });

      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { id, full_name, dob, email, ...updatePayload } = formData;

    let photo_url = formData.photo_url;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("applicant-photos")
        .upload(filePath, selectedFile, {
          upsert: true,
        });

      if (uploadError) {
        toast.error("Photo upload failed.");
        setSaving(false);
        return;
      }

      const { data: publicUrl } = supabase
        .storage
        .from("applicant-photos")
        .getPublicUrl(filePath);

      photo_url = publicUrl.publicUrl;
    }

    updatePayload.photo_url = photo_url;

    const { error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId);

    setSaving(false);

    if (error) {
      console.error(error.message);
      toast.error("Failed to save your updates.");
    } else {
      toast.success("Details updated successfully!");
      // Update the displayed photo URL if a new one was uploaded
      if (selectedFile) {
        setFormData(prev => ({ ...prev, photo_url }));
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse">
            Loading Profile
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mt-6"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(147, 51, 234, 0.3)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }} />
      </div>

      <FloatingParticles />

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl mx-auto"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </motion.button>

          {/* Main form card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-2xl p-8 shadow-2xl"
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-center mb-8"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                UPDATE YOUR PROFILE
              </span>
            </motion.h1>

            {/* Profile Photo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center mb-10"
            >
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-xl shadow-purple-500/25 bg-black/50">
                  {previewUrl || formData.photo_url ? (
                    <img
                      src={previewUrl || formData.photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                      <CameraIcon className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer">
                  <CameraIcon className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-purple-300 text-sm mt-4">
                Click to upload new profile photo
              </p>
            </motion.div>

            {/* Personal Details Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  disabled={true}
                  placeholder="Your full name"
                />
                <InputField
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob ? formData.dob.split("T")[0] : ""}
                  disabled={true}
                  placeholder="YYYY-MM-DD"
                />
                <InputField
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  placeholder="your@email.com"
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
                <InputField
                  label="Gamertag"
                  name="gamertag"
                  value={formData.gamertag}
                  onChange={handleChange}
                  placeholder="Your gaming name"
                />
                <InputField
                  label="Discord"
                  name="discord"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="Username#0000"
                />
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={genderOptions}
                  placeholder="Select Gender"
                />
                <SelectField
                  label="Division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  options={divisionOptions}
                  placeholder="Select Division"
                />
              </div>
            </motion.section>

            {/* Creator Fields Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
                Creator Information
              </h2>
              <CreatorFieldsCard
                formData={formData}
                handleChange={handleChange}
                readOnlyFields={["full_name", "dob"]}
              />
            </motion.section>

            {/* Minor/Guardian Section */}
            {formData.is_minor && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-10"
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">3</span>
                  Guardian Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Guardian Name"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    placeholder="Guardian's full name"
                  />
                  <InputField
                    label="Guardian Email"
                    name="guardian_email"
                    value={formData.guardian_email}
                    onChange={handleChange}
                    placeholder="guardian@email.com"
                  />
                  <InputField
                    label="Guardian Phone"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                </div>
              </motion.section>
            )}

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center pt-6"
            >
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    Saving...
                  </span>
                ) : (
                  "Save My Details"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}