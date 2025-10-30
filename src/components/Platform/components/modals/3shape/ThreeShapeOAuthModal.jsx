import React from "react";
import { X, Link2, CheckCircle } from "lucide-react";
import "./PlatformOAuthModal.css";

const ThreeShapeOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-oauth-modal-overlay">
      <div className="platform-oauth-modal">
        <div className="platform-oauth-modal-header">
          <h2 className="platform-oauth-modal-header__title">
            Connexion 3Shape
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
            <Link2 size={40} className="platform-oauth-modal-info__icon" />
            <h3 className="platform-oauth-modal-info__title">
              Authentification 3Shape OAuth
            </h3>
            <p className="platform-oauth-modal-info__description">
              Connectez-vous à votre compte 3Shape pour accéder à vos cas et
              synchroniser vos données.
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
                Consultation de vos cas
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Téléchargement des fichiers STL
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Gestion des connexions
              </li>
              <li className="platform-oauth-modal-features__item">
                <CheckCircle
                  size={14}
                  className="platform-oauth-modal-features__item-icon"
                />
                Sauvegarde automatique en base
              </li>
            </ul>
          </div>

          <div className="platform-oauth-modal-security">
            <p className="platform-oauth-modal-security__text">
              <strong>Note :</strong> Une nouvelle fenêtre s'ouvrira pour
              l'authentification. Après connexion, vous serez redirigé
              automatiquement.
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
                  <Link2 size={16} />
                  Se connecter avec 3Shape
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeShapeOAuthModal;
