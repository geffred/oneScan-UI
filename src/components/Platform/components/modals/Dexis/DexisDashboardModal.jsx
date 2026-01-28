import React from "react";
import { X } from "lucide-react";
import DexisDashboard from "./DexisDashboard";
import "./DexisDashboardModal.css";

const DexisDashboardModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-dexis-dashboard-modal">
        <div className="platform-modal-header">
          <h2>Tableau de bord Dexis</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>
        <div className="platform-modal-content">
          <DexisDashboard />
        </div>
      </div>
    </div>
  );
};

export default DexisDashboardModal;
