import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./MeditLinkCallback.css";

const MeditLinkCallback = () => {
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Gérer le callback même si l'état d'authentification est incertain
    const urlParams = new URLSearchParams(location.search);
    const hasOAuthParams = urlParams.get("code") && urlParams.get("state");

    if (!isAuthenticated && !hasOAuthParams) {
      // Seulement rediriger vers login s'il n'y a pas de paramètres OAuth
      navigate("/login");
      return;
    }

    if (hasOAuthParams) {
      // Traiter le callback même si isAuthenticated est false temporairement
      handleCallback();
    } else if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, location, navigate]);

  useEffect(() => {
    // Démarrer le countdown seulement si on est en succès
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          navigate("/dashboard/Platform");
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, countdown, navigate]);

  const handleCallback = async () => {
    try {
      setStatus("processing");
      setMessage("Traitement de l'authentification MeditLink...");

      // Extraire les paramètres de l'URL
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      // Gestion des erreurs OAuth
      if (error) {
        throw new Error(errorDescription || `Erreur d'autorisation: ${error}`);
      }

      // Vérification des paramètres requis
      if (!code || !state) {
        throw new Error("Paramètres d'authentification manquants dans l'URL");
      }

      console.log(
        "Processing MeditLink callback with code:",
        code.substring(0, 10) + "..."
      );

      // Envoi du code au backend pour échange contre un token
      const response = await fetch("/api/meditlink/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: `code=${encodeURIComponent(code)}&state=${encodeURIComponent(
          state
        )}`,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Erreur serveur: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Échec de l'authentification");
      }

      // Succès - récupération des infos utilisateur
      setUserInfo(data.user);
      setStatus("success");
      setMessage("Authentification MeditLink réussie !");
      setDetails(
        `Bienvenue ${data.user?.name || "utilisateur"}. Redirection en cours...`
      );

      console.log(
        "MeditLink authentication successful for user:",
        data.user?.email
      );
    } catch (err) {
      console.error("MeditLink callback error:", err);
      setStatus("error");
      setMessage("Échec de l'authentification MeditLink");
      setDetails(err.message);

      // Redirection automatique vers la page des plateformes après 10 secondes en cas d'erreur
      setTimeout(() => {
        navigate("/dashboard/Platform", {
          state: {
            error: "Authentification MeditLink échouée: " + err.message,
          },
        });
      }, 10000);
    }
  };

  const handleManualRedirect = () => {
    navigate("/dashboard/Platform");
  };

  const renderStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader className="callback-icon processing" size={48} />;
      case "success":
        return <CheckCircle className="callback-icon success" size={48} />;
      case "error":
        return <AlertCircle className="callback-icon error" size={48} />;
      default:
        return <Shield className="callback-icon" size={48} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "blue";
      case "success":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="meditlink-callback-wrapper">
      <div className="meditlink-callback-container">
        <div className={`meditlink-callback-card ${getStatusColor()}`}>
          {/* Header with logo/icon */}
          <div className="meditlink-callback-header">
            <div className="meditlink-callback-logo">
              <Shield size={32} />
              <span>MeditLink OAuth</span>
            </div>
          </div>

          {/* Status section */}
          <div className="meditlink-callback-status">
            {renderStatusIcon()}

            <h2 className="meditlink-callback-title">{message}</h2>

            {details && <p className="meditlink-callback-details">{details}</p>}

            {/* User info display */}
            {userInfo && status === "success" && (
              <div className="meditlink-callback-user-info">
                <div className="user-avatar">
                  {userInfo.profileImage?.url ? (
                    <img
                      src={userInfo.profileImage.url}
                      alt="Profile"
                      className="user-avatar-img"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {userInfo.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h3>{userInfo.name}</h3>
                  <p>{userInfo.email}</p>
                  {userInfo.group && (
                    <span className="user-group">{userInfo.group.name}</span>
                  )}
                </div>
              </div>
            )}

            {/* Countdown for success */}
            {status === "success" && (
              <div className="meditlink-callback-countdown">
                <div className="countdown-circle">
                  <span className="countdown-number">{countdown}</span>
                </div>
                <p>
                  Redirection automatique dans {countdown} seconde
                  {countdown > 1 ? "s" : ""}...
                </p>
              </div>
            )}

            {/* Loading animation for processing */}
            {status === "processing" && (
              <div className="meditlink-callback-loading">
                <div className="loading-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <p>Veuillez patienter...</p>
              </div>
            )}

            {/* Error details */}
            {status === "error" && (
              <div className="meditlink-callback-error-details">
                <div className="error-help">
                  <h4>Que faire maintenant ?</h4>
                  <ul>
                    <li>Vérifiez votre connexion internet</li>
                    <li>
                      Réessayez l'authentification depuis la page des
                      plateformes
                    </li>
                    <li>Contactez le support si le problème persiste</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="meditlink-callback-actions">
            {status === "success" ? (
              <button
                onClick={handleManualRedirect}
                className="callback-btn primary"
              >
                <CheckCircle size={18} />
                Continuer maintenant
              </button>
            ) : status === "error" ? (
              <>
                <button
                  onClick={handleManualRedirect}
                  className="callback-btn secondary"
                >
                  Retour aux plateformes
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="callback-btn primary"
                >
                  Réessayer
                </button>
              </>
            ) : (
              <div className="callback-processing-info">
                <p>Traitement en cours, merci de ne pas fermer cette page...</p>
              </div>
            )}
          </div>

          {/* Footer with security info */}
          <div className="meditlink-callback-footer">
            <div className="security-note">
              <Shield size={14} />
              <span>Connexion sécurisée via OAuth 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditLinkCallback;
