import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ExternalLink } from "lucide-react";
import "./GoogleDriveCallback.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GoogleDriveCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const success = searchParams.get("success");

        console.log("🔍 Paramètres du callback Google Drive:", {
          code: code ? `${code.substring(0, 20)}...` : null,
          error,
          errorDescription,
          success,
          allParams: Object.fromEntries(searchParams.entries()),
        });

        // Si c'est une redirection depuis le backend après succès
        if (success === "true") {
          console.log("✅ Authentification Google Drive réussie (via backend)");
          setStatus("success");
          setMessage("Authentification Google Drive réussie !");

          setTimeout(() => {
            navigate("/platform", {
              replace: true,
              state: {
                driveAuth: "success",
                message: "Connexion Google Drive établie avec succès",
              },
            });
          }, 2000);
          return;
        }

        // Si c'est une erreur depuis le backend
        if (error) {
          console.error("❌ Erreur Google Drive:", error, errorDescription);
          setStatus("error");
          setMessage(`Erreur d'authentification: ${errorDescription || error}`);

          setTimeout(() => {
            navigate("/platform", {
              replace: true,
              state: {
                driveAuth: "error",
                errorMessage: errorDescription || error,
              },
            });
          }, 3000);
          return;
        }

        // Si nous avons un code directement de Google (premier appel)
        if (code) {
          console.log("🔄 Traitement du code d'autorisation Google Drive...");

          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `${API_BASE_URL}/drive/callback?code=${encodeURIComponent(code)}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              console.log(
                "✅ Authentification Google Drive réussie via callback"
              );
              setStatus("success");
              setMessage("Authentification Google Drive réussie !");

              // Rediriger vers la page des plateformes
              setTimeout(() => {
                navigate("/platform", {
                  replace: true,
                  state: {
                    driveAuth: "success",
                    message: "Connexion Google Drive établie avec succès",
                  },
                });
              }, 2000);
            } else {
              throw new Error(
                `Erreur ${response.status}: ${response.statusText}`
              );
            }
          } catch (fetchError) {
            console.error("❌ Erreur lors de l'échange du code:", fetchError);
            setStatus("error");
            setMessage("Erreur lors de la connexion à Google Drive");

            setTimeout(() => {
              navigate("/platform", {
                replace: true,
                state: {
                  driveAuth: "error",
                  errorMessage: fetchError.message,
                },
              });
            }, 3000);
          }
          return;
        }

        // Si aucun paramètre n'est présent
        console.log("ℹ️ Aucun paramètre de callback détecté");
        setStatus("error");
        setMessage("URL de callback invalide");

        setTimeout(() => {
          navigate("/platform", { replace: true });
        }, 2000);
      } catch (error) {
        console.error("❌ Erreur inattendue lors du callback:", error);
        setStatus("error");
        setMessage("Erreur inattendue lors de l'authentification");

        setTimeout(() => {
          navigate("/platform", {
            replace: true,
            state: {
              driveAuth: "error",
              errorMessage: error.message,
            },
          });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="google-drive-callback-container">
      <div className="callback-content">
        <div className="callback-header">
          <div className="callback-icon">
            {status === "loading" && (
              <Loader size={48} className="callback-spinner" />
            )}
            {status === "success" && (
              <CheckCircle size={48} className="callback-success" />
            )}
            {status === "error" && (
              <XCircle size={48} className="callback-error" />
            )}
          </div>

          <h1 className="callback-title">
            {status === "loading" && "Connexion à Google Drive..."}
            {status === "success" && "Connexion réussie !"}
            {status === "error" && "Erreur de connexion"}
          </h1>
        </div>

        <div className="callback-message">
          <p>{message}</p>

          {status === "loading" && (
            <div className="callback-loading-details">
              <p>Traitement de l'authentification en cours...</p>
              <p className="callback-note">
                Cette opération peut prendre quelques secondes.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="callback-success-details">
              <p>Votre compte Google Drive a été connecté avec succès.</p>
              <p>Vous allez être redirigé vers la page des plateformes.</p>
            </div>
          )}

          {status === "error" && (
            <div className="callback-error-actions">
              <div className="callback-buttons">
                <button
                  onClick={() => navigate("/platform")}
                  className="callback-primary-btn"
                >
                  Retour aux plateformes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informations de débogage */}
        {import.meta.env.MODE === "development" && (
          <div className="callback-debug-info">
            <h4>Informations de débogage :</h4>
            <pre>
              {JSON.stringify(
                Object.fromEntries(searchParams.entries()),
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div className="callback-footer">
          <div className="callback-security-info">
            <ExternalLink size={16} />
            <span>Authentification sécurisée via OAuth 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveCallback;
