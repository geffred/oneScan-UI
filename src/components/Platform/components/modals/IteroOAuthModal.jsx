import React from "react";
import { X, Shield, CheckCircle } from "lucide-react";
import "./IteroOAuthModal.css";

const IteroOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-itero-modal">
        <div className="platform-modal-header">
          <h2>Connexion Itero</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="platform-itero-auth-content">
          <div className="platform-itero-info">
            <Shield size={48} />
            <h3>Connexion à l'API Itero</h3>
            <p>
              Connectez-vous à votre compte Itero pour récupérer vos commandes
              et synchroniser vos données.
            </p>
          </div>

          <div className="platform-itero-features">
            <h4>Accès aux fonctionnalités :</h4>
            <ul>
              <li>
                <CheckCircle size={16} /> Récupération des commandes Itero
              </li>
              <li>
                <CheckCircle size={16} /> Consultation des cas patients
              </li>
              <li>
                <CheckCircle size={16} /> Téléchargement des scans 3D
              </li>
              <li>
                <CheckCircle size={16} /> Synchronisation automatique
              </li>
            </ul>
          </div>

          <div className="platform-itero-security">
            <p>
              <strong>Note :</strong> La connexion utilise l'API Itero sécurisée
              pour récupérer vos données.
            </p>
          </div>

          <div className="platform-itero-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-itero-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-loading-spinner"></div>
                  Connexion...
                </>
              ) : (
                <>Se connecter à Itero</>
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

export default IteroOAuthModal;
