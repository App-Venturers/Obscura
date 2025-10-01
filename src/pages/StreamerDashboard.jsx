import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DeclineModal from "../components/DeclineModal";
import EditApplicantModal from "../components/EditApplicantModal";
import { useToast } from "../context/ToastContext";
import jsPDF from "jspdf";
import { CSVLink } from "react-csv";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
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
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 3px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

export default function StreamerDashboard() {
  const [streamers, setStreamers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesModal, setNotesModal] = useState({ open: false, userId: null });
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    const fetchStreamers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .not("full_name", "is", null)
        .not("dob", "is", null);

      const platformSet = ["YouTube", "Twitch", "TikTok", "Facebook", "Instagram", "Other"];

      if (!error) {
        const allStreamers = data.filter((user) => {
          const platforms = user.platforms || [];
          return Array.isArray(platforms) && platforms.some((p) => platformSet.includes(p));
        });
        setStreamers(allStreamers);
        setFilteredData(allStreamers);
      }
      setLoading(false);
    };

    fetchStreamers();
  }, []);

  useEffect(() => {
    let result = [...streamers];
    if (search.trim()) {
      result = result.filter((row) =>
        Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredData(result);
  }, [search, streamers]);

  const updateStatus = async (id, newStatus, notes = "") => {
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus, decline_notes: notes })
      .eq("id", id);
    if (!error) {
      addToast(`User updated to "${newStatus}"`);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Streamer Export", 14, 20);

    let y = 30;
    filteredData.forEach((user, idx) => {
      doc.text(`${idx + 1}. ${user.full_name} - ${user.status}`, 14, y);
      y += 10;
    });

    doc.save("Streamers.pdf");
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        const cleaned = data.map((row) => ({ ...row }));
        const { error } = await supabase.from("users").insert(cleaned);
        if (!error) {
          addToast("CSV Imported");
        } else {
          addToast("Import failed", "error");
        }
      },
    });
  };

  return (
    <div className="relative min-h-screen">
      <FloatingParticles />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
                Streamer Dashboard
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <VideoCameraIcon className="w-5 h-5" />
                Manage content creators and streaming partners
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <CSVLink
                data={filteredData}
                filename="streamers.csv"
                className="inline-block"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </motion.button>
              </CSVLink>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportPDF}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Export PDF
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search streamers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
              />
            </div>

            {/* Import CSV */}
            <label className="cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                Import CSV
              </motion.div>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Total:</span>
              <span className="text-purple-400 font-bold">{filteredData.length}</span>
              <span className="text-gray-400">streamers</span>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300">Loading streamers...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <VideoCameraIcon className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-300 mb-2">No streamers found</h3>
              <p className="text-gray-500">Try adjusting your search terms or import new data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-700/30">
                  <tr>
                    {["", "Name", "Email", "Status", "Joined", "Actions"].map((key, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider"
                      >
                        {key === "" ? (
                          <div className="w-5 h-5 border-2 border-purple-500/50 rounded" />
                        ) : (
                          key
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-700/20">
                  <AnimatePresence>
                    {filteredData.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="hover:bg-purple-900/10 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(user.id)}
                            onChange={() => toggleSelect(user.id)}
                            className="w-5 h-5 text-purple-600 bg-gray-800 border-purple-500/50 rounded focus:ring-purple-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {user.full_name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.platforms?.join(", ") || "No platforms"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'approved'
                              ? 'bg-green-900/50 text-green-400 border border-green-600/30'
                              : user.status === 'declined'
                              ? 'bg-red-900/50 text-red-400 border border-red-600/30'
                              : user.status === 'interviewed'
                              ? 'bg-blue-900/50 text-blue-400 border border-blue-600/30'
                              : 'bg-yellow-900/50 text-yellow-400 border border-yellow-600/30'
                          }`}>
                            {user.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(user.id, "approved")}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Approve"
                            >
                              ✓
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setNotesModal({ open: true, userId: user.id });
                                setNoteInput(user.decline_notes || "");
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Decline"
                            >
                              ✗
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditModal({ open: true, data: user })}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="Edit"
                            >
                              ✎
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modals */}
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
          isOpen={editModal.open}
          applicantData={editModal.data}
          onClose={() => setEditModal({ open: false, data: null })}
          onSave={async () => {
            const { data } = await supabase
              .from("users")
              .select("*")
              .not("full_name", "is", null)
              .not("dob", "is", null);
            const platformSet = ["YouTube", "Twitch", "TikTok", "Facebook", "Instagram", "Other"];
            const updated = data.filter((user) =>
              Array.isArray(user.platforms) &&
              user.platforms.some((p) => platformSet.includes(p))
            );
            setStreamers(updated);
            setFilteredData(updated);
          }}
        />
      </div>
    </div>
  );
}