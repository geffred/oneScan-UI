/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
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
import "./Callback.css";

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

  // Fonction pour rafraîchir la session MeditLink
  const refreshMeditLinkSession = useCallback(async () => {
    try {
      // IMPORTANT : Toujours envoyer le JWT principal
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/meditlink/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers,
      });
      console.log("Session MeditLink rafraîchie");
    } catch (e) {
      console.error("Erreur de rafraîchissement MeditLink", e);
    }
  }, []);

  useEffect(() => {
    // Démarrer le rafraîchissement automatique seulement après succès
    if (status === "success" && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        refreshMeditLinkSession();
      }, 30 * 1000); // Toutes les 30 secondes
    }

    // Nettoyer l'intervalle lors du démontage
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [status, refreshMeditLinkSession]);

  const handleCallback = useCallback(
    async (code, state = null) => {
      // Éviter les appels multiples
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
        // CRITIQUE : NE PAS TOUCHER AU JWT PRINCIPAL
        // Le JWT de l'utilisateur principal doit rester dans localStorage
        const mainToken = localStorage.getItem("token");

        if (!mainToken) {
          console.warn(
            "Aucun JWT principal trouvé - l'utilisateur doit se reconnecter"
          );
        }

        const params = new URLSearchParams();
        params.append("code", code);

        if (state && state.trim() !== "" && state !== "null") {
          params.append("state", state);
        }

        // IMPORTANT : Envoyer le JWT principal dans toutes les requêtes
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
        };

        if (mainToken) {
          headers["Authorization"] = `Bearer ${mainToken}`;
        }

        console.log("Envoi de la requête callback avec JWT principal");

        const response = await fetch(
          `${API_BASE_URL}/meditlink/auth/callback`,
          {
            method: "POST",
            headers,
            credentials: "include", // Pour les cookies MeditLink
            body: params.toString(),
          }
        );

        // Gestion des erreurs HTTP
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Marquer comme réussi
          hasSucceededRef.current = true;
          setStatus("success");
          setMessage(
            `Authentification réussie ! Bienvenue ${
              data.user?.name || "utilisateur"
            }`
          );
          setUserInfo(data.user);

          // Mettre à jour le contexte d'auth SANS toucher au JWT principal
          if (setAuthData && data.user) {
            setAuthData((prev) => ({
              ...prev, // Garder les données existantes
              meditlinkUser: data.user,
              meditlinkAuthenticated: true,
            }));
          }

          // Rafraîchir immédiatement la session MeditLink
          await refreshMeditLinkSession();

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
        console.error("Erreur lors du callback MeditLink:", error);
        setStatus("error");
        setMessage(`Erreur d'authentification: ${error.message}`);

        // Si c'est une erreur 500, suggérer de vérifier les logs backend
        if (error.message.includes("500")) {
          setMessage(
            "Erreur serveur (500). Vérifiez que votre JWT principal est valide."
          );
        }
      } finally {
        isProcessingRef.current = false;
      }
    },
    [navigate, setAuthData, refreshMeditLinkSession]
  );

  const handleRetry = useCallback(() => {
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (code) {
      setRetryCount((prev) => prev + 1);
      setStatus("loading");
      setMessage(`Nouvelle tentative (${retryCount + 1}/3)...`);
      handleCallback(code, state);
    } else {
      navigate("/Dashboard/Platform", { replace: true });
    }
  }, [location.search, retryCount, handleCallback, navigate]);

  const handleGoHome = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    navigate("/Dashboard/Platform", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const error = queryParams.get("error");

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

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [location.search, handleCallback]);

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
            <div className="callback-success-info">
              <div className="success-details">
                <CheckCircle size={20} className="text-green" />
                <div>
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

          {status === "error" && retryCount < 3 && (
            <div className="callback-error-info">
              <p className="error-subtext">Tentative {retryCount}/3</p>
            </div>
          )}
        </div>

        <div className="callback-actions">
          {status === "success" && (
            <div className="success-actions">
              <p>Redirection automatique dans 3 secondes...</p>
              <button onClick={handleGoHome} className="btn primary">
                <Home size={18} />
                Accéder maintenant
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="error-actions">
              {retryCount < 3 && (
                <button onClick={handleRetry} className="btn retry">
                  <RefreshCw size={18} />
                  Réessayer
                </button>
              )}
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
