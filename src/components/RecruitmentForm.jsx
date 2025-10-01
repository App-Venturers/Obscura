import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

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

const GradientButton = (props) => (
  <motion.button
    {...props}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={
      "relative px-8 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform shadow-lg hover:shadow-purple-500/25 " +
      (props.className || "")
    }
  >
    {props.children}
  </motion.button>
);

const InputField = ({ name, label, type = "text", ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-purple-300 mb-2">
        {label}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      {...props}
      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
    />
  </motion.div>
);

const SelectField = ({ name, label, options, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-purple-300 mb-2">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      {...props}
      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em',
      }}
    >
      <option value="" className="bg-gray-900">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-gray-900">
          {opt}
        </option>
      ))}
    </select>
  </motion.div>
);

export default function RecruitmentForm() {
  const navigate = useNavigate();
  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
  };

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gamertag: "",
    discord: "",
    gender: "",
    dob: null,
    division: "",
    photo: null,
    competitive: "no",
    experience: "",
    is_creator: false,
    nda_agreement: false,
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
    sponsor_list: "",
    camera: false,
    sponsors: false,
    collabs: "no",
    creator_goals: "",
    creator_notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [under18, setUnder18] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const updatedValue =
      type === "checkbox" ? checked : type === "file" ? files[0] : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const sanitizePayload = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.full_name || !formData.email || !formData.phone) {
      alert("Full Name, Email, and Phone are required.");
      setSubmitting(false);
      return;
    }
    if (!formData.nda_agreement) {
      alert("You must complete the NDA before submitting.");
      setSubmitting(false);
      return;
    }

    const age = new Date().getFullYear() - formData.dob?.getFullYear();
    if (age < 18) {
      setSubmitting(false);
      return setUnder18(true);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("Authentication error. Please re-login.");
      setSubmitting(false);
      return;
    }

    let photoUrl = "";
    if (formData.photo) {
      const fileExt = formData.photo.name.split(".").pop();
      const fileName = `${formData.full_name.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, formData.photo);
      if (uploadError) {
        alert("Failed to upload photo: " + uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);
      photoUrl = publicUrlData?.publicUrl || "";
    }

    const rawPayload = {
      ...formData,
      years_creating: formData.years_creating ? parseInt(formData.years_creating, 10) : null,
      sponsors: !!formData.sponsors,
      camera: !!formData.camera,
      nda_agreement: !!formData.nda_agreement,
      is_creator: !!formData.is_creator,
      dob: formData.dob ? formData.dob.toISOString() : null,
      is_minor: false,
      status: "pending",
      photo_url: photoUrl,
      onboarding: true, // Mark onboarding as complete
    };

    const cleanedData = sanitizePayload(rawPayload);

    const { error: updateError } = await supabase
      .from("users")
      .update(cleanedData)
      .eq("id", user.id);

    if (updateError) {
      alert("Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Update local storage to reflect onboarding completion
    localStorage.setItem("hasCompletedOnboarding", "true");

    alert("Application submitted successfully! Welcome to Obscura!");
    navigate("/");  // Redirect to landing page after onboarding completion
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
            Loading Obscura Esports
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

  if (under18) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-red-900/20" />
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 bg-black/50 backdrop-blur-lg border border-red-700/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-6 text-center">
            Parental Consent Required
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mb-8 text-center">
            You must be 18 years or older to complete this recruitment form. If you
            are under 18, please have a parent or legal guardian fill out the Minor
            Consent Form below.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <motion.a
              href="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhCg2181RCPfiGFpIaJLaS-BatNww51WnL9ot-nG0MvM1uc4x-sER1bMcVj3JTVD3Qg*"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Sign the Minor Consent Form
            </motion.a>
            <motion.button
              onClick={() => navigate("/minor-recruitment")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              Proceed to Minor Recruitment Form
            </motion.button>
          </div>
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

      <div className="relative z-10 p-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          {/* Back to Home Button */}
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </motion.button>

          {/* Main form card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-2xl p-8 shadow-2xl"
          >
            {/* Logo and Title */}
            <motion.img
              src={assets.logo}
              alt="Obscura Logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-32 md:w-48 lg:w-60 drop-shadow-xl mb-6"
            />

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-5xl font-black text-center mb-8"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                OBSCURA RECRUITMENT
              </span>
            </motion.h1>

            {!localStorage.getItem("hasCompletedOnboarding") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 mb-8"
              >
                <p className="text-center text-purple-300">
                  Welcome to Obscura! Complete this form to finish your account setup and join our elite gaming community.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Section 1: Personal Details */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    name="full_name"
                    label="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <InputField
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                  <InputField
                    name="phone"
                    label="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    required
                  />
                  <InputField
                    name="gamertag"
                    label="Gamertag"
                    value={formData.gamertag}
                    onChange={handleChange}
                    placeholder="Your gaming name"
                  />
                  <InputField
                    name="discord"
                    label="Discord"
                    value={formData.discord}
                    onChange={handleChange}
                    placeholder="Username#0000"
                  />
                  <SelectField
                    name="gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={["Male", "Female", "Other"]}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Date of Birth
                    </label>
                    <DatePicker
                      selected={formData.dob}
                      onChange={(date) => setFormData((prev) => ({ ...prev, dob: date }))}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      placeholderText="Select your birth date"
                      required
                    />
                  </motion.div>
                  <SelectField
                    name="division"
                    label="Division"
                    value={formData.division}
                    onChange={handleChange}
                    options={[
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
                    ]}
                  />
                </div>
              </motion.section>

              {/* Section 2: Photo Upload */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
                  Photo Upload
                </h2>
                <div className="relative">
                  <InputField
                    name="photo"
                    type="file"
                    label="Upload a Photo"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Optional: Upload a profile photo for your Obscura account
                  </p>
                </div>
              </motion.section>

              {/* Section 3: Competitive Experience */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">3</span>
                  Competitive Experience
                </h2>
                <SelectField
                  name="competitive"
                  label="Do you have competitive experience?"
                  value={formData.competitive}
                  onChange={handleChange}
                  options={["yes", "no", "maybe"]}
                />
                {(formData.competitive === "yes" || formData.competitive === "maybe") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <InputField
                      name="experience"
                      label="Describe your competitive experience"
                      placeholder="Tell us about your competitive gaming background..."
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </motion.div>
                )}
              </motion.section>

              {/* Section 4: Content Creation */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">4</span>
                  Content Creation
                </h2>
                <SelectField
                  name="is_creator"
                  label="Are you a content creator?"
                  value={formData.is_creator ? "yes" : "no"}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_creator: e.target.value === "yes" }))}
                  options={["no", "yes"]}
                />
                {formData.is_creator && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <CreatorFieldsCard formData={formData} handleChange={handleChange} />
                  </motion.div>
                )}
              </motion.section>

              {/* Section 5: Non-Disclosure Agreement */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 flex items-center">
                  <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">5</span>
                  Non-Disclosure Agreement
                </h2>
                <div className="bg-black/30 backdrop-blur-sm border border-purple-700/30 rounded-lg p-1 mb-4">
                  <iframe
                    src="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhB4n42WYd9IJQDzDGl1igd07ph8f1448tjVOqwrgoBIXdfaY3rrPeushEben3hBD4M*"
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    className="rounded-lg"
                    title="NDA Document"
                  ></iframe>
                </div>
                <label className="flex items-center space-x-3 text-white cursor-pointer group">
                  <input
                    type="checkbox"
                    name="nda_agreement"
                    checked={formData.nda_agreement}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 bg-black/30 border-purple-700/30 rounded focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-300"
                    required
                  />
                  <span className="group-hover:text-purple-400 transition-colors">
                    I have read and agree to the Non-Disclosure Agreement
                  </span>
                </label>
              </motion.section>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-center pt-6"
              >
                <GradientButton
                  type="submit"
                  disabled={submitting}
                  className="min-w-[200px]"
                >
                  {submitting ? (
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
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </GradientButton>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}