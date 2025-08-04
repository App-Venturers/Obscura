import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import CreatorFieldsCard from "../components/CreatorFieldsCard";
import GradientButton from "../components/GradientButton";
import { toast } from "react-hot-toast";

export default function UpdateDetailsPage() {
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
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
      toast.success("Details updated successfully.");
    }
  };

  const handleBack = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    navigate(user ? "/" : "/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white px-4 py-8">
      <NavigationBar />

      <div className="max-w-6xl w-full mx-auto px-4 mt-4">
        <GradientButton onClick={handleBack} className="!bg-gray-700 hover:!bg-gray-800">
          ← Back
        </GradientButton>
      </div>

      <div className="max-w-5xl mx-auto bg-black/70 p-6 rounded-xl shadow-xl mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Update Your Details</h1>

        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : (
          <>
            {formData.photo_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={formData.photo_url}
                  alt="Uploaded Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-md"
                />
              </div>
            )}

            <div className="text-center mb-6">
              <label className="block text-sm font-medium text-purple-300 mb-2">Upload New Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-700 file:text-white hover:file:bg-purple-800"
              />
            </div>

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
                  disabled
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

            {/* Creator Fields */}
            <CreatorFieldsCard
              formData={formData}
              handleChange={handleChange}
              readOnlyFields={["full_name", "dob"]}
            />

            {/* Minor Info */}
            {formData.is_minor && (
              <div className="my-10">
                <h2 className="text-xl font-bold text-purple-300 mb-4">Minor / Guardian Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            )}

            <div className="mt-10 text-center">
              <GradientButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save My Details"}
              </GradientButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
