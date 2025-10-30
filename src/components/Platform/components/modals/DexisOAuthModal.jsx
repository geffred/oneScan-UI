import React from "react";
import { X, Shield, CheckCircle } from "lucide-react";
import "./DexisOAuthModal.css";

const DexisOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-dexis-modal">
        <div className="platform-modal-header">
          <h2>Connexion Dexis</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="platform-dexis-auth-content">
          <div className="platform-dexis-info">
            <Shield size={48} />
            <h3>Connexion à l'API Dexis</h3>
            <p>
              Connectez-vous à votre compte Dexis pour récupérer vos commandes
              et synchroniser vos données.
            </p>
          </div>

          <div className="platform-dexis-features">
            <h4>Accès aux fonctionnalités :</h4>
            <ul>
              <li>
                <CheckCircle size={16} /> Récupération des commandes Dexis
              </li>
              <li>
                <CheckCircle size={16} /> Consultation des cas patients
              </li>
              <li>
                <CheckCircle size={16} /> Téléchargement des fichiers
              </li>
              <li>
                <CheckCircle size={16} /> Synchronisation automatique
              </li>
            </ul>
          </div>

          <div className="platform-dexis-security">
            <p>
              <strong>Note :</strong> La connexion utilise l'API Dexis sécurisée
              pour récupérer vos données.
            </p>
          </div>

          <div className="platform-dexis-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-dexis-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-loading-spinner"></div>
                  Connexion...
                </>
              ) : (
                <>Se connecter à Dexis</>
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

export default DexisOAuthModal;
