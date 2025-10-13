import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Cloud,
  CheckCircle,
  AlertCircle,
  Loader,
  Home,
  RefreshCw,
} from "lucide-react";
import "./GoogleDriveCallback.css";

const GoogleDriveCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Traitement de votre authentification Google Drive..."
  );
  const [retryCount, setRetryCount] = useState(0);

  // Références pour éviter les appels multiples
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const timeoutRef = useRef(null);

  const handleCallback = async (success, error, errorDescription) => {
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
      // Si succès OAuth
      if (success === "true") {
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage("Authentification Google Drive réussie ! Accès activé.");

        // Notifier la fenêtre parente si popup
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_DRIVE_AUTH_SUCCESS",
              data: { authenticated: true },
            },
            window.location.origin
          );

          // Fermer la popup après délai
          timeoutRef.current = setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // Redirection dans la fenêtre principale
          hasRedirectedRef.current = true;
          timeoutRef.current = setTimeout(() => {
            navigate("/Dashboard/Platform", { replace: true });
          }, 3000);
        }
      }
      // Si erreur OAuth
      else if (error) {
        setStatus("error");
        const errorMsg =
          errorDescription || error || "Erreur d'authentification";
        setMessage(`Erreur : ${errorMsg}`);

        // Notifier la fenêtre parente si popup
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_DRIVE_AUTH_ERROR",
              error: errorMsg,
            },
            window.location.origin
          );

          timeoutRef.current = setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
      // Paramètres manquants
      else {
        throw new Error("Paramètres de callback manquants");
      }
    } catch (err) {
      setStatus("error");
      setMessage(`Erreur inattendue : ${err.message}`);

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_DRIVE_AUTH_ERROR",
            error: err.message,
          },
          window.location.origin
        );
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleRetry = () => {
    // Empêcher les nouvelles tentatives si déjà réussi
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    setRetryCount((prev) => prev + 1);
    setStatus("loading");
    setMessage("Nouvelle tentative de connexion...");

    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get("success");
    const error = queryParams.get("error");
    const errorDescription = queryParams.get("error_description");

    if (success || error) {
      handleCallback(success, error, errorDescription);
    } else {
      navigate("/Dashboard/Platform", { replace: true });
    }
  };

  const handleGoHome = () => {
    // Nettoyer les timeouts et rediriger
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (window.opener) {
      window.close();
    } else {
      navigate("/Dashboard/Platform", { replace: true });
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get("success");
    const error = queryParams.get("error");
    const errorDescription = queryParams.get("error_description");

    // Ne rien faire si déjà réussi ou redirigé
    if (hasSucceededRef.current || hasRedirectedRef.current) {
      return;
    }

    if (success || error) {
      handleCallback(success, error, errorDescription);
    } else {
      setStatus("error");
      setMessage("Paramètres d'authentification manquants");
    }

    // Cleanup
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
        return <Cloud size={48} />;
    }
  };

  return (
    <div className="callback-container">
      <div className={`callback-card ${status}`}>
        <div className="callback-header">
          <div className="callback-icon">{getStatusIcon()}</div>
          <h1>Authentification Google Drive</h1>
        </div>

        <div className="callback-content">
          <p className="callback-message">{message}</p>

          {status === "success" && (
            <div className="callback-success-info">
              <div className="success-details">
                <CheckCircle size={20} className="text-green" />
                <div>
                  <p>
                    <strong>Accès Google Drive activé</strong>
                  </p>
                  <p className="success-subtext">
                    Vous pouvez maintenant uploader vos fichiers STL et ZIP
                  </p>
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
              <p className="error-subtext">
                Tentative {retryCount}/3 - Vous pouvez réessayer
              </p>
            </div>
          )}
        </div>

        <div className="callback-actions">
          {status === "success" && (
            <div className="success-actions">
              <p>
                {window.opener
                  ? "Cette fenêtre se fermera automatiquement..."
                  : "Redirection automatique vers les plateformes..."}
              </p>
              <button onClick={handleGoHome} className="btn primary">
                <Home size={18} />
                {window.opener ? "Fermer" : "Accéder aux plateformes"}
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
                {window.opener ? "Fermer" : "Retour aux plateformes"}
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="loading-info">
              <p className="loading-subtext">
                {window.opener
                  ? "Ne fermez pas cette fenêtre..."
                  : "Veuillez patienter..."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="callback-footer">
        <p>
          <Cloud size={14} /> Authentification sécurisée OAuth 2.0
        </p>
      </div>
    </div>
  );
};

export default GoogleDriveCallback;
