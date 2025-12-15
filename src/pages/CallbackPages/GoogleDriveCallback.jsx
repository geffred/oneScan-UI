/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
import "./Callback.css";

// ⏱️ CONFIGURATION DES DÉLAIS (en millisecondes)
const DELAYS = {
  POPUP_SUCCESS_CLOSE: 2500, // 2.5 secondes - fermeture popup succès
  POPUP_ERROR_CLOSE: 3000, // 3 secondes - fermeture popup erreur
  WINDOW_SUCCESS_REDIRECT: 3000, // 3 secondes - redirection fenêtre succès
  WINDOW_ERROR_REDIRECT: 4000, // 4 secondes - redirection fenêtre erreur
  POST_MESSAGE_DELAY: 100, //  100ms avant d'envoyer le postMessage
};

const GoogleDriveCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Traitement de votre authentification Google Drive..."
  );
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  // Références pour éviter les appels multiples
  const isProcessingRef = useRef(false);
  const hasSucceededRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const timeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const postMessageSentRef = useRef(false);

  //  Fonction pour envoyer le postMessage de manière sécurisée
  const sendPostMessage = (messageData) => {
    if (window.opener && !window.opener.closed) {
      try {
        // Attendre un peu pour s'assurer que le parent est prêt
        setTimeout(() => {
          window.opener.postMessage(messageData, window.location.origin);
          console.log(" PostMessage envoyé:", messageData.type);
          postMessageSentRef.current = true;
        }, DELAYS.POST_MESSAGE_DELAY);
      } catch (error) {
        console.warn(" Impossible d'envoyer le postMessage:", error);
      }
    }
  };

  // Fonction pour démarrer le compte à rebours
  const startCountdown = (seconds) => {
    setCountdown(seconds);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCallback = async (success, error, errorDescription) => {
    // Éviter les appels multiples
    if (
      isProcessingRef.current ||
      hasSucceededRef.current ||
      hasRedirectedRef.current
    ) {
      console.log("⏭️ Appel bloqué - déjà en cours, réussi ou redirigé");
      return;
    }

    isProcessingRef.current = true;

    try {
      //  CAS 1 : Succès OAuth
      if (success === "true") {
        hasSucceededRef.current = true;
        setStatus("success");
        setMessage("Authentification Google Drive réussie ! Accès activé.");

        // Notifier la fenêtre parente si popup
        if (window.opener) {
          sendPostMessage({
            type: "GOOGLE_DRIVE_AUTH_SUCCESS",
            data: {
              authenticated: true,
              timestamp: Date.now(),
            },
            action: "refresh",
          });

          // Démarrer le compte à rebours
          const delay = DELAYS.POPUP_SUCCESS_CLOSE / 1000;
          startCountdown(delay);

          //  Fermer la popup après que le message ait été envoyé
          timeoutRef.current = setTimeout(() => {
            console.log("🔒 Fermeture de la popup de succès");
            window.close();
          }, DELAYS.POPUP_SUCCESS_CLOSE);
        } else {
          // Redirection dans la fenêtre principale
          hasRedirectedRef.current = true;

          const delay = DELAYS.WINDOW_SUCCESS_REDIRECT / 1000;
          startCountdown(delay);

          timeoutRef.current = setTimeout(() => {
            window.location.reload();
            navigate("/Dashboard/Platform", { replace: true });
          }, DELAYS.WINDOW_SUCCESS_REDIRECT);
        }
      }
      //  CAS 2 : Erreur OAuth
      else if (error) {
        setStatus("error");
        const errorMsg =
          errorDescription || error || "Erreur d'authentification";
        setMessage(`Erreur : ${errorMsg}`);

        // Notifier la fenêtre parente si popup
        if (window.opener) {
          sendPostMessage({
            type: "GOOGLE_DRIVE_AUTH_ERROR",
            error: errorMsg,
            action: "refresh",
          });

          const delay = DELAYS.POPUP_ERROR_CLOSE / 1000;
          startCountdown(delay);

          timeoutRef.current = setTimeout(() => {
            console.log(" Fermeture de la popup d'erreur");
            window.close();
          }, DELAYS.POPUP_ERROR_CLOSE);
        } else {
          const delay = DELAYS.WINDOW_ERROR_REDIRECT / 1000;
          startCountdown(delay);

          timeoutRef.current = setTimeout(() => {
            window.location.reload();
            navigate("/Dashboard/Platform", { replace: true });
          }, DELAYS.WINDOW_ERROR_REDIRECT);
        }
      }
      //  CAS 3 : Paramètres manquants
      else {
        throw new Error("Paramètres de callback manquants");
      }
    } catch (err) {
      setStatus("error");
      setMessage(`Erreur inattendue : ${err.message}`);

      if (window.opener) {
        sendPostMessage({
          type: "GOOGLE_DRIVE_AUTH_ERROR",
          error: err.message,
          action: "refresh",
        });
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
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (window.opener) {
      // Envoyer un dernier message avant fermeture
      if (!postMessageSentRef.current) {
        sendPostMessage({
          type: "GOOGLE_DRIVE_AUTH_COMPLETE",
          action: "refresh",
        });
      }
      window.close();
    } else {
      window.location.reload();
      navigate("/Dashboard/Platform", { replace: true });
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get("success");
    const error = queryParams.get("error");
    const errorDescription = queryParams.get("error_description");

    console.log("🔍 Callback détecté:", { success, error });

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
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
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
                  ? countdown !== null
                    ? `Fermeture automatique dans ${countdown}s...`
                    : "Cette fenêtre se fermera automatiquement..."
                  : countdown !== null
                  ? `Redirection dans ${countdown}s...`
                  : "Redirection automatique vers les plateformes..."}
              </p>
              <button onClick={handleGoHome} className="btn primary">
                <Home size={18} />
                {window.opener ? "Fermer maintenant" : "Accéder maintenant"}
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="error-actions">
              {countdown !== null && (
                <p className="countdown-text">
                  {window.opener
                    ? `Fermeture dans ${countdown}s...`
                    : `Redirection dans ${countdown}s...`}
                </p>
              )}
              {retryCount < 3 && (
                <button onClick={handleRetry} className="btn retry">
                  <RefreshCw size={18} />
                  Réessayer
                </button>
              )}
              <button onClick={handleGoHome} className="btn secondary">
                <Home size={18} />
                {window.opener ? "Fermer maintenant" : "Retour maintenant"}
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
