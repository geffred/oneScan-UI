import React from "react";
import { X, Link2, CheckCircle } from "lucide-react";
import "./ThreeShapeOAuthModal.css";

const ThreeShapeOAuthModal = ({ isOpen, onClose, onStartAuth, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-dashboard-modal">
        <div className="platform-modal-header">
          <h2>Connexion 3Shape</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="platform-dashboard-auth-content">
          <div className="platform-dashboard-info">
            <Link2 size={48} />
            <h3>Authentification 3Shape OAuth</h3>
            <p>
              Connectez-vous à votre compte 3Shape pour accéder à vos cas et
              synchroniser vos données.
            </p>
          </div>

          <div className="platform-dashboard-features">
            <h4>Accès aux fonctionnalités :</h4>
            <ul>
              <li>
                <CheckCircle size={16} /> Consultation de vos cas
              </li>
              <li>
                <CheckCircle size={16} /> Téléchargement des fichiers STL
              </li>
              <li>
                <CheckCircle size={16} /> Gestion des connexions
              </li>
              <li>
                <CheckCircle size={16} /> Sauvegarde automatique en base
              </li>
            </ul>
          </div>

          <div className="platform-dashboard-security">
            <p>
              <strong>Note :</strong> Une nouvelle fenêtre s'ouvrira pour
              l'authentification. Après connexion, vous serez redirigé
              automatiquement.
            </p>
          </div>

          <div className="platform-dashboard-actions">
            <button
              onClick={onStartAuth}
              disabled={isLoading}
              className="platform-dashboard-connect-btn"
            >
              {isLoading ? (
                <>
                  <div className="platform-loading-spinner"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <Link2 size={18} />
                  Se connecter avec 3Shape
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

export default ThreeShapeOAuthModal;
