/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Loader, CheckCircle, AlertCircle, Link2 } from "lucide-react";
import "./Callback.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DexisCallback = () => {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Finalisation de la connexion DEXIS...",
  );

  // Refs pour éviter le double appel (React 18 Strict Mode)
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);

  const handleCallback = async (code, state) => {
    if (isProcessingRef.current || hasSucceededRef.current) return;
    isProcessingRef.current = true;

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URL}/dexis/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage("Connexion réussie ! Fermeture de la fenêtre...");

        // --- LOGIQUE DE COMMUNICATION PARENT ---
        if (window.opener) {
          // 1. Envoyer le message de succès à la fenêtre parent
          // On utilise window.location.origin pour la sécurité (même domaine)
          window.opener.postMessage(
            { type: "DEXIS_AUTH_SUCCESS" },
            window.location.origin,
          );

          // 2. Fermer la fenêtre après un court délai visuel
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // Fallback : Si pas de parent (ex: ouvert dans un nouvel onglet), on redirige
          setMessage("Connexion réussie. Vous pouvez fermer cet onglet.");
          setTimeout(() => {
            window.location.href = "/dashboard/platform";
          }, 1500);
        }
      } else {
        throw new Error(`Erreur serveur (${response.status})`);
      }
    } catch (error) {
      console.error("Erreur Dexis Callback:", error);
      setStatus("error");
      setMessage("Échec de la connexion. Veuillez réessayer.");
    } finally {
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const error = queryParams.get("error");

    if (error) {
      setStatus("error");
      setMessage("L'authentification a échoué.");
      return;
    }

    if (code) {
      handleCallback(code, state);
    } else {
      setStatus("error");
      setMessage("Code d'autorisation manquant.");
    }
  }, [location.search]);

  return (
    <div
      className="callback-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div
        className={`callback-card ${status}`}
        style={{
          padding: "2rem",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="callback-icon"
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {status === "loading" && (
            <Loader className="animate-spin" size={48} color="#2563eb" />
          )}
          {status === "success" && (
            <CheckCircle className="text-green" size={48} color="#16a34a" />
          )}
          {status === "error" && (
            <AlertCircle className="text-red" size={48} color="#dc2626" />
          )}
        </div>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          Connexion DEXIS
        </h1>
        <p className="callback-message" style={{ color: "#4b5563" }}>
          {message}
        </p>
      </div>
      <div
        className="callback-footer"
        style={{
          marginTop: "2rem",
          color: "#9ca3af",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Link2 size={14} /> Connexion sécurisée
      </div>
    </div>
  );
};

export default DexisCallback;
