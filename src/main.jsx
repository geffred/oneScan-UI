import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./main.css";
import { AuthProvider } from "./components/Config/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
