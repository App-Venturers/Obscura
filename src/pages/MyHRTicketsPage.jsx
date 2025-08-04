import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavigationBar from "../components/NavigationBar";
import GradientButton from "../components/GradientButton";

export default function MyHRTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
        toast.error("❌ Failed to fetch TICKETS.");
        return;
      }

      const ticketIds = ticketsRaw.map((t) => t.id);

      if (ticketIds.length === 0) {
        setTickets([]);
        return;
      }

      const { data: feedbacksRaw, error: feedbacksError } = await supabase
        .from("hr_ticket_feedbacks")
        .select("*")
        .in("ticket_id", ticketIds);

      if (feedbacksError) {
        toast.error("❌ Failed to fetch FEEDBACK.");
        return;
      }

      const ticketsWithFeedbacks = ticketsRaw.map((ticket) => ({
        ...ticket,
        feedbacks: feedbacksRaw.filter((f) => f.ticket_id === ticket.id),
      }));

      setTickets(ticketsWithFeedbacks);
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
      toast.error("❌ Refresh error: TICKETS");
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
      toast.error("❌ Refresh error: FEEDBACK");
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

  const renderFeedbackHeader = (feedback) => {
    const name = feedback.user_name || "Support";
    const isAdmin =
      feedback.user_role === "admin" || feedback.user_role === "superadmin";
    return (
      <>
        👤{" "}
        <span className="font-bold text-gray-300">
          {isAdmin && <span className="text-pink-400">[Admin] </span>}
          {name}
        </span>{" "}
        – {new Date(feedback.created_at).toLocaleString()}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <NavigationBar />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">My HR Tickets</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {["open", "in_review", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {filteredTickets.length === 0 ? (
          <p className="text-center text-gray-400">No tickets in this tab.</p>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-purple-700 bg-gray-900/60 rounded-xl mb-6 p-4 shadow-lg"
            >
              <button
                className="w-full text-left flex justify-between items-center"
                onClick={() => handleToggle(ticket.id)}
              >
                <div>
                  <h2 className="text-xl font-bold mb-1">{ticket.subject}</h2>
                  <p className="text-sm text-gray-400">
                    Category: {ticket.category} •{" "}
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-purple-400">
                  {expandedTicketId === ticket.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedTicketId === ticket.id && (
                <div className="mt-4 space-y-4">
                  <p className="text-gray-300 whitespace-pre-line">
                    {ticket.description}
                  </p>

                  {ticket.feedbacks?.length > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-400 mb-2">
                        Feedback
                      </h3>
                      {ticket.feedbacks.map((f) => (
                        <div
                          key={f.id}
                          className="mb-2 border-b border-gray-700 pb-2"
                        >
                          <p className="text-sm font-bold text-gray-300">
                            {renderFeedbackHeader(f)}
                          </p>
                          <p className="text-gray-400 whitespace-pre-line">
                            {f.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="Add feedback or respond..."
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white resize-none"
                    value={feedbackInputs[ticket.id] || ""}
                    onChange={(e) =>
                      handleFeedbackChange(ticket.id, e.target.value)
                    }
                  />
                  <GradientButton onClick={() => submitFeedback(ticket.id)}>
                    Submit Feedback
                  </GradientButton>

                  {ticket.status === "resolved" && (
                    <button
                      onClick={() => reopenTicket(ticket.id)}
                      className="mt-2 text-sm text-purple-400 hover:underline"
                    >
                      Re-open this ticket
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
