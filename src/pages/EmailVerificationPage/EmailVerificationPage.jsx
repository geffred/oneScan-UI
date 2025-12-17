import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./EmailVerificationPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Récupérer les données du cabinet depuis la navigation
  const { email, cabinetData } = location.state || {};

  useEffect(() => {
    if (!email || !cabinetData) {
      navigate("/cabinet/register");
    }
  }, [email, cabinetData, navigate]);

  // Compte à rebours
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setErrorMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex].focus();

    if (pastedData.length === 6) {
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (codeToVerify) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/cabinet/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToVerify || code.join(""),
          cabinetData: cabinetData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Code de vérification invalide");
      }

      const data = await response.json();
      console.log("Vérification réussie:", data);

      // Stocker le token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "cabinet");

      // Redirection immédiate vers la page de login avec l'ancre
      // Note : On utilise window.location.hash pour forcer l'ancre si navigate ne le gère pas directement selon la version de router
      navigate("/login");
      setTimeout(() => {
        window.location.hash = "header-login";
      }, 0);
    } catch (error) {
      console.error("Erreur vérification:", error);
      setErrorMessage(error.message);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/cabinet/register/resend-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            nom: cabinetData.nom,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du renvoi du code");
      }

      setCountdown(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (error) {
      console.error("Erreur renvoi code:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="verification-wrapper">
        <div className="verification-card">
          <button
            onClick={() => navigate("/cabinet/register")}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Retour à l'inscription
          </button>

          <div className="verification-header">
            <div className="icon-wrapper">
              <Mail size={32} strokeWidth={2.5} />
            </div>
            <h1 className="verification-title">Vérifiez votre email</h1>
            <p className="verification-subtitle">
              Un code de sécurité à 6 chiffres a été envoyé à l'adresse
              <span className="verification-email">{email}</span>
            </p>
          </div>

          {errorMessage && (
            <div className="error-alert">
              <AlertCircle size={20} />
              {errorMessage}
            </div>
          )}

          <div className="code-input-container">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : null}
                className="code-input"
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerifyCode()}
            disabled={isLoading || code.some((digit) => digit === "")}
            className="verify-button"
          >
            {isLoading ? (
              <span>Vérification en cours...</span>
            ) : (
              <>
                Vérifier le code
                <CheckCircle size={20} />
              </>
            )}
          </button>

          <div className="resend-section">
            {canResend ? (
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="resend-button"
              >
                <RefreshCw size={18} />
                Renvoyer un nouveau code
              </button>
            ) : (
              <p className="countdown-text">
                Renvoyer le code dans {countdown}s
              </p>
            )}
          </div>

          <div className="verification-tips">
            <p className="tips-title">
              <Lightbulb size={18} className="text-blue-500" />
              Conseils utiles
            </p>
            <ul>
              <li>Vérifiez votre dossier spam ou courriers indésirables</li>
              <li>Le code expire automatiquement après 15 minutes</li>
              <li>Vous pouvez coller le code complet dans la première case</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmailVerificationPage;
