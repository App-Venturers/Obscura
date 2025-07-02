// RecruitmentForm.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { useNavigate } from "react-router-dom";

const Button = (props) => (
  <button
    {...props}
    className={"bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-semibold " + (props.className || "")}
  >
    {props.children}
  </button>
);

const InputField = ({ name, label, type = "text", ...props }) => (
  <div>
    {label && <label htmlFor={name} className="block text-sm font-medium text-gray-200 mb-1">{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      {...props}
      className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
    />
  </div>
);

const SelectField = ({ name, label, options, ...props }) => (
  <div>
    {label && <label htmlFor={name} className="block text-sm font-medium text-gray-200 mb-1">{label}</label>}
    <select
      id={name}
      name={name}
      {...props}
      className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function RecruitmentForm() {
  const navigate = useNavigate();
  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
  };

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    gamertag: "",
    discord: "",
    gender: "",
    dob: "",
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let updatedValue = type === "checkbox" ? checked : type === "file" ? files[0] : value;
    if (name === "isCreator") updatedValue = value === "yes";
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
    if (!formData.fullName || !formData.email || !formData.phone)
      return alert("Full Name, Email, and Phone are required.");
    if (!formData.ndaAgreement)
      return alert("You must complete the NDA before submitting.");
    if (age < 18) return setUnder18(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return alert("Authentication error. Please re-login.");

    let photoUrl = "";
    if (formData.photo) {
      const fileExt = formData.photo.name.split(".").pop();
      const fileName = `${formData.fullName.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, formData.photo);
      if (uploadError) return alert("Failed to upload photo: " + uploadError.message);
      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
      photoUrl = publicUrlData?.publicUrl || "";
    }

    const {
      photo,
      yearsCreating,
      sponsors,
      camera,
      ndaAgreement,
      ...rest
    } = formData;

    const cleanedData = {
      ...rest,
      years_creating: yearsCreating === "" ? null : parseInt(yearsCreating, 10),
      sponsors: !!sponsors,
      camera: !!camera,
      nda_agreement: ndaAgreement,
      photo_url: photoUrl,
      status: "pending",
      is_minor: false,
    };

    Object.keys(cleanedData).forEach((key) => {
      if (key.startsWith("followers_")) {
        cleanedData[key] = cleanedData[key] === "" ? null : parseInt(cleanedData[key], 10);
      }
    });

    const { error: updateError } = await supabase
      .from("users")
      .update(cleanedData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Recruitment submission error:", updateError.message);
      return alert("Submission failed. Please try again.");
    }

    alert("Application submitted successfully!");
    navigate("/");
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold animate-pulse text-purple-500">Loading Obscura Recruitment...</h1>
    </div>;
  }

  if (under18) {
    return <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-white px-4 py-10 text-center">
      <h2 className="text-2xl md:text-4xl font-bold text-red-500 mb-4">Parental Consent Required</h2>
      <p className="text-md md:text-lg max-w-2xl mb-6">
        You must be 18 years or older to complete this recruitment form. If you are under 18,
        please have a parent or legal guardian fill out the Minor Consent Form below.
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <a href="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhA8VeSehpag-n1HVFX5gdMupLI5UIGYiNGXNWXkqThp2G--ZFZ3hZWaUKbgBQSQsws*"
          target="_blank" rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 text-white font-semibold rounded-lg shadow-lg">
          Sign the Minor Consent Form
        </a>
        <button onClick={() => navigate("/minor-recruitment")}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 text-white font-semibold rounded-lg shadow-lg">
          Proceed to Minor Recruitment Form
        </button>
      </div>
    </div>;
  }

  return (
    <div className="bg-cover bg-center min-h-screen text-white p-6 flex flex-col items-center" style={{ backgroundImage: `url('${assets.background}')` }}>
      <div className="bg-gray-900 bg-opacity-80 p-8 max-w-5xl w-full rounded-xl shadow-xl">
        <img src={assets.logo} alt="Obscura Logo" className="mx-auto w-32 md:w-48 lg:w-60 drop-shadow-xl animate-bounce mb-6" />
        <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">Obscura E-Sports Recruitment Form</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField name="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} required />
              <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField name="phone" label="Phone" value={formData.phone} onChange={handleChange} required />
              <InputField name="gamertag" label="Gamertag" value={formData.gamertag} onChange={handleChange} />
              <InputField name="discord" label="Discord" value={formData.discord} onChange={handleChange} />
              <SelectField name="gender" label="Gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
              <InputField name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} />
              <SelectField name="division" label="Division" value={formData.division} onChange={handleChange} options={["Call of Duty", "FIFA", "Clash of Clans", "Siege", "Valorant", "Counter Strike", "Apex", "Overwatch 2", "GTA/ RP", "Motorsports", "All of The Above"]} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Photo Upload</h2>
            <InputField name="photo" type="file" label="Upload a Photo" accept="image/*" onChange={handleChange} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Competitive Experience</h2>
            <SelectField name="competitive" value={formData.competitive} onChange={handleChange} options={["yes", "no", "maybe"]} />
            {(formData.competitive === "yes" || formData.competitive === "maybe") && (
              <InputField name="experience" placeholder="Competitive Experience" value={formData.experience} onChange={handleChange} />
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Content Creation</h2>
            <SelectField name="isCreator" value={formData.isCreator ? "yes" : "no"} onChange={handleChange} options={["no", "yes"]} />
            {formData.isCreator && <CreatorFieldsCard formData={formData} handleChange={handleChange} />}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Non-Disclosure Agreement</h2>
            <iframe
              src="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhB4n42WYd9IJQDzDGl1igd07ph8f1448tjVOqwrgoBIXdfaY3rrPeushEben3hBD4M*&hosted=false"
              width="100%"
              height="600px"
              frameBorder="0"
              className="border border-gray-700 rounded-lg mb-4"
              title="Non-Disclosure Agreement Document"
            ></iframe>
            <label className="flex items-center space-x-3 text-white">
              <input
                type="checkbox"
                name="ndaAgreement"
                checked={formData.ndaAgreement}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
              />
              <span>I agree to the NDA</span>
            </label>
          </section>

          <div className="text-center">
            <Button type="submit" className="mt-6">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
