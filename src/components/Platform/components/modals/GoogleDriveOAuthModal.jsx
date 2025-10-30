import React from "react";
import { X, Cloud, CheckCircle } from "lucide-react";
import "./GoogleDriveOAuthModal.css";

const GoogleDriveOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-googledrive-modal">
        <div className="platform-modal-header">
          <h2>Connexion Google Drive</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="platform-googledrive-auth-content">
          <div className="platform-googledrive-info">
            <Cloud size={48} />
            <h3>Authentification Google Drive</h3>
            <p>
              Connectez-vous à votre compte Google pour accéder à Google Drive
              et stocker vos fichiers de commandes.
            </p>
          </div>

          <div className="platform-googledrive-features">
            <h4>Fonctionnalités activées :</h4>
            <ul>
              <li>
                <CheckCircle size={16} /> Stockage sécurisé des fichiers STL
              </li>
              <li>
                <CheckCircle size={16} /> Organisation automatique par cabinet
              </li>
              <li>
                <CheckCircle size={16} /> Téléchargement direct des fichiers
              </li>
              <li>
                <CheckCircle size={16} /> Sauvegarde automatique en cloud
              </li>
            </ul>
          </div>

          <div className="platform-googledrive-security">
            <p>
              <strong>Sécurité :</strong> Cette connexion utilise le protocole
              OAuth 2.0 sécurisé de Google. Vos fichiers seront stockés dans
              votre propre compte Google Drive.
            </p>
          </div>

          <div className="platform-googledrive-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-googledrive-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-loading-spinner"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <Cloud size={18} />
                  Se connecter avec Google Drive
                </>
              )}
            </button>
          </div>
        </div>

        <div className="platform-modal-actions">
          <button onClick={onClose} className="platform-cancel-btn">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveOAuthModal;
