/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom"; // Si tu utilises React Router
import "./CookieConsent.css";

const CONSENT_KEY = "cookieConsent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Calcule l'attribut "domain" du cookie pour qu'il soit partagé entre le
// domaine apex et ses sous-domaines (ex: mysmilelab.be ET www.mysmilelab.be).
// Sur localhost / une IP, on n'ajoute pas de domaine (cookie host-only).
const getCookieDomain = () => {
  const host = window.location.hostname;
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return "";
  const parts = host.split(".");
  if (parts.length < 2) return "";
  // Garde les deux derniers segments (registrable domain), ex: mysmilelab.be
  const registrable = parts.slice(-2).join(".");
  return `; domain=.${registrable}`;
};

const readConsent = () => {
  // 1) Cookie (partagé entre sous-domaines, survit au nettoyage du localStorage)
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + CONSENT_KEY + "=([^;]*)")
  );
  if (match) return decodeURIComponent(match[1]);
  // 2) Repli sur le localStorage (compat. anciens visiteurs)
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

const persistConsent = (value) => {
  // Cookie longue durée, partagé entre sous-domaines
  document.cookie =
    `${CONSENT_KEY}=${encodeURIComponent(value)}` +
    `; max-age=${ONE_YEAR_SECONDS}; path=/` +
    getCookieDomain() +
    "; SameSite=Lax";
  // Et localStorage en miroir (lecture rapide / repli)
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // localStorage indisponible (navigation privée stricte) : le cookie suffit
  }
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifie si le choix a déjà été fait (cookie ou localStorage)
    const consent = readConsent();
    if (!consent) {
      // Petit délai pour l'animation d'entrée
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    persistConsent("accepted");
    setIsVisible(false);
    // Ici, tu peux initialiser tes scripts (Google Analytics, Pixel, etc.)
  };

  const handleDecline = () => {
    persistConsent("declined");
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
