import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import GradientButton from "../components/GradientButton";
import NavigationBar from "../components/NavigationBar";

export default function ReferPage() {
  const [form, setForm] = useState({
    referred_name: "",
    referred_email: "",
    notes: "",
    social_link: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("referrals").insert({
      ...form,
      referred_by: userId
    });

    setLoading(false);

    if (error) {
      alert("Failed to submit referral. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      setForm({
        referred_name: "",
        referred_email: "",
        notes: "",
        social_link: ""
      });
    }
  };

  const handleBack = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      navigate("/entry"); // Back to Entry Page
    } else {
      navigate("/login"); // If logged out
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white px-4 py-8">
      <NavigationBar />

      {/* Back button */}
      <div className="max-w-6xl w-full mx-auto px-4 mt-4">
        <GradientButton onClick={handleBack} className="!bg-gray-700 hover:!bg-gray-800">
          ← Back
        </GradientButton>
      </div>

      <div className="max-w-2xl mx-auto bg-black/70 p-6 rounded-xl shadow-xl mt-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Refer Someone to Obscura</h1>

        {submitted ? (
          <div className="text-green-400 text-center font-semibold">
            ✅ Referral submitted successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                name="referred_name"
                value={form.referred_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Email</label>
              <input
                type="email"
                name="referred_email"
                value={form.referred_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Social Handle or Link (optional)</label>
              <input
                type="text"
                name="social_link"
                value={form.social_link}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Notes (optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="text-center pt-4">
              <GradientButton type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Referral"}
              </GradientButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
