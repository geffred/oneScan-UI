/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader, CheckCircle, AlertCircle, Link2 } from "lucide-react";
import "./Callback.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DexisCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Finalisation de la connexion DEXIS...",
  );

  // Refs pour éviter le double appel
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);

  const handleCallback = async (code, state) => {
    if (isProcessingRef.current || hasSucceededRef.current) {
      console.log("Appel DEXIS bloqué - déjà en cours ou réussi");
      return;
    }

    isProcessingRef.current = true;

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URL}/dexis/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;

      console.log("📡 Envoi callback DEXIS:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(" Réponse DEXIS:", response.status);

      if (response.ok) {
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage(" Connexion DEXIS réussie !");

        // Envoyer message au parent AVANT de fermer
        if (window.opener && !window.opener.closed) {
          console.log("📤 Envoi message au parent...");
          window.opener.postMessage(
            {
              type: "DEXIS_AUTH_SUCCESS",
              timestamp: Date.now(),
            },
            window.location.origin,
          );

          // Attendre un peu pour s'assurer que le message est reçu
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log(" Fermeture de la fenêtre popup...");
          window.close();
        } else {
          // Pas de popup parent - navigation normale
          console.log("🔄 Redirection vers dashboard...");
          setTimeout(() => {
            navigate("/dashboard/platform", { replace: true });
          }, 1500);
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Erreur DEXIS Callback:", error);
      setStatus("error");
      setMessage(`Échec de la connexion: ${error.message}`);
    } finally {
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const error = queryParams.get("error");

    if (hasSucceededRef.current) {
      console.log("DEXIS déjà traité avec succès");
      return;
    }

    if (error) {
      setStatus("error");
      setMessage(`Erreur OAuth: ${error}`);
      return;
    }

    if (code) {
      console.log("🔑 Code DEXIS détecté:", code.substring(0, 10) + "...");
      handleCallback(code, state);
    } else {
      setStatus("error");
      setMessage("Code d'autorisation DEXIS manquant");
    }
  }, [location.search]);

  return (
    <div className="callback-container">
      <div className={`callback-card ${status}`}>
        <div className="callback-icon">
          {status === "loading" && (
            <Loader className="animate-spin" size={48} color="#2563eb" />
          )}
          {status === "success" && <CheckCircle size={48} color="#16a34a" />}
          {status === "error" && <AlertCircle size={48} color="#dc2626" />}
        </div>
        <h1>Connexion DEXIS</h1>
        <p className="callback-message">{message}</p>
      </div>
      <div className="callback-footer">
        <Link2 size={14} /> Connexion sécurisée OAuth 2.0
      </div>
    </div>
  );
};

export default DexisCallback;
