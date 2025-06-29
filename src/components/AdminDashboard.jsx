import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { CSVLink } from "react-csv";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const [view, setView] = useState("overview");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [overviewCounts, setOverviewCounts] = useState({ total: 0, approved: 0, declined: 0, banned: 0 });
  const [modalData, setModalData] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();

  const generatePDF = async (row) => {
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
    const tables = ["applicants", "minor_applicants"];
    let total = 0, approved = 0, declined = 0, banned = 0;
    for (const table of tables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      total += count || 0;
      for (const status of ["approved", "declined", "banned"]) {
        const { count: c } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("status", status);
        if (status === "approved") approved += c || 0;
        if (status === "declined") declined += c || 0;
        if (status === "banned") banned += c || 0;
      }
    }
    setOverviewCounts({ total, approved, declined, banned });
  };

  const fetchData = useCallback(async () => {
    const from = (currentPage - 1) * rowsPerPage;
    const to = from + rowsPerPage - 1;
    let query = supabase.from(view).select("*", { count: "exact" }).order("created_at", { ascending: true }).range(from, to);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error, count } = await query;
    if (error) return console.error("Fetch error:", error);
    setData(data || []);
    setTotalCount(count || 0);
  }, [currentPage, rowsPerPage, statusFilter, view]);

  useEffect(() => {
    const fetchInitial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setCurrentUserRole(roleData?.role);
      }

      if (view === "overview") fetchOverviewStats();
      else fetchData();
    };

    fetchInitial();
  }, [view, currentPage, rowsPerPage, statusFilter, fetchData]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredData(data.filter(row => Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())));
    } else {
      setFilteredData(data);
    }
  }, [search, data]);

const updateStatus = async (id, newStatus, notes = "") => {
    const { error } = await supabase.from(view).update({ status: newStatus, decline_notes: notes }).eq("id", id);
    if (!error) fetchData();
  };

  const updateField = async (id, field, value) => {
    if (field === "fullName" || field === "dob") return;
    const { error } = await supabase.from(view).update({ [field]: value }).eq("id", id);
    if (!error) fetchData();
  };

  const handleBulkStatus = async (status) => {
    if (!selectedRows.length) return;
    const { error } = await supabase.from(view).update({ status }).in("id", selectedRows);
    if (!error) {
      setSelectedRows([]);
      fetchData();
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        const cleaned = data.map(row => ({
          ...row,
          camera: row.camera === "true" || row.camera === "Yes",
          sponsors: row.sponsors === "true" || row.sponsors === "Yes",
          isCreator: row.isCreator === "true" || row.isCreator === "Yes",
          ndaAgreement: row.ndaAgreement === "true" || row.ndaAgreement === "Yes",
          yearsCreating: row.yearsCreating ? parseInt(row.yearsCreating) : null
        }));
        const { error } = await supabase.from(view).insert(cleaned);
        if (!error) fetchData();
      }
    });
  };

  return (
    <div className="min-h-screen p-6 text-white bg-[#0f172a]">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-7xl mx-auto">

        {/* ✅ Manage Users Button for Superadmin */}
        {currentUserRole === "superadmin" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/user-management")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Manage Users
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex justify-center gap-4 mb-4">
          {["overview", "applicants", "minor_applicants"].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded ${view === v ? "bg-purple-600" : "bg-gray-700"}`}>{v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</button>
          ))}
        </div>
     

        {view === "overview" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center text-xl text-white">
            {Object.entries(overviewCounts).map(([key, value]) => (
              <div key={key} className="bg-purple-800 rounded-lg p-4 shadow">
                <div className="font-bold uppercase">{key}</div>
                <div className="text-3xl mt-1">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between mb-4 items-center gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="p-2 rounded bg-gray-800 border border-gray-600 w-full sm:w-1/3" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-600 p-2 rounded">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="banned">Banned</option>
              </select>
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="bg-gray-800 border border-gray-600 p-2 rounded">
                {[10, 25, 50].map(n => <option key={n} value={n}>{n} rows</option>)}
              </select>
              <div className="flex gap-2">
                <CSVLink data={data} filename={`${view}.csv`} className="bg-blue-500 px-4 py-2 rounded text-white">Export CSV</CSVLink>
                <label className="bg-green-600 px-4 py-2 rounded text-white cursor-pointer">
                  Import CSV
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-600">
                <thead>
                  <tr className="bg-purple-800 text-white">
                    <th className="p-2 border">
                      <input
                        type="checkbox"
                        onChange={(e) => setSelectedRows(e.target.checked ? filteredData.map(r => r.id) : [])}
                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                      />
                    </th>
                    <th className="p-2 border">Full Name</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Created</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id} className="hover:bg-gray-800">
                      <td className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => setSelectedRows(prev =>
                            prev.includes(row.id)
                              ? prev.filter(id => id !== row.id)
                              : [...prev, row.id]
                          )}
                        />
                      </td>
                      <td className="p-2 border">{row.fullName}</td>
                      <td className="p-2 border capitalize">{row.status}</td>
                      <td className="p-2 border">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="p-2 border space-y-1">
            <td className="p-2 border space-y-1 flex flex-col sm:flex-row sm:gap-2">
  <button onClick={() => updateStatus(row.id, "approved")} className="bg-green-600 px-2 py-1 rounded">Approve</button>
  <button onClick={() => { const notes = prompt("Decline reason"); if (notes) updateStatus(row.id, "declined", notes); }} className="bg-red-600 px-2 py-1 rounded">Decline</button>
  <button onClick={() => updateStatus(row.id, "banned")} className="bg-black px-2 py-1 rounded">Ban</button>
  <button onClick={() => generatePDF(row)} className="bg-blue-500 px-2 py-1 rounded">Download PDF</button>
  <button onClick={() => setModalData(row)} className="bg-blue-600 px-2 py-1 rounded">Edit</button>
</td>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-300">
                Page {currentPage} of {Math.ceil(totalCount / rowsPerPage)}
              </div>
              <div className="space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= Math.ceil(totalCount / rowsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {modalData && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-gray-900 text-white p-6 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Edit Entry</h2>
                  {Object.entries(modalData).map(([key, value]) => {
                    if (["id", "fullName", "dob"].includes(key)) return null;
                    const handleFieldChange = (e) => {
                      let newValue = e.target.value;
                      if (["camera", "sponsors", "ndaAgreement", "isCreator"].includes(key)) newValue = e.target.value === "true";
                      setModalData({ ...modalData, [key]: newValue });
                    };
                    return (
                      <div key={key} className="mb-3">
                        <label className="block text-sm font-semibold mb-1 capitalize">{key}</label>
                        {typeof value === "boolean" ? (
                          <select className="w-full p-2 border rounded" value={String(value)} onChange={handleFieldChange}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input className="w-full p-2 border rounded" type="text" value={value || ""} onChange={handleFieldChange} />
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalData(null)} className="bg-gray-500 px-4 py-2 rounded text-white">Cancel</button>
                    <button onClick={() => {
                      Object.entries(modalData).forEach(([k, v]) => {
                        if (!["id", "fullName", "dob"].includes(k)) updateField(modalData.id, k, v);
                      });
                      setModalData(null);
                    }} className="bg-purple-600 px-4 py-2 rounded text-white">Save</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
