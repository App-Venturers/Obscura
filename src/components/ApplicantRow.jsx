// File: src/components/ApplicantRow.jsx
import jsPDF from "jspdf";

export default function ApplicantRow({
  user,
  isSelected,
  toggleSelect,
  updateStatus,
  openNotesModal,
  openEditModal, // ✅ new prop
}) {
  const generatePDF = (row) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Recruitment Record", 14, 20);
    doc.setFontSize(12);
    doc.text(`Full Name: ${row.full_name}`, 14, 35);
    doc.text(`Status: ${row.status}`, 14, 45);
    doc.text(`Email: ${row.email || "-"}`, 14, 55);
    doc.text(`Submitted: ${new Date(row.created_at).toLocaleDateString()}`, 14, 65);
    doc.save(`Recruitment_${row.full_name.replace(" ", "_")}.pdf`);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      <td className="p-3 border">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(user.id)}
        />
      </td>
      <td className="p-3 border">{user.full_name}</td>
      <td className="p-3 border">{user.email}</td>
      <td className="p-3 border">{user.is_minor ? "Yes" : "No"}</td>
      <td className="p-3 border capitalize">{user.status || "pending"}</td>
      <td className="p-3 border">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="p-3 border space-y-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => updateStatus(user.id, "approved")}
            className="bg-green-600 text-white rounded px-2 py-1 text-xs"
          >
            Approve
          </button>
          <button
            onClick={() => updateStatus(user.id, "leaving_pending")}
            className="bg-yellow-500 text-white rounded px-2 py-1 text-xs"
          >
            Leaving
          </button>
          <button
            onClick={() => updateStatus(user.id, "left")}
            className="bg-gray-600 text-white rounded px-2 py-1 text-xs"
          >
            Left
          </button>
          <button
            onClick={() => openNotesModal(user.id)}
            className="bg-red-600 text-white rounded px-2 py-1 text-xs"
          >
            Decline
          </button>
          <button
            onClick={() => updateStatus(user.id, "banned")}
            className="bg-black text-white rounded px-2 py-1 text-xs"
          >
            Ban
          </button>
          <button
            onClick={() => generatePDF(user)}
            className="bg-blue-600 text-white rounded px-2 py-1 text-xs"
          >
            PDF
          </button>
          <button
            onClick={() => openEditModal(user)}
            className="bg-purple-600 text-white rounded px-2 py-1 text-xs"
          >
            Edit
          </button>
        </div>
        {user.decline_notes && (
          <div className="text-xs text-yellow-600 mt-1">
            Note: {user.decline_notes}
          </div>
        )}
      </td>
    </tr>
  );
}
