/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom"; // Si tu utilises React Router
import "./CookieConsent.css";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifie si le choix a déjà été fait dans le LocalStorage
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Petit délai pour l'animation d'entrée
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
    // Ici, tu peux initialiser tes scripts (Google Analytics, Pixel, etc.)
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cc-wrapper">
      <div className="cc-container">
        <div className="cc-content">
          <div className="cc-icon-box">
            <Cookie size={24} />
          </div>
          <div className="cc-text">
            <h3>Nous respectons votre vie privée</h3>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience et
              analyser notre trafic. Vous pouvez{" "}
              <Link to="/privacy-policy">en savoir plus ici</Link>.
            </p>
          </div>
        </div>
        <div className="cc-actions">
          <button onClick={handleDecline} className="cc-btn cc-btn-outline">
            Refuser
          </button>
          <button onClick={handleAccept} className="cc-btn cc-btn-primary">
            Accepter
          </button>
        </div>
        <button onClick={handleDecline} className="cc-close-mobile">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
