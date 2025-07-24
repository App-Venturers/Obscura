// File: src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import ThemeProvider from "./context/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css"; // Tailwind + custom styles

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ToastProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </ToastProvider>
  </React.StrictMode>
);
