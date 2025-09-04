import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";

const MeditLinkCallback = () => {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");
  const [countdown, setCountdown] = useState(5);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    handleCallback();
  }, [location]);

  useEffect(() => {
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

      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (error) {
        throw new Error("Erreur d'autorisation");
      }

      if (!code) {
        throw new Error("Code d'authentification manquant");
      }

      const params = new URLSearchParams();
      params.append("code", code);
      if (state) params.append("state", state);

      const response = await fetch("/api/meditlink/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Échec de l'authentification");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Échec de l'authentification");
      }

      setStatus("success");
      setMessage("Authentification MeditLink réussie !");
      setDetails("Redirection vers les plateformes...");
    } catch (err) {
      console.error("MeditLink callback error:", err);
      setStatus("error");
      setMessage("Échec de l'authentification MeditLink");
      setDetails(err.message);

      setTimeout(() => {
        navigate("/dashboard/Platform", {
          state: { error: "Authentification échouée: " + err.message },
        });
      }, 5000);
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
          <div className="meditlink-callback-status">
            {status === "processing" && (
              <Loader className="callback-icon processing" size={48} />
            )}
            {status === "success" && (
              <CheckCircle className="callback-icon success" size={48} />
            )}
            {status === "error" && (
              <AlertCircle className="callback-icon error" size={48} />
            )}

            <h2 className="meditlink-callback-title">{message}</h2>
            {details && <p className="meditlink-callback-details">{details}</p>}

            {status === "success" && (
              <div className="meditlink-callback-countdown">
                <span className="countdown-number">{countdown}</span>
                <p>Redirection automatique...</p>
              </div>
            )}

            {status === "processing" && (
              <div className="callback-processing-info">
                <p>Ne fermez pas cette page...</p>
              </div>
            )}
          </div>

          <div className="meditlink-callback-actions">
            {status === "error" && (
              <button
                onClick={() => navigate("/dashboard/Platform")}
                className="callback-btn"
              >
                Retour aux plateformes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditLinkCallback;
