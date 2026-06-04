import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./main.css";
import { AuthProvider } from "./components/Config/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
