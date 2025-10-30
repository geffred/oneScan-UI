import React from "react";
import { X } from "lucide-react";
import ThreeShapeDashboard from "../../ThreeShapeDashboard/ThreeShapeDashboard";
import "./ThreeShapeDashboardModal.css";

const ThreeShapeDashboardModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal platform-threeshape-dashboard-modal">
        <div className="platform-modal-header">
          <h2>Tableau de bord 3Shape</h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>
        <div className="platform-modal-content">
          <ThreeShapeDashboard />
        </div>
      </div>
    </div>
  );
};

export default ThreeShapeDashboardModal;
