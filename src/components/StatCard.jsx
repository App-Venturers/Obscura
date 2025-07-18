import { motion } from "framer-motion";

export default function StatCard({ title, count, icon: Icon, color = "blue", percentChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
    >
      {Icon && (
        <div
          className={`text-${color}-500 dark:text-${color}-400 bg-${color}-100 dark:bg-${color}-900 p-2 rounded-full`}
        >
          <Icon className="text-xl" />
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
        {percentChange !== undefined && (
          <p
            className={`text-xs mt-1 font-medium ${
              percentChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {percentChange >= 0 ? "+" : ""}
            {percentChange}% vs last
          </p>
        )}
      </div>
    </motion.div>
  );
}