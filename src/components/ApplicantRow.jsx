import jsPDF from "jspdf";
import { motion } from "framer-motion";

export default function ApplicantRow({
  user,
  isSelected,
  toggleSelect,
  updateStatus,
  openNotesModal,
  openEditModal,
  index = 0,
}) {
  const generatePDF = (row) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    const logoUrl =
      "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png";
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";

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

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 80, y, 50, 20);
      y += 30;

      doc.setFontSize(16);
      doc.text("Recruitment Record", margin, y);
      y += 15;

      doc.setFontSize(12);

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

      drawFooter();
      doc.save(`Recruitment_${row.full_name?.replace(/\s+/g, "_") || "record"}.pdf`);
    };

    logoImg.src = logoUrl;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-purple-700/20 hover:bg-purple-900/10 transition-all duration-200"
    >
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(user.id)}
          className="w-4 h-4 text-purple-600 bg-black/30 border-purple-700/30 rounded focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0"
        />
      </td>
      <td className="p-4 text-white font-medium">{user.full_name}</td>
      <td className="p-4 text-purple-300">{user.email}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          user.is_minor
            ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
            : 'bg-green-600/20 text-green-400 border border-green-600/30'
        }`}>
          {user.is_minor ? "Yes" : "No"}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
          user.status === 'approved' ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
          user.status === 'declined' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
          user.status === 'banned' ? 'bg-red-900/20 text-red-300 border border-red-900/30' :
          user.status === 'left' ? 'bg-gray-600/20 text-gray-400 border border-gray-600/30' :
          user.status === 'leaving_pending' ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' :
          'bg-purple-600/20 text-purple-400 border border-purple-600/30'
        }`}>
          {user.status || "pending"}
        </span>
      </td>
      <td className="p-4 text-gray-400">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {/* Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(user.id, "approved")}
            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-green-500/25"
          >
            Approve
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openNotesModal(user.id)}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-semibold rounded-md hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-red-500/25"
          >
            Decline
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(user.id, "leaving_pending")}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-semibold rounded-md hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-amber-500/25"
          >
            Leaving
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(user.id, "left")}
            className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-slate-600 text-white text-xs font-semibold rounded-md hover:from-gray-700 hover:to-slate-700 transition-all duration-200 shadow-md hover:shadow-gray-500/25"
          >
            Left
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(user.id, "banned")}
            className="px-3 py-1.5 bg-gradient-to-r from-red-900 to-red-700 text-white text-xs font-semibold rounded-md hover:from-red-950 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-red-900/25"
          >
            Ban
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generatePDF(user)}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-md hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-blue-500/25"
          >
            PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openEditModal(user)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-purple-500/25"
          >
            Edit
          </motion.button>
        </div>

        {/* Decline Notes */}
        {user.decline_notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded-md"
          >
            <p className="text-xs text-yellow-400">
              <span className="font-semibold">Note:</span> {user.decline_notes}
            </p>
          </motion.div>
        )}
      </td>
    </motion.tr>
  );
}