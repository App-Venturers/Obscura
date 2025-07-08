import { useState, useEffect } from "react";

export default function EditApplicantModal({
  visible,
  userData,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (userData) setForm(userData);
  }, [userData]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const updated = { ...form };
    delete updated.full_name;
    delete updated.dob;
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Applicant</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name || ""}
              disabled
              className="w-full bg-gray-300 dark:bg-gray-600 p-2 rounded"
            />
          </div>
          <div>
            <label className="text-sm">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob || ""}
              disabled
              className="w-full bg-gray-300 dark:bg-gray-600 p-2 rounded"
            />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="text-sm">Discord</label>
            <input
              type="text"
              name="discord"
              value={form.discord || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="text-sm">Gamertag</label>
            <input
              type="text"
              name="gamertag"
              value={form.gamertag || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="text-sm">Status</label>
            <select
              name="status"
              value={form.status || "pending"}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="banned">Banned</option>
              <option value="leaving_pending">Leaving</option>
              <option value="left">Left</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Admin Notes</label>
            <textarea
              name="admin_notes"
              value={form.admin_notes || ""}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
