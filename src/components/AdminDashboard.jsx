import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { CSVLink } from "react-csv";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [overviewCounts, setOverviewCounts] = useState({ total: 0, approved: 0, declined: 0, banned: 0, leaving_pending: 0, left: 0 });
  const [modalData, setModalData] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [notesModal, setNotesModal] = useState({ open: false, userId: null });
  const [noteInput, setNoteInput] = useState("");
  const navigate = useNavigate();

  const generatePDF = (row) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Recruitment Record", 14, 20);
    doc.setFontSize(12);
    doc.text(`Full Name: ${row.fullName}`, 14, 35);
    doc.text(`Status: ${row.status}`, 14, 45);
    doc.text(`Email: ${row.email || "-"}`, 14, 55);
    doc.text(`Submitted: ${new Date(row.created_at).toLocaleDateString()}`, 14, 65);
    doc.save(`Recruitment_${row.fullName.replace(" ", "_")}.pdf`);
  };

  const fetchOverviewStats = async () => {
    const { count: total } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .or("fullName.not.is.null,dob.not.is.null")

    const statuses = ["approved", "declined", "banned", "leaving_pending", "left"];
    const counts = await Promise.all(
      statuses.map(async (status) => {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .or("fullName.not.is.null,dob.not.is.null")
          .eq("status", status);
        return count || 0;
      })
    );

    setOverviewCounts({
      total: total || 0,
      approved: counts[0],
      declined: counts[1],
      banned: counts[2],
      leaving_pending: counts[3],
      left: counts[4]
    });
  };

  const fetchData = useCallback(async () => {
    const from = (currentPage - 1) * rowsPerPage;
    const to = from + rowsPerPage - 1;
    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .or("fullName.not.is.null,dob.not.is.null")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data, error, count } = await query;
    if (error) return console.error("Fetch error:", error);
    setData(data || []);
    setTotalCount(count || 0);
  }, [currentPage, rowsPerPage, statusFilter]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setCurrentUserRole(roleData?.role);
      }
      fetchOverviewStats();
      fetchData();
    };
    init();
  }, [fetchData]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredData(
        data.filter((row) =>
          Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(data);
    }
  }, [search, data]);

  const updateStatus = async (id, newStatus, notes = "") => {
    const { error } = await supabase.from("users").update({ status: newStatus, decline_notes: notes }).eq("id", id);
    if (!error) fetchData();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        const cleaned = data.map((row) => ({
          ...row,
          camera: row.camera === "true" || row.camera === "Yes",
          sponsors: row.sponsors === "true" || row.sponsors === "Yes",
          isCreator: row.isCreator === "true" || row.isCreator === "Yes",
          nda_agreement: row.ndaAgreement === "true" || row.ndaAgreement === "Yes",
          years_creating: row.yearsCreating ? parseInt(row.yearsCreating) : null,
          is_minor: false
        }));
        const { error } = await supabase.from("users").insert(cleaned);
        if (!error) fetchData();
      }
    });
  };

  const handleBulkAction = async (status) => {
    const { error } = await supabase.from("users").update({ status }).in("id", selectedRows);
    if (!error) {
      setSelectedRows([]);
      fetchData();
    }
  };

  const openNotesModal = (userId) => {
    setNotesModal({ open: true, userId });
    setNoteInput("");
  };

  const saveNote = async () => {
    if (!notesModal.userId) return;
    await updateStatus(notesModal.userId, "declined", noteInput);
    setNotesModal({ open: false, userId: null });
    setNoteInput("");
  };

  return (
    <div className="min-h-screen p-6 text-white bg-[#0f172a]">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-7xl mx-auto">
        {currentUserRole === "superadmin" && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/user-management")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Manage Users
            </button>
            {selectedRows.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => handleBulkAction("approved")} className="bg-green-600 px-3 py-1 rounded">Approve All</button>
                <button onClick={() => handleBulkAction("banned")} className="bg-black px-3 py-1 rounded">Ban All</button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center text-xl text-white mb-6">
          {Object.entries(overviewCounts).map(([key, value]) => (
            <div key={key} className="bg-purple-800 rounded-lg p-4 shadow">
              <div className="font-bold uppercase">{key.replace(/_/g, " ")}</div>
              <div className="text-3xl mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="banned">Banned</option>
            <option value="leaving_pending">Leaving Pending</option>
            <option value="left">Left</option>
          </select>
          <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <CSVLink data={filteredData} filename="applicants.csv" className="bg-blue-600 px-4 py-2 rounded text-white">
            Export CSV
          </CSVLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-2 border"><input type="checkbox" onChange={(e) => setSelectedRows(e.target.checked ? filteredData.map(r => r.id) : [])} checked={selectedRows.length === filteredData.length && filteredData.length > 0} /></th>
                <th className="p-2 border">Full Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Minor</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="p-2 border text-center">
                    <input type="checkbox" checked={selectedRows.includes(user.id)} onChange={() => setSelectedRows(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} />
                  </td>
                  <td className="p-2 border">{user.fullName}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.is_minor ? "Yes" : "No"}</td>
                  <td className="p-2 border capitalize">{user.status || "pending"}</td>
                  <td className="p-2 border">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-2 border space-y-1">
                    <button onClick={() => updateStatus(user.id, "approved")} className="bg-green-600 px-2 py-1 rounded w-full">Approve</button>
                    <button onClick={() => updateStatus(user.id, "leaving_pending")} className="bg-yellow-500 px-2 py-1 rounded w-full">Leaving</button>
                    <button onClick={() => updateStatus(user.id, "left")} className="bg-gray-500 px-2 py-1 rounded w-full">Left</button>
                    <button onClick={() => openNotesModal(user.id)} className="bg-red-600 px-2 py-1 rounded w-full">Decline</button>
                    <button onClick={() => updateStatus(user.id, "banned")} className="bg-black px-2 py-1 rounded w-full">Ban</button>
                    <button onClick={() => generatePDF(user)} className="bg-blue-600 px-2 py-1 rounded w-full">PDF</button>
                    {user.decline_notes && <div className="text-xs text-yellow-300">Note: {user.decline_notes}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notesModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-xl max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Decline Reason</h2>
              <textarea
                className="w-full p-2 border rounded bg-white text-black"
                rows={4}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setNotesModal({ open: false, userId: null })} className="bg-gray-500 px-4 py-2 rounded text-white">Cancel</button>
                <button onClick={saveNote} className="bg-purple-600 px-4 py-2 rounded text-white">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
