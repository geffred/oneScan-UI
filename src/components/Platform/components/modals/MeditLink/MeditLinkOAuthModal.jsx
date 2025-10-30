import React from "react";
import { X, Shield, CheckCircle } from "lucide-react";
import "./PlatformOAuthModal.css";

const MeditLinkOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-oauth-modal-overlay">
      <div className="platform-oauth-modal">
        <div className="platform-oauth-modal-header">
          <h2 className="platform-oauth-modal-header__title">
            Connexion MeditLink
          </h2>
          <button
            onClick={onClose}
            className="platform-oauth-modal-header__close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="platform-oauth-modal-content">
          <div className="platform-oauth-modal-info">
            <Shield size={40} className="platform-oauth-modal-info__icon" />
            <h3 className="platform-oauth-modal-info__title">
              Authentification sécurisée MeditLink
            </h3>
            <p className="platform-oauth-modal-info__description">
              Connectez-vous à votre compte MeditLink pour accéder à vos données
              et synchroniser vos informations.
            </p>
          </div>

          <div className="platform-oauth-modal-features">
            <h4 className="platform-oauth-modal-features__title">
              Accès aux fonctionnalités :
            </h4>
            <ul className="platform-oauth-modal-features__list">
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Consultation de vos données utilisateur
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Accès aux groupes et cas
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Gestion des fichiers
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Synchronisation automatique
              </li>
            </ul>
          </div>

          <div className="platform-oauth-modal-security">
            <p className="platform-oauth-modal-security__text">
              <strong>Sécurité :</strong> Cette connexion utilise le protocole
              OAuth 2.0 sécurisé. Vos identifiants ne seront jamais stockés sur
              nos serveurs.
            </p>
          </div>

          <div className="platform-oauth-modal-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-oauth-modal-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-oauth-modal-loading-spinner"></div>
                  Initialisation...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Se connecter avec MeditLink
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditLinkOAuthModal;
