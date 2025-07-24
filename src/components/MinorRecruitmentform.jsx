import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
              name="full_name"
              placeholder="Full Name"
              required
              value={formData.full_name}
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
              <DatePicker
                selected={formData.dob}
                onChange={(date) => setFormData({ ...formData, dob: date })}
                dateFormat="yyyy-MM-dd"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                placeholderText="Select DOB"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-purple-300">Parent / Guardian Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="guardian_name"
              placeholder="Guardian Full Name"
              required
              value={formData.guardian_name}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="guardian_email"
              type="email"
              placeholder="Guardian Email"
              required
              value={formData.guardian_email}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
            <input
              name="guardian_phone"
              placeholder="Guardian Phone"
              required
              value={formData.guardian_phone}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <div className="text-yellow-300 text-sm border border-yellow-500 rounded p-3">
            Warning: If the NDA is not completed via Adobe Sign, your application may be declined.
          </div>

          <iframe
            src="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhCg2181RCPfiGFpIaJLaS-BatNww51WnL9ot-nG0MvM1uc4x-sER1bMcVj3JTVD3Qg*"
            width="100%"
            height="600px"
            frameBorder="0"
            className="border border-gray-700 rounded-lg"
            title="Minor NDA Document"
          ></iframe>

          <div>
            <label className="block text-purple-300 font-semibold mb-1">
              Are you a content creator?
            </label>
            <select
              name="is_creator"
              value={formData.is_creator}
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
