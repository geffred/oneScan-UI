import React from "react";
import { X } from "lucide-react";
import MeditLinkDashboard from "../MeditLinkDashboard/MeditLinkDashboard";
import "./MeditLinkDashboardModal.css";

const MeditLinkDashboardModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-meditlink-dashboard-modal">
        <div className="platform-modal-header">
          <h2>Tableau de bord MeditLink</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>
        <div className="platform-modal-content">
          <MeditLinkDashboard />
        </div>
      </div>
    </div>
  );
};

export default MeditLinkDashboardModal;
