import React from "react";
import { X, Shield, CheckCircle } from "lucide-react";
import "./MeditLinkOAuthModal.css";

const MeditLinkOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-meditlink-modal">
        <div className="platform-modal-header">
          <h2>Connexion MeditLink OAuth</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="platform-meditlink-auth-content">
          <div className="platform-meditlink-info">
            <Shield size={48} />
            <h3>Authentification sécurisée MeditLink</h3>
            <p>
              Connectez-vous à votre compte MeditLink pour accéder à vos données
              et synchroniser vos informations.
            </p>
          </div>

          <div className="platform-meditlink-features">
            <h4>Accès aux fonctionnalités :</h4>
            <ul>
              <li>
                <CheckCircle size={16} /> Consultation de vos données
                utilisateur
              </li>
              <li>
                <CheckCircle size={16} /> Accès aux groupes et cas
              </li>
              <li>
                <CheckCircle size={16} /> Gestion des fichiers
              </li>
              <li>
                <CheckCircle size={16} /> Synchronisation automatique
              </li>
            </ul>
          </div>

          <div className="platform-meditlink-security">
            <p>
              <strong>Sécurité :</strong> Cette connexion utilise le protocole
              OAuth 2.0 sécurisé. Vos identifiants ne seront jamais stockés sur
              nos serveurs.
            </p>
          </div>

          <div className="platform-meditlink-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-meditlink-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-loading-spinner"></div>
                  Initialisation...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Se connecter avec MeditLink
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

export default MeditLinkOAuthModal;
