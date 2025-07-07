// File: src/components/StatCard.jsx
export default function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow rounded p-4 text-center transition-colors duration-300">
      <div className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</div>
    </div>
  );
}
