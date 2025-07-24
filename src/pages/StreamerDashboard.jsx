import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ApplicantRow from "../components/ApplicantRow";
import DeclineModal from "../components/DeclineModal";
import EditApplicantModal from "../components/EditApplicantModal";
import { useToast } from "../context/ToastContext";
import jsPDF from "jspdf";
import { CSVLink } from "react-csv";
import Papa from "papaparse";

export default function StreamerDashboard() {
  const [streamers, setStreamers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesModal, setNotesModal] = useState({ open: false, userId: null });
  const [editModal, setEditModal] = useState({ open: false, data: null });

  const { addToast } = useToast();

  useEffect(() => {
    const fetchStreamers = async () => {
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
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Streamer Dashboard</h1>
        <div className="flex gap-2">
          <CSVLink
            data={filteredData}
            filename="streamers.csv"
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
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {["", "full_name", "email", "status", "created_at", "actions"].map((key, i) => (
                <th key={i} className="p-3 border">
                  {key === "" ? "✓" : key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <ApplicantRow
                key={user.id}
                user={user}
                isSelected={selectedRows.includes(user.id)}
                toggleSelect={toggleSelect}
                updateStatus={updateStatus}
                openNotesModal={setNotesModal}
                openEditModal={(user) => setEditModal({ open: true, data: user })}
              />
            ))}
          </tbody>
        </table>
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
    </>
  );
}
