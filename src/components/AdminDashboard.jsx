// File: src/components/AdminDashboard.jsx
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

import ApplicantRow from "./ApplicantRow";
import DeclineModal from "./DeclineModal";
import EditApplicantModal from "./EditApplicantModal";
import { useToast } from "../context/ToastContext";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 4px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

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
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    const urlTab = new URLSearchParams(location.search).get("tab");
    if (urlTab) setTabFilter(urlTab);
  }, [location.search]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData?.role || !["admin", "superadmin"].includes(roleData.role)) {
        navigate("/");
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

    switch (tabFilter) {
      case "minors":
        result = result.filter((r) => r.is_minor);
        break;
      case "non-minors":
        result = result.filter((r) => !r.is_minor);
        break;
      case "banned":
        result = result.filter((r) => r.status === "banned");
        break;
      case "left":
        result = result.filter((r) => r.status === "left");
        break;
      default:
        result = result.filter((r) => r.status !== "banned" && r.status !== "left");
    }

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

  const tabs = [
    { id: "all", label: "All", gradient: "from-purple-600 to-blue-600" },
    { id: "minors", label: "Minors", gradient: "from-cyan-600 to-blue-600" },
    { id: "non-minors", label: "Non Minors", gradient: "from-green-600 to-teal-600" },
    { id: "banned", label: "Banned", gradient: "from-red-600 to-pink-600" },
    { id: "left", label: "Left", gradient: "from-gray-600 to-slate-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center relative">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse">
            Loading Dashboard
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mt-4"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <FloatingParticles />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 mb-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Admin Dashboard
            </h1>
            {currentUserEmail && (
              <p className="text-sm text-purple-300/70 mt-1">
                Logged in as: <span className="font-semibold text-purple-400">{currentUserEmail}</span>
              </p>
            )}
          </div>

          {/* Export/Import Buttons */}
          <div className="flex flex-wrap gap-2">
            <CSVLink
              data={filteredData}
              filename="applicants.csv"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export CSV
            </CSVLink>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Export PDF
            </motion.button>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer">
              <ArrowUpTrayIcon className="w-5 h-5" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 pl-10 pr-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Tab Filters */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-2 mb-6 flex-wrap"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`?tab=${tab.id}`)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              tabFilter === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                : "bg-black/40 backdrop-blur-sm border border-purple-700/30 text-purple-300 hover:text-white hover:border-purple-500"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-4 flex items-center justify-between"
        >
          <span className="text-purple-300">
            {selectedRows.length} items selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("approved")}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => handleBulkAction("declined")}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Bulk Decline
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Clear Selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="overflow-x-auto bg-black/40 backdrop-blur-sm border border-purple-700/30 rounded-xl shadow-xl"
      >
        <table className="w-full text-sm">
          <thead className="bg-purple-900/20 border-b border-purple-700/30">
            <tr>
              {["", "full_name", "email", "is_minor", "status", "created_at", "actions"].map(
                (key, i) => (
                  <th
                    key={i}
                    className="p-4 text-left text-purple-300 font-semibold cursor-pointer hover:text-purple-200 transition-colors"
                    onClick={() => key && key !== "actions" && key !== "" && handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {key === ""
                        ? "✓"
                        : key === "is_minor"
                        ? "Minor"
                        : key === "created_at"
                        ? "Created"
                        : key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                      {sortBy === key && (
                        <span className="text-purple-400">
                          {sortAsc ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, index) => (
              <ApplicantRow
                key={user.id}
                user={user}
                isSelected={selectedRows.includes(user.id)}
                toggleSelect={toggleSelect}
                updateStatus={updateStatus}
                openNotesModal={(userId) => setNotesModal({ open: true, userId })}
                openEditModal={(user) => setEditModal({ open: true, data: user })}
                index={index}
              />
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-12 text-purple-300/50">
            No applicants found
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-6 gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                currentPage === i + 1
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-black/40 backdrop-blur-sm border border-purple-700/30 text-purple-300 hover:text-white hover:border-purple-500"
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <DeclineModal
        visible={notesModal.open}
        onClose={() => setNotesModal({ open: false, userId: null })}
        onSave={async () => {
          await updateStatus(notesModal.userId, "declined", noteInput);
          addToast("User declined");
          setNotesModal({ open: false, userId: null });
          setNoteInput("");
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
    </div>
  );
}