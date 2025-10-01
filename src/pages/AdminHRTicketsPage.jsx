// File: src/pages/AdminHRTicketsPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon
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

export default function AdminHRTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    setCurrentUserRole(roleData?.role);

    const { data: ticketsRaw, error } = await supabase
      .from("hr_support")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch tickets.");
      return;
    }

    const userIds = [...new Set(ticketsRaw.map((t) => t.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .in("id", userIds);

    const map = {};
    users.forEach((u) => {
      map[u.id] = {
        name: u.full_name || u.email,
        role: u.role || "user",
      };
    });

    for (const ticket of ticketsRaw) {
      const { data: feedbacks } = await supabase
        .from("hr_ticket_feedbacks")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at");
      ticket.feedbacks = feedbacks || [];
    }

    setUserMap(map);
    setTickets(ticketsRaw);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const ticketChannel = supabase
      .channel("hr-support-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hr_support" },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    const feedbackChannel = supabase
      .channel("hr-feedback-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hr_ticket_feedbacks" },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(feedbackChannel);
    };
  }, []);

  const handleFeedbackSubmit = async (ticketId, content) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fullName =
      user.user_metadata?.full_name || user.full_name || user.email;

    const { error } = await supabase.from("hr_ticket_feedbacks").insert([
      {
        ticket_id: ticketId,
        user_id: user.id,
        content,
        user_name: fullName,
        user_role: currentUserRole,
      },
    ]);

    if (!error) toast.success("Feedback added.");
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("hr_support").delete().eq("id", id);
    if (!error) toast.success("Ticket deleted.");
    setConfirmDelete(null);
    fetchData();
  };

  const handleResolve = async (id, status) => {
    const { error } = await supabase
      .from("hr_support")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status.");
      return;
    }

    toast.success(`Ticket marked as ${status}.`);
    fetchData();
  };

  const filtered = tickets.filter(
    (t) =>
      (activeTab === "all" || t.status === activeTab) &&
      userMap[t.user_id]?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <FloatingParticles />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
            HR Support Tickets
          </h1>
          <p className="text-gray-400">Manage and respond to HR support requests</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "open", label: "Open", icon: ExclamationTriangleIcon, color: "from-amber-600 to-orange-600" },
                { value: "in_review", label: "In Review", icon: ClockIcon, color: "from-blue-600 to-cyan-600" },
                { value: "resolved", label: "Resolved", icon: CheckCircleIcon, color: "from-green-600 to-emerald-600" }
              ].map((tab) => (
                <motion.button
                  key={tab.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.value
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : "bg-black/30 text-purple-300 border border-purple-700/30 hover:bg-purple-900/20"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className="text-xs opacity-75">
                    ({tickets.filter(t => t.status === tab.value).length})
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="relative w-full md:w-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Tickets List */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-300">Loading tickets...</p>
            </div>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-12 text-center"
          >
            <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-300 mb-2">No tickets found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 mb-4 hover:border-purple-600/40 transition-all duration-300"
              >
                {/* Ticket Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-1">
                      {ticket.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`px-3 py-1 rounded-full font-semibold capitalize ${
                        ticket.status === 'resolved' ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
                        ticket.status === 'in_review' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' :
                        'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      }`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      <span className="text-purple-300">
                        <span className="text-gray-500">Category:</span> {ticket.category}
                      </span>
                      <span className="text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      userMap[ticket.user_id]?.role === "admin" || userMap[ticket.user_id]?.role === "superadmin"
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-black/30 text-purple-300 border border-purple-700/30'
                    }`}>
                      {userMap[ticket.user_id]?.role === "admin" || userMap[ticket.user_id]?.role === "superadmin" ? "👑 " : "👤 "}
                      {userMap[ticket.user_id]?.name}
                    </span>
                  </div>
                </div>

                {/* Ticket Message */}
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-700/20">
                  <p className="text-gray-200 whitespace-pre-line leading-relaxed">{ticket.message}</p>
                </div>

                {/* Feedback Section */}
                <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-700/20">
                  <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                    Discussion Thread
                  </h3>

                  {ticket.feedbacks && ticket.feedbacks.length > 0 ? (
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {ticket.feedbacks.map((f) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-black/20 rounded-lg p-3 border-l-2 border-purple-600/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-semibold ${
                              f.user_role === "admin" || f.user_role === "superadmin"
                                ? 'text-purple-400'
                                : 'text-gray-300'
                            }`}>
                              {f.user_role === "admin" || f.user_role === "superadmin" ? "👑 " : "💬 "}
                              {f.user_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(f.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                            {f.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-3 italic">No replies yet</p>
                  )}

                  <textarea
                    rows="3"
                    placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                    className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (e.target.value.trim()) {
                          handleFeedbackSubmit(ticket.id, e.target.value);
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                  <div className="flex flex-wrap gap-2">
                    {ticket.status !== "in_review" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(ticket.id, "in_review")}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                      >
                        <ClockIcon className="w-4 h-4" />
                        Mark In Review
                      </motion.button>
                    )}
                    {ticket.status !== "resolved" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(ticket.id, "resolved")}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Mark Resolved
                      </motion.button>
                    )}
                    {ticket.status === "resolved" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(ticket.id, "open")}
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 flex items-center gap-2"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Reopen Ticket
                      </motion.button>
                    )}
                  </div>
                  {currentUserRole === "superadmin" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                      onClick={() => setConfirmDelete(ticket.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete Ticket
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Confirmation Modal */}
        {confirmDelete && (
          <ConfirmationModal
            title="Delete Ticket"
            message="Are you sure you want to permanently delete this ticket?"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete)}
          />
        )}
      </div>
    </div>
  );
}