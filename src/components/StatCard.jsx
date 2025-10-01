import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StatCard({ title, count, icon: Icon, color = "blue", gradient, percentChange }) {
  const [displayCount, setDisplayCount] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 20;
    const increment = count / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count]);

  // Gradient color mappings for icons and backgrounds
  const gradients = {
    blue: "from-blue-600 to-cyan-600",
    green: "from-green-600 to-emerald-600",
    red: "from-red-600 to-pink-600",
    rose: "from-rose-600 to-red-600",
    amber: "from-amber-600 to-orange-600",
    gray: "from-gray-600 to-slate-600",
  };

  const glowColors = {
    blue: "shadow-blue-500/20",
    green: "shadow-green-500/20",
    red: "shadow-red-500/20",
    rose: "shadow-rose-500/20",
    amber: "shadow-amber-500/20",
    gray: "shadow-gray-500/20",
  };

  const selectedGradient = gradient || gradients[color] || gradients.blue;
  const selectedGlow = glowColors[color] || glowColors.blue;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-purple-600/40 transition-all duration-300 ${selectedGlow}`}
    >
      {/* Gradient overlay for hover effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-xs text-purple-300/70 font-medium uppercase tracking-wide mb-1">
            {title}
          </p>

          {/* Count with animation */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-black text-white mb-2"
          >
            {displayCount.toLocaleString()}
          </motion.p>

          {/* Percentage change indicator */}
          {percentChange !== undefined && percentChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-1"
            >
              <span
                className={`text-xs font-semibold ${
                  percentChange >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {percentChange >= 0 ? "↑" : "↓"}
                {Math.abs(percentChange)}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </motion.div>
          )}
        </div>

        {/* Icon with gradient background */}
        {Icon && (
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-3 bg-gradient-to-br ${selectedGradient} rounded-lg shadow-lg`}
          >
            <Icon className="text-2xl text-white" />
          </motion.div>
        )}
      </div>

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedGradient} rounded-b-xl opacity-50`} />
    </motion.div>
  );
}