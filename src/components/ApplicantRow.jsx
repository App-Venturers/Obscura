import jsPDF from "jspdf";

export default function ApplicantRow({
  user,
  isSelected,
  toggleSelect,
  updateStatus,
  openNotesModal,
  openEditModal,
}) {
  const generatePDF = async (row) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    const logoUrl =
      "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png";
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 80, y, 50, 20);
      y += 30;

      doc.setFontSize(16);
      doc.text("Recruitment Record", margin, y);
      y += 15;

      doc.setFontSize(12);
      const addField = (label, value) => {
        const text = `${label}: ${value ?? "-"}`;
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, margin, y);
        y += lines.length * 8;
        if (y > 250) {
          drawFooter();
          doc.addPage();
          y = 20;
        }
      };

      // Personal Info
      addField("Full Name", row.full_name);
      addField("Email", row.email);
      addField("Status", row.status);
      addField("Submitted", new Date(row.created_at).toLocaleDateString());
      addField("Date of Birth", row.dob);
      addField("Is Minor", row.is_minor ? "Yes" : "No");
      addField("Phone Number", row.phone_number);
      addField("Discord Handle", row.discord);

      // Socials
      addField("Instagram", row.instagram);
      addField("YouTube", row.youtube);
      addField("TikTok", row.tiktok);
      addField("Facebook", row.facebook);
      addField("Twitch", row.twitch);

      // Platforms
      addField("Platform", row.platform);
      addField("Other Platform", row.platform_other);

      // Languages
      addField("Language", row.language);
      addField("Other Language", row.language_other);

      // Software
      addField("Software Used", row.software_used);
      addField("Other Software", row.software_other);

      // Freeform
      addField("Why Join Obscura", row.why_join);
      addField("Additional Info", row.additional_info);

      // Admin
      addField("Decline Notes", row.decline_notes);

      // Draw final footer
      drawFooter();

      doc.save(`Recruitment_${row.full_name?.replace(/\s+/g, "_") || "record"}.pdf`);
    };

    // Footer: current date + admin email
    const drawFooter = () => {
      const pageHeight = doc.internal.pageSize.height;
      const currentDate = new Date();
      const formatted = currentDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const adminEmail = localStorage.getItem("userEmail") || "Unknown";

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${formatted}`, 14, pageHeight - 12);
      doc.text(`Exporter: ${adminEmail}`, 14, pageHeight - 6);
    };

    logoImg.src = logoUrl;
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
