import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
