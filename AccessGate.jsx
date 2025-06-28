// src/pages/AccessGate.jsx
import { useNavigate } from "react-router-dom";

export default function AccessGate() {
  const navigate = useNavigate();

  const handleChoice = (isRecruit) => {
    if (isRecruit) navigate("/recruitment");
    else navigate("/admin/login");
  };

  return (
    <div className="bg-gray-900 text-white p-6 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Welcome to Obscura E-Sports</h1>
      <p className="mb-6">Are you here to complete a recruitment application?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleChoice(true)}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
        >
          Yes, I'm being recruited
        </button>
        <button
          onClick={() => handleChoice(false)}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold"
        >
          No, Admin Access
        </button>
      </div>
    </div>
  );
}