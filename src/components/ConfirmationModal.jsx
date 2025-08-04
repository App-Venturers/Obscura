import React from "react";

export default function ConfirmationModal({ title, message, onConfirm, onCancel }) {
  const handleConfirm = async () => {
    await onConfirm();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 border border-purple-700 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <p className="text-gray-300 mb-5">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
