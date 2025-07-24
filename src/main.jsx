// File: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ NOT './App.js' and NOT './app'

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
