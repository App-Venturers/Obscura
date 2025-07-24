import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import StatCard from "../components/StatCard";
import {
  FiUsers,
  FiThumbsUp,
  FiThumbsDown,
  FiUserX,
  FiUserCheck,
  FiUserMinus,
} from "react-icons/fi";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    declined: 0,
    banned: 0,
    leaving_pending: 0,
    left: 0,
  });
  const [previousStats, setPreviousStats] = useState(null); // Optional: support for % change

  useEffect(() => {
    const fetchStats = async () => {
      const filters = (query) =>
        query.not("full_name", "is", null).not("dob", "is", null);

      // Total count
      const { count: total } = await filters(
        supabase.from("users").select("*", { count: "exact", head: true })
      );

      // Status-specific counts
      const statusKeys = ["approved", "declined", "banned", "leaving_pending", "left"];
      const statusCounts = await Promise.all(
        statusKeys.map((status) =>
          filters(
            supabase
              .from("users")
              .select("*", { count: "exact", head: true })
              .eq("status", status)
          )
        )
      );

      setStats({
        total: total || 0,
        approved: statusCounts[0].count || 0,
        declined: statusCounts[1].count || 0,
        banned: statusCounts[2].count || 0,
        leaving_pending: statusCounts[3].count || 0,
        left: statusCounts[4].count || 0,
      });
    };

    fetchStats();
  }, []);

  const calcChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-wide text-white">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Applicants"
          count={stats.total}
          icon={FiUsers}
          color="blue"
          percentChange={calcChange(stats.total, previousStats?.total)}
        />
        <StatCard
          title="Approved"
          count={stats.approved}
          icon={FiThumbsUp}
          color="green"
          percentChange={calcChange(stats.approved, previousStats?.approved)}
        />
        <StatCard
          title="Declined"
          count={stats.declined}
          icon={FiThumbsDown}
          color="red"
          percentChange={calcChange(stats.declined, previousStats?.declined)}
        />
        <StatCard
          title="Banned"
          count={stats.banned}
          icon={FiUserX}
          color="rose"
          percentChange={calcChange(stats.banned, previousStats?.banned)}
        />
        <StatCard
          title="Leaving"
          count={stats.leaving_pending}
          icon={FiUserMinus}
          color="amber"
          percentChange={calcChange(stats.leaving_pending, previousStats?.leaving_pending)}
        />
        <StatCard
          title="Left"
          count={stats.left}
          icon={FiUserCheck}
          color="gray"
          percentChange={calcChange(stats.left, previousStats?.left)}
        />
      </div>
    </div>
  );
}
