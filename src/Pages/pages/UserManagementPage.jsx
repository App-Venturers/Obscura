import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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

    if (!fetchError) {
      setUsers(allUsers || []);
    } else {
      console.error("Failed to fetch users:", fetchError.message);
      setUsers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [navigate]);

  const syncUsers = async () => {
    try {
      const response = await fetch("https://tccglukvhjvrrjkjshet.supabase.co/auth/v1/users", {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_SERVICE_KEY}`,
          apikey: process.env.REACT_APP_SUPABASE_SERVICE_KEY
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch auth.users:", await response.text());
        return;
      }

      const result = await response.json();
      const authUsers = result?.users || result;

      const { data: existingUsers } = await supabase.from("users").select("id");
      const idsInUsersTable = new Set((existingUsers || []).map(u => u.id));

      const missingUsers = authUsers.filter((u) => !idsInUsersTable.has(u.id));

      if (missingUsers.length > 0) {
        await supabase.from("users").insert(
          missingUsers.map((u) => ({
            id: u.id,
            email: u.email,
            role: "user"
          }))
        );
      }

      fetchData();
    } catch (error) {
      console.error("Sync error:", error.message);
    }
  };

  const promoteToAdmin = async (id) => {
    const { error } = await supabase.from("users").update({ role: "admin" }).eq("id", id);
    if (error) console.error(error);
  };

  const demoteToUser = async (id) => {
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", id);
    if (error) console.error(error);
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-6xl mx-auto bg-gray-900 p-6 rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button
            onClick={syncUsers}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Sync Now
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <select
            className="bg-gray-800 border border-gray-600 p-2 rounded"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-700 text-sm">
            <thead className="bg-purple-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">
                    <span className={`px-2 py-1 rounded font-semibold text-xs ${
                      user.role === "superadmin" ? "bg-red-600" :
                      user.role === "admin" ? "bg-green-600" : "bg-gray-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {user.id === currentUserId ? (
                      <span className="text-gray-400 italic">No action</span>
                    ) : user.role === "user" ? (
                      <button
                        onClick={() => promoteToAdmin(user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Promote to Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => demoteToUser(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Demote to User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
