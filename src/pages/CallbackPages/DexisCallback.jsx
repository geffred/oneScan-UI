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
  Activity,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./Callback.css"; // On réutilise le même CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DexisCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useContext(AuthContext);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Traitement de votre authentification DEXIS IS Connect..."
  );
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Références pour suivre l'état et empêcher les appels multiples
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const timeoutRef = useRef(null);

  const handleCallback = async (code, state = null, isRetry = false) => {
    // Éviter les appels multiples si déjà en cours, déjà réussi ou déjà redirigé
    if (
      isProcessingRef.current ||
      hasSucceededRef.current ||
      hasRedirectedRef.current
    ) {
      console.log("Appel DEXIS bloqué - déjà en cours, réussi ou redirigé");
      return;
    }

    isProcessingRef.current = true;

    try {
      const token = localStorage.getItem("token");
      // Note : L'URL correspond au endpoint du DexisController
      const url = `${API_BASE_URL}/dexis/callback?code=${encodeURIComponent(
        code
      )}${state ? `&state=${encodeURIComponent(state)}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Gestion spéciale du 401 transitoire
      if (response.status === 401) {
        if (retryCount < 3) {
          setMessage(`Tentative en cours... (${retryCount + 1}/3)`);
          setRetryCount((prev) => prev + 1);

          timeoutRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            handleCallback(code, state, true);
          }, 1000);
          return;
        } else {
          setStatus("error");
          setMessage("Impossible de finaliser l'authentification DEXIS (401).");
          isProcessingRef.current = false;
          return;
        }
      }

      if (response.ok) {
        const responseData = await response.json(); // On attend du JSON du backend DEXIS

        // Vérifier si la réponse contient un indicateur de succès
        if (responseData.success === true || response.status === 200) {
          // Marquer comme réussi pour empêcher tout autre appel
          hasSucceededRef.current = true;
          setStatus("success");
          setMessage(
            "Authentification DEXIS réussie ! Connexion établie avec succès."
          );

          //  notifier l’onglet parent si ouvert en popup
          if (window.opener) {
            window.opener.postMessage({ type: "DEXIS_AUTH_SUCCESS" }, "*");
            window.close(); // ferme l’onglet actuel
            return;
          }

          //  sinon, comportement normal (naviguer dans le même onglet)
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            timeoutRef.current = setTimeout(() => {
              navigate("/Dashboard/Platform", { replace: true });
            }, 3000);
          }

          // Vérifier le statut de connexion immédiatement pour mettre à jour l'UI
          try {
            const statusResponse = await fetch(
              `${API_BASE_URL}/api/dexis/auth/status`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
              }
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              setConnectionInfo({
                authenticated: statusData.authenticated,
                hasToken: statusData.authenticated, // Simplifié selon la réponse backend
                timestamp: new Date().toLocaleString(),
              });
            }
          } catch (statusError) {
            console.warn(
              "Erreur lors de la vérification du statut DEXIS:",
              statusError
            );
          }

          if (setAuthData) {
            setAuthData((prev) => ({
              ...prev,
              dexisAuthenticated: true,
              dexisConnectedAt: new Date().toISOString(),
            }));
          }

          // Planifier la redirection une seule fois
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            timeoutRef.current = setTimeout(() => {
              navigate("/Dashboard/Platform", { replace: true });
            }, 3000);
          }
        } else {
          throw new Error("Réponse inattendue du serveur DEXIS");
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Erreur HTTP ${response.status}: ${
            errorText || "Erreur d'authentification DEXIS"
          }`
        );
      }
    } catch (error) {
      console.error("Erreur lors du callback DEXIS:", error);
      setStatus("error");
      setMessage(`Erreur d'authentification DEXIS: ${error.message}`);
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
      setMessage("Nouvelle tentative d'authentification DEXIS...");
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
    navigate("/Dashboard/Platform", { replace: true });
  };

  const handleTestConnection = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/dexis/auth/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionInfo({
          ...data,
          lastChecked: new Date().toLocaleString(),
        });

        if (data.authenticated) {
          setMessage("Connexion DEXIS vérifiée avec succès !");
        } else {
          setMessage("Connexion DEXIS non active.");
        }
      }
    } catch (error) {
      console.error("Erreur lors du test de connexion DEXIS:", error);
      setMessage("Erreur lors de la vérification de la connexion.");
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const error = queryParams.get("error");
    const errorDescription = queryParams.get("error_description");

    // Ne rien faire si déjà réussi ou redirigé
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    if (error) {
      setStatus("error");
      setMessage(`Erreur OAuth DEXIS: ${errorDescription || error}`);
      return;
    }

    if (code) {
      console.log(
        "🔍 Code d'autorisation DEXIS détecté:",
        code.substring(0, 10) + "..."
      );
      handleCallback(code, state);
    } else {
      setStatus("error");
      setMessage("Code d'autorisation DEXIS manquant dans l'URL");
    }

    // Cleanup function pour nettoyer les timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
        return <Link2 size={48} />;
    }
  };

  return (
    <div className="callback-container">
      <div className={`callback-card ${status}`}>
        <div className="callback-header">
          <div className="callback-icon">{getStatusIcon()}</div>
          <h1>Authentification DEXIS</h1>
        </div>

        <div className="callback-content">
          <p className="callback-message">{message}</p>

          {connectionInfo && status === "success" && (
            <div className="callback-connection-info">
              <h3>Statut de la connexion</h3>
              <div className="connection-details">
                <p>
                  <strong>Authentifié:</strong>{" "}
                  <span
                    className={
                      connectionInfo.authenticated
                        ? "status-success"
                        : "status-error"
                    }
                  >
                    {connectionInfo.authenticated ? "Oui" : "Non"}
                  </span>
                </p>
                {connectionInfo.timestamp && (
                  <p>
                    <strong>Connecté le:</strong> {connectionInfo.timestamp}
                  </p>
                )}
                {connectionInfo.lastChecked && (
                  <p>
                    <strong>Dernière vérification:</strong>{" "}
                    {connectionInfo.lastChecked}
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
              <button onClick={handleTestConnection} className="btn secondary">
                <Activity size={18} />
                Tester la connexion
              </button>
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
          <Link2 size={14} /> Authentification sécurisée DEXIS IS Connect
        </p>
      </div>
    </div>
  );
};

export default DexisCallback;
