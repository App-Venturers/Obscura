// File: src/pages/AdminHRTicketsPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import GradientButton from "../components/GradientButton";
import ConfirmationModal from "../components/ConfirmationModal";

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
    <div className="max-w-6xl mx-auto text-white px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Admin HR Tickets</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {["open", "in_review", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>

      {filtered.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-black/60 border border-purple-700 rounded-xl p-5 mb-6"
        >
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold text-purple-300">
              {ticket.subject}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-gray-800">
              {userMap[ticket.user_id]?.role === "admin" ? "[Admin] " : ""}
              {userMap[ticket.user_id]?.name}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">
            {ticket.status?.toUpperCase()} • {ticket.category} •{" "}
            {new Date(ticket.created_at).toLocaleString()}
          </p>
          <p className="text-white mb-3 whitespace-pre-line">{ticket.message}</p>

          <div className="bg-gray-900 p-3 rounded mb-4">
            <h3 className="text-purple-400 font-semibold mb-2">Feedback</h3>
            {ticket.feedbacks?.map((f) => (
              <div key={f.id} className="mb-2">
                <p className="text-sm text-gray-300">
                  <span className="mr-2">👤</span>
                  <span className="font-bold">
                    {f.user_role === "admin" || f.user_role === "superadmin"
                      ? `[Admin] ${f.user_name}`
                      : f.user_name}
                  </span>{" "}
                  – {new Date(f.created_at).toLocaleString()}
                </p>
                <p className="text-gray-400 ml-6 whitespace-pre-line">
                  {f.content}
                </p>
              </div>
            ))}
            <textarea
              rows="2"
              placeholder="Add reply..."
              className="w-full bg-gray-800 border border-gray-700 mt-2 p-2 text-white rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFeedbackSubmit(ticket.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <GradientButton
                onClick={() => handleResolve(ticket.id, "in_review")}
              >
                Mark In Review
              </GradientButton>
              <GradientButton
                onClick={() => handleResolve(ticket.id, "resolved")}
                className="!bg-green-700"
              >
                Mark Resolved
              </GradientButton>
            </div>
            {currentUserRole === "superadmin" && (
              <button
                className="text-red-400 hover:text-red-300 text-sm"
                onClick={() => setConfirmDelete(ticket.id)}
              >
                Delete Ticket
              </button>
            )}
          </div>
        </div>
      ))}

      {confirmDelete && (
        <ConfirmationModal
          title="Delete Ticket"
          message="Are you sure you want to permanently delete this ticket?"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}