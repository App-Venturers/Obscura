// File: src/components/AdminDashboard.jsx
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";

import ApplicantRow from "./ApplicantRow";
import DeclineModal from "./DeclineModal";
import EditApplicantModal from "./EditApplicantModal";
import { useToast } from "../context/ToastContext";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [notesModal, setNotesModal] = useState({ open: false, userId: null });
  const [noteInput, setNoteInput] = useState("");
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [tabFilter, setTabFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    let query = supabase
      .from("users")
      .select("*")
      .not("full_name", "is", null)
      .not("dob", "is", null)
      .order("created_at", { ascending: true });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (!error) setData(data || []);
  }, [statusFilter]);

  useEffect(() => {
    const urlTab = new URLSearchParams(location.search).get("tab");
    if (urlTab) setTabFilter(urlTab);
  }, [location.search]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/entry"); // Not logged in
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData?.role || !["admin", "superadmin"].includes(roleData.role)) {
        navigate("/entry"); // Not authorized
        return;
      }

      setCurrentUserRole(roleData.role);
      setCurrentUserEmail(user.email);
      fetchData();
    };

    init();
  }, [fetchData, navigate]);

  useEffect(() => {
    let result = [...data];

    if (tabFilter === "minors") result = result.filter((r) => r.is_minor);
    if (tabFilter === "non-minors") result = result.filter((r) => !r.is_minor);
    if (tabFilter === "banned") result = result.filter((r) => r.status === "banned");
    if (tabFilter === "left") result = result.filter((r) => r.status === "left");

    if (search.trim()) {
      result = result.filter((row) =>
        Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, tabFilter, search, sortBy, sortAsc]);

  const updateStatus = async (id, newStatus, notes = "") => {
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus, decline_notes: notes })
      .eq("id", id);
    if (!error) {
      addToast(`User updated to "${newStatus}"`);
      fetchData();
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSort = (key) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const handleBulkAction = async (status) => {
    const { error } = await supabase
      .from("users")
      .update({ status })
      .in("id", selectedRows);
    if (!error) {
      addToast(`Updated ${selectedRows.length} users to ${status}`);
      setSelectedRows([]);
      fetchData();
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Applicant Export", 14, 20);
    let y = 30;
    filteredData.forEach((user, idx) => {
      doc.text(`${idx + 1}. ${user.full_name} - ${user.status}`, 14, y);
      y += 10;
    });
    doc.save("Applicants.pdf");
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        const cleaned = data.map((row) => ({ ...row, is_minor: false }));
        const { error } = await supabase.from("users").insert(cleaned);
        if (!error) {
          addToast("CSV Imported");
          fetchData();
        }
      },
    });
  };

  const paginated = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {currentUserEmail && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Logged in as: <span className="font-semibold">{currentUserEmail}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <CSVLink
            data={filteredData}
            filename="applicants.csv"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={handleExportPDF}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "minors", "non-minors", "banned", "left"].map((tab) => (
          <button
            key={tab}
            onClick={() => navigate(`?tab=${tab}`)}
            className={`px-4 py-2 rounded ${
              tabFilter === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border dark:border-gray-700 px-3 py-2 rounded"
        />
        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
        </label>
        {selectedRows.length > 0 && (
          <>
            <button
              onClick={() => handleBulkAction("approved")}
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              Approve All
            </button>
            <button
              onClick={() => handleBulkAction("banned")}
              className="bg-red-700 text-white px-4 py-2 rounded"
            >
              Ban All
            </button>
          </>
        )}
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {["", "full_name", "email", "is_minor", "status", "created_at", "actions"].map(
                (key, i) => (
                  <th
                    key={i}
                    className="p-3 border cursor-pointer"
                    onClick={() => key && key !== "actions" && handleSort(key)}
                  >
                    {key === ""
                      ? "✓"
                      : key === "is_minor"
                      ? "Minor"
                      : key === "created_at"
                      ? "Created"
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortBy === key ? (sortAsc ? " ↑" : " ↓") : ""}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <ApplicantRow
                key={user.id}
                user={user}
                isSelected={selectedRows.includes(user.id)}
                toggleSelect={toggleSelect}
                updateStatus={updateStatus}
                openNotesModal={setNotesModal}
                openEditModal={(user) => {
                  setEditModal({ open: true, data: user });
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <DeclineModal
        visible={notesModal.open}
        onClose={() => setNotesModal({ open: false, userId: null })}
        onSave={async () => {
          await updateStatus(notesModal.userId, "declined", noteInput);
          addToast("User declined");
          setNotesModal({ open: false, userId: null });
        }}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
      />

      <EditApplicantModal
        isOpen={!!editModal.open}
        applicantData={editModal.data}
        onClose={() => setEditModal({ open: false, data: null })}
        onSave={() => {
          fetchData();
          setEditModal({ open: false, data: null });
        }}
      />
    </>
  );
}
