import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavigationBar from "../components/NavigationBar";
import GradientButton from "../components/GradientButton";
import { toast } from "react-hot-toast";

export default function HRSupportPage() {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: ""
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = ["Dispute", "Wellbeing", "Leave", "Technical", "Other"];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.category || !form.message) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    let attachment = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `ticket_${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("hr-support-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("File upload failed.");
        setSubmitting(false);
        return;
      }

      const { data: publicUrl } = supabase
        .storage
        .from("hr-support-files")
        .getPublicUrl(filePath);

      attachment = publicUrl?.publicUrl;
    }

    const { error } = await supabase.from("hr_support").insert({
      user_id: userId,
      subject: form.subject,
      category: form.category,
      message: form.message,
      attachment
    });

    setSubmitting(false);

    if (error) {
      console.error(error.message);
      toast.error("Failed to submit ticket.");
    } else {
      toast.success("HR ticket submitted successfully.");
      setForm({ subject: "", category: "", message: "" });
      setFile(null);
    }
  };

  const handleBack = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white px-4 py-8">
      <NavigationBar />

      <div className="max-w-6xl w-full mx-auto px-4 mt-4">
        <GradientButton onClick={handleBack} className="!bg-gray-700 hover:!bg-gray-800">
          ← Back to Entry Page
        </GradientButton>
      </div>

      <div className="max-w-2xl mx-auto bg-black/70 p-6 rounded-xl shadow-xl mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Submit HR Support Ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-purple-300">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-purple-300">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-purple-300">Message</label>
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-purple-300">Attach File (optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-700 file:text-white hover:file:bg-purple-800"
            />
          </div>

          <div className="text-center">
            <GradientButton type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
