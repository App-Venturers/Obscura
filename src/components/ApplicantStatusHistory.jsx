// ✅ AdminStatusHistoryTab.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AdminStatusHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      const { data, error } = await supabase
        .from("status_history")
        .select("id, applicant_id, old_status, new_status, changed_by, changed_at")
        .order("changed_at", { ascending: false });

      if (error) console.error("Fetch all status history error:", error);
      else setHistory(data);
      setLoading(false);
    };
    fetchAllHistory();
  }, []);

  if (loading) return <p className="text-gray-300">Loading status history...</p>;

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">All Status Changes</h2>
      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2 border">User ID</th>
            <th className="p-2 border">Old</th>
            <th className="p-2 border">New</th>
            <th className="p-2 border">Changed By</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-800 text-white">
              <td className="p-2 border">{entry.applicant_id}</td>
              <td className="p-2 border capitalize">{entry.old_status}</td>
              <td className="p-2 border capitalize">{entry.new_status}</td>
              <td className="p-2 border">{entry.changed_by || "-"}</td>
              <td className="p-2 border">{new Date(entry.changed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
