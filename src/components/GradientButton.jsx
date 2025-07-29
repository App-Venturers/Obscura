export default function GradientButton({ children, onClick, from, to }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-${from} to-${to} text-white px-4 py-2 rounded font-medium shadow-md hover:opacity-90 transition`}
    >
      {children}
    </button>
  );
}
