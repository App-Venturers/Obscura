import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    setCurrentUserId(user.id);

    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || roleData?.role !== "superadmin") return navigate("/");

    const { data: allUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (!fetchError) setUsers(allUsers || []);
    else console.error("Fetch error:", fetchError.message);

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchData
      )
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [fetchData]);

  const promoteToAdmin = async (id) => {
    const { error } = await supabase.from("users").update({ role: "admin" }).eq("id", id);
    if (error) toast.error("Promote failed: " + error.message);
    else {
      toast.success("Promoted to Admin");
      await fetchData();
    }
  };

  const demoteToUser = async (id) => {
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", id);
    if (error) toast.error("Demote failed: " + error.message);
    else {
      toast.success("Demoted to User");
      await fetchData();
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((user) =>
    roleFilter === "all" ? true : user.role === roleFilter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2 className="text-xl animate-pulse">Loading users...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-400">User Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Back
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded text-white font-semibold"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-800">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === "superadmin"
                        ? "bg-red-600"
                        : user.role === "admin"
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">
                  {user.id === currentUserId ? (
                    <span className="text-sm italic text-gray-400">No Action</span>
                  ) : user.role === "user" ? (
                    <button
                      onClick={() => promoteToAdmin(user.id)}
                      className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-white text-xs"
                    >
                      Promote
                    </button>
                  ) : (
                    <button
                      onClick={() => demoteToUser(user.id)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white text-xs"
                    >
                      Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
