import React from "react";
import { X, Shield, CheckCircle } from "lucide-react";
import "../PlatformOAuthModal.css";

const DexisOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-oauth-modal-overlay">
      <div className="platform-oauth-modal">
        <div className="platform-oauth-modal-header">
          <h2 className="platform-oauth-modal-header__title">
            Connexion Dexis
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
              Connexion à l'API Dexis
            </h3>
            <p className="platform-oauth-modal-info__description">
              Connectez-vous à votre compte Dexis pour récupérer vos commandes
              et synchroniser vos données.
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
                Récupération des commandes Dexis
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Consultation des cas patients
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Téléchargement des fichiers
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
              <strong>Note :</strong> La connexion utilise l'API Dexis sécurisée
              pour récupérer vos données.
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
                  Connexion...
                </>
              ) : (
                "Se connecter à Dexis"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexisOAuthModal;
