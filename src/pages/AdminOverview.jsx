import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiThumbsUp,
  FiThumbsDown,
  FiUserX,
  FiUserCheck,
  FiUserMinus,
} from "react-icons/fi";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 6px rgba(168, 85, 247, 0.5)',
          }}
        />
      ))}
    </div>
  );
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    declined: 0,
    banned: 0,
    leaving_pending: 0,
    left: 0,
  });
  const [previousStats, setPreviousStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
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

      setLoading(false);
    };

    fetchStats();
  }, []);

  const calcChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const statCards = [
    {
      title: "Total Applicants",
      count: stats.total,
      icon: FiUsers,
      color: "blue",
      gradient: "from-blue-600 to-cyan-600",
      percentChange: calcChange(stats.total, previousStats?.total),
    },
    {
      title: "Approved",
      count: stats.approved,
      icon: FiThumbsUp,
      color: "green",
      gradient: "from-green-600 to-emerald-600",
      percentChange: calcChange(stats.approved, previousStats?.approved),
    },
    {
      title: "Declined",
      count: stats.declined,
      icon: FiThumbsDown,
      color: "red",
      gradient: "from-red-600 to-pink-600",
      percentChange: calcChange(stats.declined, previousStats?.declined),
    },
    {
      title: "Banned",
      count: stats.banned,
      icon: FiUserX,
      color: "rose",
      gradient: "from-rose-600 to-red-600",
      percentChange: calcChange(stats.banned, previousStats?.banned),
    },
    {
      title: "Leaving",
      count: stats.leaving_pending,
      icon: FiUserMinus,
      color: "amber",
      gradient: "from-amber-600 to-orange-600",
      percentChange: calcChange(stats.leaving_pending, previousStats?.leaving_pending),
    },
    {
      title: "Left",
      count: stats.left,
      icon: FiUserCheck,
      color: "gray",
      gradient: "from-gray-600 to-slate-600",
      percentChange: calcChange(stats.left, previousStats?.left),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse">
            Loading Statistics
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mt-4"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh]">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Admin Overview
          </h2>
          <p className="text-purple-300/70 mt-2">
            Monitor your organization's statistics and member status
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <StatCard
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                color={stat.color}
                gradient={stat.gradient}
                percentChange={stat.percentChange}
              />
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-black/40 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-purple-300">
                Quick Actions
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Manage your organization efficiently
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              onClick={() => window.location.href = '/admin-dashboard'}
            >
              View Dashboard
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}