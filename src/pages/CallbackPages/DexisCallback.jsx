/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Link2,
  CheckCircle,
  AlertCircle,
  Loader,
  Home,
  RefreshCw,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./Callback.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DexisCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useContext(AuthContext);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Finalisation de la connexion DEXIS...",
  );
  const [retryCount, setRetryCount] = useState(0);

  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);
  const timeoutRef = useRef(null);

  const handleCallback = async (code, state) => {
    if (isProcessingRef.current || hasSucceededRef.current) return;
    isProcessingRef.current = true;

    try {
      const token = localStorage.getItem("token");

      // Appel au backend pour échanger le code
      const url = `${API_BASE_URL}/dexis/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Gestion erreur 401 temporaire (re-essai)
      if (response.status === 401 && retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        timeoutRef.current = setTimeout(() => {
          isProcessingRef.current = false;
          handleCallback(code, state);
        }, 1500);
        return;
      }

      if (response.ok) {
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage("Connexion réussie ! Redirection en cours...");

        // Mise à jour du contexte Auth (Optionnel si géré via API status)
        if (setAuthData) {
          setAuthData((prev) => ({
            ...prev,
            dexisAuthenticated: true,
            dexisConnectedAt: new Date().toISOString(),
          }));
        }

        // --- REDIRECTION VERS LE DASHBOARD ---
        // On attend 1.5s pour que l'utilisateur voie le succès, puis on redirige
        timeoutRef.current = setTimeout(() => {
          // Si ouvert dans une popup, on la ferme et on rafraîchit le parent
          if (window.opener) {
            window.opener.postMessage({ type: "DEXIS_AUTH_SUCCESS" }, "*");
            window.close();
          } else {
            // Sinon redirection normale
            navigate("/dashboard/platform", { replace: true });
          }
        }, 1500);
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
      setMessage("L'authentification a été annulée ou a échoué.");
      return;
    }

    if (code) {
      handleCallback(code, state);
    } else {
      setStatus("error");
      setMessage("Code d'autorisation manquant.");
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.search]);

  // --- RENDER ---
  return (
    <div className="callback-container">
      <div className={`callback-card ${status}`}>
        <div className="callback-header">
          <div className="callback-icon">
            {status === "loading" && (
              <Loader className="animate-spin" size={48} />
            )}
            {status === "success" && (
              <CheckCircle className="text-green" size={48} />
            )}
            {status === "error" && (
              <AlertCircle className="text-red" size={48} />
            )}
          </div>
          <h1>Connexion DEXIS</h1>
        </div>

        <div className="callback-content">
          <p className="callback-message">{message}</p>

          {/* Barre de progression visuelle */}
          {status === "loading" && (
            <div className="callback-progress">
              <div className="progress-bar-animated"></div>
            </div>
          )}
        </div>

        {/* Actions en cas d'erreur ou succès manuel */}
        <div className="callback-actions">
          {status === "error" && (
            <button
              onClick={() => navigate("/dashboard/platform")}
              className="btn secondary"
            >
              <Home size={18} /> Retour aux plateformes
            </button>
          )}

          {status === "success" && (
            <button
              onClick={() => navigate("/dashboard/platform")}
              className="btn primary"
            >
              Aller au Dashboard maintenant
            </button>
          )}
        </div>
      </div>

      <div className="callback-footer">
        <p>
          <Link2 size={14} /> Connexion sécurisée via Dexis IS Connect
        </p>
      </div>
    </div>
  );
};

export default DexisCallback;
