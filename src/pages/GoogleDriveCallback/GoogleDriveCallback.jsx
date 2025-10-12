import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ExternalLink, Home } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GoogleDriveCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        const debugData = {
          url: window.location.href,
          params: {
            code: code ? `${code.substring(0, 25)}...` : "null",
            error: error || "null",
            errorDescription: errorDescription || "null",
          },
          timestamp: new Date().toISOString(),
        };

        setDebugInfo(JSON.stringify(debugData, null, 2));
        console.log("🔍 GoogleDriveCallback - Debug:", debugData);

        // Gestion des erreurs OAuth
        if (error) {
          console.error("❌ Erreur OAuth:", error, errorDescription);
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

        // Traitement du code
        if (code) {
          console.log("🔄 Échange du code...");
          setMessage("Échange du code d'autorisation...");

          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token d'authentification manquant");
          }

          // Échanger le code via le backend
          const response = await fetch(`${API_BASE_URL}/drive/exchange-code`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            console.log("✅ Authentification réussie");
            setStatus("success");
            setMessage("Authentification réussie !");

            // Notifier la fenêtre parent si elle existe
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(
                { type: "GOOGLE_DRIVE_AUTH_SUCCESS" },
                window.location.origin
              );

              // Fermer la popup
              setTimeout(() => window.close(), 1500);
            } else {
              // Rediriger si ce n'est pas une popup
              setTimeout(() => {
                navigate("/platform", {
                  replace: true,
                  state: {
                    driveAuth: "success",
                    message: "Connexion Google Drive établie",
                  },
                });
              }, 2000);
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de l'échange");
          }
          return;
        }

        // Aucun paramètre valide
        console.warn("⚠️ Paramètres manquants");
        setStatus("error");
        setMessage("Paramètres d'authentification manquants");

        setTimeout(() => {
          navigate("/platform", { replace: true });
        }, 2000);
      } catch (error) {
        console.error("💥 Erreur:", error);
        setStatus("error");
        setMessage("Erreur lors du traitement");

        // Notifier la fenêtre parent de l'erreur
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: "GOOGLE_DRIVE_AUTH_ERROR",
              error: error.message,
            },
            window.location.origin
          );
        }

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

  const handleManualRedirect = () => {
    navigate("/platform", { replace: true });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            {status === "loading" && (
              <Loader
                size={48}
                style={{
                  animation: "spin 1.5s linear infinite",
                  color: "#667eea",
                }}
              />
            )}
            {status === "success" && (
              <CheckCircle size={48} style={{ color: "#10b981" }} />
            )}
            {status === "error" && (
              <XCircle size={48} style={{ color: "#ef4444" }} />
            )}
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {status === "loading" && "Connexion à Google Drive"}
            {status === "success" && "Connexion réussie !"}
            {status === "error" && "Erreur de connexion"}
          </h1>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <p style={{ fontSize: "18px", color: "#4b5563", lineHeight: "1.6" }}>
            {message}
          </p>

          {status === "error" && (
            <div
              style={{
                marginTop: "25px",
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleManualRedirect}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Home size={18} />
                Retour aux plateformes
              </button>
              <button
                onClick={handleRetry}
                style={{
                  background: "#f8fafc",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🔄 Réessayer
              </button>
            </div>
          )}
        </div>

        <details style={{ marginTop: "30px", textAlign: "left" }}>
          <summary
            style={{
              cursor: "pointer",
              padding: "10px",
              background: "#f8fafc",
              borderRadius: "6px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Informations techniques
          </summary>
          <pre
            style={{
              marginTop: "15px",
              background: "#1e293b",
              color: "#e2e8f0",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "12px",
              overflow: "auto",
            }}
          >
            {debugInfo}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default GoogleDriveCallback;
