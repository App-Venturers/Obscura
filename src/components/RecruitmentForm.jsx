import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CreatorFieldsCard from "./CreatorFieldsCard";
import { useNavigate } from "react-router-dom";

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

export default function RecruitmentForm() {
  const navigate = useNavigate();

  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
  };

  const [formData, setFormData] = useState({
    fullName: "",
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
    isCreator: false,
    ndaAgreement: false,
    creatorName: "",
    timezone: "",
    platforms: [],
    otherPlatform: "",
    schedule: "",
    contentType: "",
    games: "",
    languages: [],
    otherLanguage: "",
    internet: "",
    software: [],
    otherSoftware: "",
    equipment: "",
    yearsCreating: "",
    sponsorList: "",
    camera: false,
    sponsors: false,
    collabs: "no",
    creatorGoals: "",
    creatorNotes: "",
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

    if (name === "isCreator") {
      updatedValue = value === "yes";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();

    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Full Name, Email, and Phone are required.");
      return;
    }

    if (!formData.ndaAgreement) {
      alert("You must complete the NDA before submitting.");
      return;
    }

    if (age < 18) {
      setUnder18(true);
      return;
    }

    // Step 1: Upload photo (if present)
    let photoUrl = "";
    if (formData.photo) {
      const fileExt = formData.photo.name.split(".").pop();
      const fileName = `${formData.fullName.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, formData.photo);
      if (uploadError) {
        alert("Failed to upload photo: " + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
      photoUrl = publicUrlData?.publicUrl || "";
    }

    // Step 2: Clean formData before insert
    const {
      photo,                // remove file
      yearsCreating,
      sponsors,
      camera,
      ...rest
    } = formData;

    const cleanedData = {
      ...rest,
      yearsCreating: yearsCreating === "" ? null : parseInt(yearsCreating, 10),
      sponsors: !!sponsors,
      camera: !!camera,
      photo_url: photoUrl,
    };

    // Step 3: Parse dynamic follower counts safely
    Object.keys(cleanedData).forEach((key) => {
      if (key.startsWith("followers_")) {
        cleanedData[key] = cleanedData[key] === "" ? null : parseInt(cleanedData[key], 10);
      }
    });

    // Step 4: Insert to Supabase
    const { error: insertError } = await supabase.from("applicants").insert([cleanedData]);
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
        <h1 className="text-4xl font-bold animate-pulse text-purple-500">Loading Obscura Recruitment...</h1>
      </div>
    );
  }

  if (under18) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-white px-4 py-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-red-500 mb-4">Parental Consent Required</h2>
        <p className="text-md md:text-lg max-w-2xl mb-6">
          You must be 18 years or older to complete this recruitment form. If you are under 18,
          please have a parent or legal guardian fill out the Minor Consent Form below.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <a
            href="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhA8VeSehpag-n1HVFX5gdMupLI5UIGYiNGXNWXkqThp2G--ZFZ3hZWaUKbgBQSQsws*"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 text-white font-semibold rounded-lg shadow-lg"
          >
            Sign the Minor Consent Form
          </a>
          <button
            onClick={() => navigate("/minor-recruitment")}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 text-white font-semibold rounded-lg shadow-lg"
          >
            Proceed to Minor Recruitment Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cover bg-center min-h-screen text-white p-6 flex flex-col items-center" style={{ backgroundImage: `url('${assets.background}')` }}>
      <div className="bg-gray-900 bg-opacity-80 p-6 max-w-4xl w-full rounded-xl shadow-xl">
        <img
          src={assets.logo}
          alt="Obscura Logo"
          className="mx-auto w-32 md:w-48 lg:w-60 drop-shadow-xl animate-bounce mb-6"
        />
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Obscura E-Sports Recruitment Form</h1>
        <form onSubmit={handleSubmit} className="space-y-6 recruitment-container">
  <div>
    <h2 className="text-2xl font-bold text-white mb-4">1. Personal Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="recruitment-label">Full Name</label>
        <input name="fullName" value={formData.fullName} onChange={handleChange} required className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} required className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Phone</label>
        <input name="phone" value={formData.phone} onChange={handleChange} required className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Gamertag</label>
        <input name="gamertag" value={formData.gamertag} onChange={handleChange} className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Discord</label>
        <input name="discord" value={formData.discord} onChange={handleChange} className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="recruitment-input">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="recruitment-label">Date of Birth</label>
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="recruitment-input" />
      </div>
      <div>
        <label className="recruitment-label">Division</label>
        <select name="division" value={formData.division} onChange={handleChange} className="recruitment-input">
          <option value="">Select Division</option>
          <option>Call of Duty</option>
          <option>FIFA</option>
          <option>Clash of Clans</option>
          <option>Siege</option>
          <option>Valorant</option>
          <option>Counter Strike</option>
          <option>Apex</option>
          <option>Overwatch 2</option>
          <option>GTA/ RP</option>
          <option>Motorsports</option>
          <option>All of The Above</option>
        </select>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-2xl font-bold text-white mb-4">2. Photo Upload</h2>
    <label className="recruitment-label">Upload a Photo of Yourself</label>
    <input name="photo" type="file" accept="image/*" onChange={handleChange} className="recruitment-input" />
  </div>

  <div>
    <h2 className="text-2xl font-bold text-white mb-4">3. Competitive Experience</h2>
    <select name="competitive" value={formData.competitive} onChange={handleChange} className="recruitment-input">
      <option value="yes">Yes</option>
      <option value="no">No</option>
      <option value="maybe">Not Sure</option>
    </select>
    {(formData.competitive === "yes" || formData.competitive === "maybe") && (
      <input name="experience" placeholder="Competitive Experience" value={formData.experience} onChange={handleChange} className="recruitment-input mt-2" />
    )}
  </div>

  <div>
    <h2 className="text-2xl font-bold text-white mb-4">4. Content Creation</h2>
    <select name="isCreator" value={formData.isCreator ? "yes" : "no"} onChange={handleChange} className="recruitment-input">
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  </div>

  {formData.isCreator && <CreatorFieldsCard formData={formData} handleChange={handleChange} />}

  <div>
    <h2 className="text-2xl font-bold text-white mb-4">5. Non-Disclosure Agreement</h2>
    <iframe
      src="https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhB4n42WYd9IJQDzDGl1igd07ph8f1448tjVOqwrgoBIXdfaY3rrPeushEben3hBD4M*&hosted=false"
      width="100%"
      height="600px"
      frameBorder="0"
      className="border border-gray-700 rounded-lg"
      title="Non-Disclosure Agreement Document"
    ></iframe>
    <label className="recruitment-checkbox">
      <input
        type="checkbox"
        name="ndaAgreement"
        checked={formData.ndaAgreement}
        onChange={handleChange}
        className="accent-orange-500 w-5 h-5 rounded mr-2"
        required
      />
      <span>I agree to the NDA</span>
    </label>
  </div>

  <div className="text-center">
    <Button type="submit" className="recruitment-button">Submit</Button>
  </div>
</form>
   </div>
    </div>
  );
}