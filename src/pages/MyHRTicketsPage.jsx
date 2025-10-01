import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  InboxIcon,
  ArrowLeftIcon
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

export default function MyHRTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return navigate("/");

      setCurrentUser(user);

      const { data: roleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setUserRole(roleData?.role);

      const { data: ticketsRaw, error: ticketsError } = await supabase
        .from("hr_support")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ticketsError) {
        toast.error("Failed to fetch tickets.");
        setLoading(false);
        return;
      }

      const ticketIds = ticketsRaw.map((t) => t.id);

      if (ticketIds.length === 0) {
        setTickets([]);
        setLoading(false);
        return;
      }

      const { data: feedbacksRaw, error: feedbacksError } = await supabase
        .from("hr_ticket_feedbacks")
        .select("*")
        .in("ticket_id", ticketIds);

      if (feedbacksError) {
        toast.error("Failed to fetch feedback.");
        setLoading(false);
        return;
      }

      const ticketsWithFeedbacks = ticketsRaw.map((ticket) => ({
        ...ticket,
        feedbacks: feedbacksRaw.filter((f) => f.ticket_id === ticket.id),
      }));

      setTickets(ticketsWithFeedbacks);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleToggle = (ticketId) => {
    setExpandedTicketId((prev) => (prev === ticketId ? null : ticketId));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedTicketId(null);
  };

  const handleFeedbackChange = (ticketId, value) => {
    setFeedbackInputs((prev) => ({ ...prev, [ticketId]: value }));
  };

  const submitFeedback = async (ticketId) => {
    const content = feedbackInputs[ticketId];
    if (!content?.trim()) return toast.error("Feedback cannot be empty.");

    const fullName =
      currentUser.user_metadata?.full_name ||
      currentUser.full_name ||
      currentUser.email;

    const { error } = await supabase.from("hr_ticket_feedbacks").insert([
      {
        ticket_id: ticketId,
        user_id: currentUser.id,
        content,
        user_name: fullName,
        user_role: userRole,
      },
    ]);

    if (error) {
      toast.error("Failed to submit feedback.");
      return;
    }

    toast.success("Feedback submitted.");
    setFeedbackInputs((prev) => ({ ...prev, [ticketId]: "" }));
    await refreshTickets();
  };

  const reopenTicket = async (ticketId) => {
    const { error } = await supabase
      .from("hr_support")
      .update({ status: "open" })
      .eq("id", ticketId);

    if (error) {
      toast.error("Failed to reopen ticket.");
      return;
    }

    toast.success("Ticket reopened.");
    setExpandedTicketId(null);
    await refreshTickets();
  };

  const refreshTickets = async () => {
    const { data: updatedTickets, error: ticketError } = await supabase
      .from("hr_support")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (ticketError) {
      toast.error("Refresh error: Failed to fetch tickets");
      return;
    }

    const ticketIds = updatedTickets.map((t) => t.id);

    if (ticketIds.length === 0) {
      setTickets([]);
      return;
    }

    const { data: updatedFeedbacks, error: feedbackError } = await supabase
      .from("hr_ticket_feedbacks")
      .select("*")
      .in("ticket_id", ticketIds);

    if (feedbackError) {
      toast.error("Refresh error: Failed to fetch feedback");
      return;
    }

    const merged = updatedTickets.map((ticket) => ({
      ...ticket,
      feedbacks: updatedFeedbacks.filter((f) => f.ticket_id === ticket.id),
    }));

    setTickets(merged);
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "open") return t.status === "open";
    if (activeTab === "in_review") return t.status === "in_review";
    if (activeTab === "resolved") return t.status === "resolved";
    return true;
  });

  const getTicketCountByStatus = (status) => {
    return tickets.filter((t) => t.status === status).length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <ExclamationCircleIcon className="w-4 h-4" />;
      case "in_review":
        return <ClockIcon className="w-4 h-4" />;
      case "resolved":
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <TicketIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "from-amber-600 to-orange-600";
      case "in_review":
        return "from-blue-600 to-cyan-600";
      case "resolved":
        return "from-green-600 to-emerald-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      </div>

      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Home
        </motion.button>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
            My HR Tickets
          </h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <TicketIcon className="w-5 h-5" />
            Track and manage your support requests
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-4 mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { value: "open", label: "Open", icon: ExclamationCircleIcon, color: "from-amber-600 to-orange-600" },
              { value: "in_review", label: "In Review", icon: ClockIcon, color: "from-blue-600 to-cyan-600" },
              { value: "resolved", label: "Resolved", icon: CheckCircleIcon, color: "from-green-600 to-emerald-600" }
            ].map((tab) => (
              <motion.button
                key={tab.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabChange(tab.value)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.value
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "bg-black/30 text-purple-300 border border-purple-700/30 hover:bg-purple-900/20"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
                  {getTicketCountByStatus(tab.value)}
                </span>
              </motion.button>
            ))}
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
        ) : filteredTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-12 text-center"
          >
            <InboxIcon className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-300 mb-2">No tickets found</h3>
            <p className="text-gray-500">
              {activeTab === "open"
                ? "You don't have any open tickets at the moment."
                : activeTab === "in_review"
                ? "No tickets are currently under review."
                : "You haven't resolved any tickets yet."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl mb-4 overflow-hidden hover:border-purple-600/40 transition-all duration-300"
              >
                {/* Ticket Header */}
                <motion.button
                  className="w-full p-5 text-left hover:bg-purple-900/10 transition-colors duration-200"
                  onClick={() => handleToggle(ticket.id)}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h2 className="text-xl font-bold text-white">
                          {ticket.subject}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(ticket.status)} text-white`}>
                          {ticket.status?.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="text-purple-400">Category:</span>
                          {ticket.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-purple-400">Created:</span>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        {ticket.feedbacks?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            {ticket.feedbacks.length} replies
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedTicketId === ticket.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-purple-400"
                    >
                      <ChevronDownIcon className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedTicketId === ticket.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-purple-700/20"
                    >
                      <div className="p-5 space-y-4">
                        {/* Ticket Description */}
                        <div className="bg-black/30 rounded-lg p-4 border border-purple-700/20">
                          <h3 className="text-sm font-semibold text-purple-400 mb-2">Description</h3>
                          <p className="text-gray-300 whitespace-pre-line">
                            {ticket.message || ticket.description || "No description provided"}
                          </p>
                        </div>

                        {/* Feedback Thread */}
                        {ticket.feedbacks?.length > 0 && (
                          <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-lg p-4 border border-purple-700/20">
                            <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                              Discussion Thread
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {ticket.feedbacks.map((feedback, idx) => {
                                const isAdmin = feedback.user_role === "admin" || feedback.user_role === "superadmin";
                                return (
                                  <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-3 rounded-lg border-l-2 ${
                                      isAdmin
                                        ? 'bg-purple-900/20 border-purple-500'
                                        : 'bg-black/20 border-gray-600'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className={`text-sm font-semibold ${
                                        isAdmin ? 'text-purple-400' : 'text-gray-300'
                                      }`}>
                                        {isAdmin && "👑 Admin - "}
                                        {feedback.user_name || "Support"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(feedback.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-line">
                                      {feedback.content}
                                    </p>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Reply Input */}
                        <div className="space-y-3">
                          <div className="relative">
                            <ChatBubbleLeftRightIcon className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                            <textarea
                              rows={3}
                              placeholder="Type your message here..."
                              className="w-full pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                              value={feedbackInputs[ticket.id] || ""}
                              onChange={(e) => handleFeedbackChange(ticket.id, e.target.value)}
                            />
                          </div>

                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => submitFeedback(ticket.id)}
                              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                              Send Reply
                            </motion.button>

                            {ticket.status === "resolved" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => reopenTicket(ticket.id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 flex items-center gap-2"
                              >
                                <ArrowPathIcon className="w-4 h-4" />
                                Reopen Ticket
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}