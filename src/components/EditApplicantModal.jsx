import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * 800,
            y: Math.random() * 600,
          }}
          animate={{
            x: Math.random() * 800,
            y: Math.random() * 600,
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

const InputField = ({ label, name, value, onChange, disabled = false, type = "text", placeholder }) => (
  <div>
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
  </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder = "Select an option" }) => (
  <div>
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
  </div>
);

export default function EditApplicantModal({ isOpen, onClose, applicantData = {}, onSave }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

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

  const genderOptions = ["Male", "Female", "Other"];

  useEffect(() => {
    if (applicantData?.id) {
      setFormData({
        ...applicantData,
        platforms: applicantData.platforms || [],
        languages: applicantData.languages || [],
        software: applicantData.software || [],
        is_minor: !!applicantData.is_minor,
      });
    }
  }, [applicantData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const { id, ...updateData } = formData;
    const { error } = await supabase.from("users").update(updateData).eq("id", id);
    setSaving(false);

    if (error) {
      toast.error("Failed to save changes.");
    } else {
      toast.success("Applicant updated successfully!");
      onSave();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="min-h-screen pt-10 pb-10"
            >
              <Dialog.Panel className="relative mx-auto w-full max-w-5xl bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-2xl p-8 shadow-2xl">
                <FloatingParticles />

                {/* Header */}
                <div className="relative flex justify-between items-center mb-8">
                  <Dialog.Title className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                    Edit Applicant
                  </Dialog.Title>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </motion.button>
                </div>

                {/* Profile Image */}
                {formData.photo_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative">
                      <img
                        src={formData.photo_url}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-xl shadow-purple-500/25"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none" />
                    </div>
                  </motion.div>
                )}

                {/* Form Sections */}
                <div className="relative space-y-8">
                  {/* Personal Information Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
                      <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Full Name"
                        name="full_name"
                        value={formData.full_name}
                        disabled={true}
                        placeholder="Full name"
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
                        onChange={handleChange}
                        placeholder="email@example.com"
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
                        placeholder="Gaming username"
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

                  {/* Creator Fields */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
                      <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
                      Creator Information
                    </h3>
                    <CreatorFieldsCard
                      formData={formData}
                      handleChange={handleChange}
                      readOnlyFields={["full_name", "dob"]}
                    />
                  </motion.section>

                  {/* Guardian Information (if minor) */}
                  {formData.is_minor && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
                        <span className="mr-3 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">3</span>
                        Guardian Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative mt-8 flex justify-end space-x-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-black/30 backdrop-blur-sm border border-purple-700/30 text-purple-300 font-semibold rounded-lg hover:bg-purple-900/20 hover:border-purple-600/40 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center">
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
                      "Save Changes"
                    )}
                  </motion.button>
                </motion.div>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}