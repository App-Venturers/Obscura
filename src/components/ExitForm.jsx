import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ExitForm() {
  const [formData, setFormData] = useState({
    name: "",
    ign: "",
    join_date: "",
    exit_requested_at: new Date().toISOString().slice(0, 10),
    reason: "",
    reasonOther: "",
    positives: "",
    challenges: "",
    suggestions: "",
    ndaConfirm: false,
    contractConfirm: false,
    accuracyConfirm: false
  });

  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord, error } = await supabase
        .from("users")
        .select("status")
        .eq("id", user.id)
        .single();

      if (!error && userRecord?.status === "leaving_pending") {
        setIsAuthorized(true);
      }
    };

    checkStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      alert("Session expired. Please log in again.");
      return navigate("/login");
    }

    const updates = {
      status: "left",
      exit_reason: formData.reason === "other" ? formData.reasonOther : formData.reason,
      exit_feedback: formData.suggestions,
      nda_confirm: formData.ndaConfirm,
      contract_confirm: formData.contractConfirm,
      accuracy_confirm: formData.accuracyConfirm,
      positive_experience: formData.positives,
      challenges: formData.challenges,
      join_date: formData.join_date || null,
      exit_requested_at: formData.exit_requested_at || null
    };

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      alert("There was an error submitting your exit form.");
      console.error("Exit form error:", error.message);
    } else {
      alert("Thank you for your feedback. You've been marked as left.");
      navigate("/");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">You are not authorized to access this form.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Obscura Exit Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
            </div>
            <div>
              <label className="block mb-1">In-Game Name (IGN)</label>
              <input type="text" name="ign" value={formData.ign} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
            </div>
            <div>
              <label className="block mb-1">Date of Joining</label>
              <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
            </div>
            <div>
              <label className="block mb-1">Date of Exit Request</label>
              <input type="date" name="exit_requested_at" value={formData.exit_requested_at} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
            </div>
          </div>

          <div>
            <label className="block mb-1">Reason for Leaving</label>
            <select name="reason" value={formData.reason} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
              <option value="">-- Select Reason --</option>
              <option value="personal">Personal Reasons</option>
              <option value="time">Not Enough Time</option>
              <option value="conflict">Conflict with Others</option>
              <option value="interest">Lost Interest</option>
              <option value="other">Other</option>
            </select>
            {formData.reason === "other" && (
              <input
                type="text"
                name="reasonOther"
                value={formData.reasonOther}
                onChange={handleChange}
                placeholder="Please specify..."
                className="mt-2 w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            )}
          </div>

          <div>
            <label className="block mb-1">What were the positive aspects of your time with Obscura Esports?</label>
            <textarea name="positives" value={formData.positives} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" rows={2}></textarea>
          </div>

          <div>
            <label className="block mb-1">What challenges did you face during your time with the organization?</label>
            <textarea name="challenges" value={formData.challenges} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" rows={2}></textarea>
          </div>

          <div>
            <label className="block mb-1">Suggestions for improving the experience for future members:</label>
            <textarea name="suggestions" value={formData.suggestions} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded" rows={3}></textarea>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" name="contractConfirm" checked={formData.contractConfirm} onChange={handleChange} className="mr-2" required />
              I understand and agree to any contractual obligations related to my departure.
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="ndaConfirm" checked={formData.ndaConfirm} onChange={handleChange} className="mr-2" required />
              I am still bound by NDA and agree not to disclose confidential info.
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="accuracyConfirm" checked={formData.accuracyConfirm} onChange={handleChange} className="mr-2" required />
              I confirm the information above is accurate and I am voluntarily submitting this form.
            </label>
          </div>

          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full font-semibold">
            {loading ? "Submitting..." : "Submit Exit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
