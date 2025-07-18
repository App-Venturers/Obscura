// Final: EditApplicantModal.jsx with full CreatorFieldsCard + RecruitmentForm fields + selection fields shown as select dropdowns

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import CreatorFieldsCard from "./CreatorFieldsCard";

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
    "All of The Above"
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
  }, [applicantData?.id]);

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
      toast.success("Applicant updated.");
      onSave();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto w-full max-w-5xl rounded-2xl bg-gray-900 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-white">Edit Applicant</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">X</button>
          </div>

          {formData.photo_url && (
            <div className="flex justify-center mb-6">
              <img
                src={formData.photo_url}
                alt="Uploaded Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-md"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Full Name</label>
              <input
                name="full_name"
                value={formData.full_name || ""}
                disabled
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Date of Birth</label>
              <input
                name="dob"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                disabled
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Email</label>
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Phone</label>
              <input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Gamertag</label>
              <input
                name="gamertag"
                value={formData.gamertag || ""}
                onChange={handleChange}
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Discord</label>
              <input
                name="discord"
                value={formData.discord || ""}
                onChange={handleChange}
                className="recruitment-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="recruitment-input"
              >
                <option value="">Select Gender</option>
                {genderOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Division</label>
              <select
                name="division"
                value={formData.division || ""}
                onChange={handleChange}
                className="recruitment-input"
              >
                <option value="">Select Division</option>
                {divisionOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <CreatorFieldsCard
            formData={formData}
            handleChange={handleChange}
            readOnlyFields={["full_name", "dob"]}
          />

          {formData.is_minor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Guardian Name</label>
                <input
                  name="guardian_name"
                  value={formData.guardian_name || ""}
                  onChange={handleChange}
                  className="recruitment-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Guardian Email</label>
                <input
                  name="guardian_email"
                  value={formData.guardian_email || ""}
                  onChange={handleChange}
                  className="recruitment-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Guardian Phone</label>
                <input
                  name="guardian_phone"
                  value={formData.guardian_phone || ""}
                  onChange={handleChange}
                  className="recruitment-input"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
