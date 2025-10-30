import React from "react";
import { X, Cloud, CheckCircle } from "lucide-react";
import "./PlatformOAuthModal.css";

const GoogleDriveOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-oauth-modal-overlay">
      <div className="platform-oauth-modal">
        <div className="platform-oauth-modal-header">
          <h2 className="platform-oauth-modal-header__title">
            Connexion Google Drive
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
            <Cloud size={40} className="platform-oauth-modal-info__icon" />
            <h3 className="platform-oauth-modal-info__title">
              Authentification Google Drive
            </h3>
            <p className="platform-oauth-modal-info__description">
              Connectez-vous à votre compte Google pour accéder à Google Drive
              et stocker vos fichiers de commandes.
            </p>
          </div>

          <div className="platform-oauth-modal-features">
            <h4 className="platform-oauth-modal-features__title">
              Fonctionnalités activées :
            </h4>
            <ul className="platform-oauth-modal-features__list">
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Stockage sécurisé des fichiers STL
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Organisation automatique par cabinet
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Téléchargement direct des fichiers
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Sauvegarde automatique en cloud
              </li>
            </ul>
          </div>

          <div className="platform-oauth-modal-security">
            <p className="platform-oauth-modal-security__text">
              <strong>Sécurité :</strong> Cette connexion utilise le protocole
              OAuth 2.0 sécurisé de Google. Vos fichiers seront stockés dans
              votre propre compte Google Drive.
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
                <>
                  <Cloud size={16} />
                  Se connecter avec Google Drive
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveOAuthModal;
