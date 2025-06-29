// File: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // App contains all routing logic
import "./index.css";    // Tailwind or global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);