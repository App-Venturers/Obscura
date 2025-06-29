import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";

const Button = (props) => (
  <button
    {...props}
    className={
      "bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-semibold " +
      (props.className || "")
    }
  >
    {props.children}
  </button>
);

export default function MinorRecruitmentForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    isCreator: "no",
    creatorName: "",
    timezone: "",
    platforms: [],
    otherPlatform: "",
    schedule: "",
    contentType: "",
    games: "",
    languages: [],
    internet: "",
    software: [],
    equipment: "",
    yearsCreating: "",
    sponsors: false,
    sponsorList: "",
    camera: false,
    collabs: "no",
    creatorGoals: "",
    creatorNotes: "",
    ndaAgreementNotice:
      "Warning: If the NDA is not completed via Adobe Sign, your application may be declined.",
  });

  const [showCreatorFields, setShowCreatorFields] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const updatedValue =
      type === "checkbox" ? checked : type === "file" ? files[0] : value;

    if (name === "isCreator") setShowCreatorFields(value === "yes");

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error: insertError } = await supabase
      .from("minor_applicants")
      .insert([formData]);

    if (insertError) {
      alert("Submission failed: " + insertError.message);
    } else {
      alert("Application submitted successfully!");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-bold animate-pulse text-purple-500">
          Loading Minor Recruitment...
        </h1>
      </div>
    );
  }

  return (
    <div
      className="text-white min-h-screen bg-cover bg-center p-6 flex flex-col items-center justify-start"
      style={{
        backgroundImage:
          "url('https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/wallpaperflare.com_wallpaper%20(57).jpg')",
      }}
    >
      <img
        src="https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets/ObscuraLogo.png"
        alt="Obscura Logo"
        className="mx-auto max-w-xs mb-4"
      />
      <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
          Obscura Minor Recruitment Form
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="fullName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="phone"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <h2 className="text-lg font-semibold text-purple-300">
            Parent / Guardian Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="guardianName"
              placeholder="Guardian Full Name"
              required
              value={formData.guardianName}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="guardianEmail"
              type="email"
              placeholder="Guardian Email"
              required
              value={formData.guardianEmail}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="guardianPhone"
              placeholder="Guardian Phone"
              required
              value={formData.guardianPhone}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <div className="text-yellow-300 text-sm border border-yellow-500 rounded p-3">
            {formData.ndaAgreementNotice}
          </div>

          <div>
            <label className="block text-purple-300 font-semibold mb-1">
              Are you a content creator?
            </label>
            <select
              name="isCreator"
              value={formData.isCreator}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {showCreatorFields && (
            <CreatorFieldsCard
              formData={formData}
              handleChange={handleChange}
            />
          )}

          <div className="text-center">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
