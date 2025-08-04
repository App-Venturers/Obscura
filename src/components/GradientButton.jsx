export default function GradientButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-700 hover:to-pink-700
        active:scale-95 px-6 py-3 rounded-lg text-white
        shadow-lg shadow-pink-500/30 hover:shadow-xl
        font-semibold text-center transition-transform duration-200 transform
        ${className}`}
    >
      {children}
    </button>
  );
}
