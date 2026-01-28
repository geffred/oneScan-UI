// src/pages/Platform/components/modals/Dexis/DexisDashboardModal.jsx
import React from "react";
import { X } from "lucide-react";
import DexisDashboard from "./DexisDashboard";
import "../PlatformOAuthModal.css";

const DexisDashboardModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-oauth-modal-overlay">
      <div
        className="platform-oauth-modal"
        style={{
          maxWidth: "1000px",
          width: "90%",
          position: "relative", // Nécessaire pour le positionnement absolu du bouton
          padding: 0, // On enlève le padding du conteneur pour laisser le Dashboard gérer l'espace
          overflow: "hidden",
        }}
      >
        {/* --- BOUTON DE FERMETURE (X) --- */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            zIndex: 50, // S'assure qu'il est au-dessus du contenu
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#6b7280", // Gris neutre
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "50%",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <X size={24} />
        </button>

        {/* --- CONTENU DU DASHBOARD --- */}
        <DexisDashboard />
      </div>
    </div>
  );
};

export default DexisDashboardModal;
