import { motion } from "framer-motion";

const colorMap = {
  blue: {
    text: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900",
  },
  green: {
    text: "text-green-500 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900",
  },
  red: {
    text: "text-red-500 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900",
  },
  purple: {
    text: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900",
  },
  gray: {
    text: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
};

export default function StatCard({ title, count, icon: Icon, color = "blue", percentChange }) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
    >
      {Icon && (
        <div className={`${colors.text} ${colors.bg} p-2 rounded-full`}>
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
