import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = crypto?.randomUUID?.() || Date.now(); // Unique and future-safe
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`px-4 py-2 rounded shadow-md text-white transition-all duration-300 animate-fade-in
              ${
                toast.type === "success"
                  ? "bg-green-600"
                  : toast.type === "error"
                  ? "bg-red-600"
                  : toast.type === "warn"
                  ? "bg-yellow-600 text-black"
                  : "bg-gray-700"
              }
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
