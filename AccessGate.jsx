// src/pages/AccessGate.jsx
import { useNavigate } from "react-router-dom";

export default function AccessGate() {
  const navigate = useNavigate();

  const handleChoice = (isRecruit) => {
    navigate(isRecruit ? "/recruitment" : "/admin-login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-purple-900 to-black flex items-center justify-center px-4">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-xl max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-purple-400 mb-4">Welcome to Obscura E-Sports</h1>
        <p className="mb-6 text-gray-300">
          Are you here to complete a recruitment application or access the admin panel?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => handleChoice(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded text-white font-semibold transition"
          >
            I'm being recruited
          </button>
          <button
            onClick={() => handleChoice(false)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-semibold transition"
          >
            Admin Access
          </button>
        </div>
      </div>
    </main>
  );
}
