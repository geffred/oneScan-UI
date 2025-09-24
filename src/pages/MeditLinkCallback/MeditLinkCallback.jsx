import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  Home,
  RefreshCw,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./MeditLinkCallback.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MeditLinkCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useContext(AuthContext);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Traitement de votre authentification..."
  );
  const [userInfo, setUserInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Références pour suivre l'état et empêcher les appels multiples
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const timeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Fonction pour rafraîchir la session
  const refreshSession = useRef(async () => {
    try {
      await fetch(`${API_BASE_URL}/meditlink/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      console.log("Session rafraîchie ✅");
    } catch (e) {
      console.error("Erreur de rafraîchissement", e);
    }
  });

  useEffect(() => {
    // Démarrer le rafraîchissement automatique seulement après une authentification réussie
    if (status === "success" && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        refreshSession.current();
      }, 30 * 1000); // Toutes les 30 secondes
    }

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [status]);

  const handleCallback = async (code, state = null, isRetry = false) => {
    // Éviter les appels multiples si déjà en cours, déjà réussi ou déjà redirigé
    if (
      isProcessingRef.current ||
      hasSucceededRef.current ||
      hasRedirectedRef.current
    ) {
      console.log("Appel bloqué - déjà en cours, réussi ou redirigé");
      return;
    }

    isProcessingRef.current = true;

    try {
      const params = new URLSearchParams();
      params.append("code", code);

      if (state && state.trim() !== "" && state !== "null") {
        params.append("state", state);
      }

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: params.toString(),
      });

      // Gestion spéciale du 401 transitoire
      if (response.status === 401) {
        if (retryCount < 3) {
          setMessage(`Tentative en cours... (${retryCount + 1}/3)`);
          setRetryCount((prev) => prev + 1);

          // Utiliser une fonction anonyme pour éviter la récursion directe
          timeoutRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            handleCallback(code, state, true);
          }, 1000);
          return;
        } else {
          // Après 3 tentatives → on arrête la boucle
          setStatus("error");
          setMessage("Impossible de finaliser l'authentification (401).");
          isProcessingRef.current = false;
          return;
        }
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Marquer comme réussi pour empêcher tout autre appel
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage(
          `Authentification réussie ! Bienvenue ${
            data.user?.name || "utilisateur"
          }`
        );
        setUserInfo(data.user);

        if (setAuthData && data.user) {
          setAuthData({
            meditlinkUser: data.user,
            meditlinkAuthenticated: true,
          });
        }

        // Rafraîchir immédiatement la session après succès
        refreshSession.current();

        // Planifier la redirection une seule fois
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          timeoutRef.current = setTimeout(() => {
            navigate("/Dashboard/Platform", { replace: true });
          }, 3000);
        }
      } else {
        throw new Error(
          data.error || data.message || "Erreur d'authentification"
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Erreur d'authentification: ${error.message}`);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleRetry = () => {
    // Empêcher les nouvelles tentatives si déjà réussi ou redirigé
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (code) {
      setRetryCount(0); // Réinitialiser le compteur pour une nouvelle tentative manuelle
      setStatus("loading");
      setMessage("Nouvelle tentative...");
      handleCallback(code, state);
    } else {
      navigate("/Dashboard/Platform", { replace: true });
    }
  };

  const handleGoHome = () => {
    // Nettoyer les timeouts et rediriger immédiatement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    navigate("/Dashboard/Platform", { replace: true });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const error = queryParams.get("error");

    // Ne rien faire si déjà réussi ou redirigé
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    if (error) {
      setStatus("error");
      setMessage("Erreur lors de l'authentification OAuth");
      return;
    }

    if (code) {
      handleCallback(code, state);
    } else {
      setStatus("error");
      setMessage("Code d'autorisation manquant");
    }

    // Cleanup function pour nettoyer les timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [location.search]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader className="animate-spin" size={48} />;
      case "success":
        return <CheckCircle className="text-green" size={48} />;
      case "error":
        return <AlertCircle className="text-red" size={48} />;
      default:
        return <Shield size={48} />;
    }
  };

  return (
    <div className="callback-container">
      <div className={`callback-card ${status}`}>
        <div className="callback-header">
          <div className="callback-icon">{getStatusIcon()}</div>
          <h1>Authentification MeditLink</h1>
        </div>

        <div className="callback-content">
          <p className="callback-message">{message}</p>

          {userInfo && status === "success" && (
            <div className="callback-user-info">
              <h3>Informations utilisateur</h3>
              <div className="user-details">
                <p>
                  <strong>Nom:</strong> {userInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                {userInfo.group && (
                  <p>
                    <strong>Groupe:</strong> {userInfo.group.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="callback-progress">
              <div className="progress-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className="callback-actions">
          {status === "success" && (
            <div className="success-actions">
              <p>Redirection automatique...</p>
              <button onClick={handleGoHome} className="btn primary">
                <Home size={18} />
                Accéder aux plateformes
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="error-actions">
              <button onClick={handleRetry} className="btn retry">
                <RefreshCw size={18} />
                Réessayer
              </button>
              <button onClick={handleGoHome} className="btn secondary">
                <Home size={18} />
                Retour aux plateformes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="callback-footer">
        <p>
          <Shield size={14} /> Authentification sécurisée OAuth 2.0
        </p>
      </div>
    </div>
  );
};

export default MeditLinkCallback;
