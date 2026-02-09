/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import "./CommandeRow.css";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Printer,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CommandeRow = ({
  commande,
  onViewDetails,
  onToggleVu,
  isSelected,
  onSelect,
  onPrintCertificat,
  hasCertificat: externalHasCertificat, // Reçu du parent
}) => {
  const [localVu, setLocalVu] = useState(commande.vu);
  const [hasCertificat, setHasCertificat] = useState(
    externalHasCertificat || false,
  );

  // Sync avec les props
  useEffect(() => {
    setLocalVu(commande.vu);
  }, [commande.vu]);

  useEffect(() => {
    setHasCertificat(externalHasCertificat || false);
  }, [externalHasCertificat]);

  const handleToggleVu = async (e) => {
    e.stopPropagation();

    // Mise à jour optimiste immédiate
    const newVuState = !localVu;
    setLocalVu(newVuState);

    // Puis appel au parent pour la mise à jour serveur
    try {
      await onToggleVu(commande);
    } catch (error) {
      // En cas d'erreur, on revient à l'état précédent
      setLocalVu(!newVuState);
    }
  };

  const getPlateformeConfig = (p) => {
    const configs = {
      MEDITLINK: "cmd-row-plat-blue",
      ITERO: "cmd-row-plat-green",
      THREESHAPE: "cmd-row-plat-purple",
      DEXIS: "cmd-row-plat-orange",
    };
    return configs[p] || "cmd-row-plat-gray";
  };

  return (
    <div
      className={`cmd-row-container ${!localVu ? "cmd-row-unread" : ""} ${isSelected ? "cmd-row-selected" : ""}`}
      onClick={() => onViewDetails(commande)}
    >
      <div
        className="cmd-row-cell cmd-row-checkbox-area"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? (
          <CheckSquare size={18} className="cmd-row-icon-primary" />
        ) : (
          <Square size={18} className="cmd-row-icon-gray" />
        )}
      </div>
      <div className="cmd-row-cell">#{commande.id}</div>
      <div className="cmd-row-cell">
        <span className="cmd-row-patient-text">
          {commande.refPatient || "N/A"}
        </span>
      </div>
      <div className="cmd-row-cell">{commande.cabinet || "---"}</div>
      <div className="cmd-row-cell">
        <span
          className={`cmd-row-badge ${getPlateformeConfig(commande.plateforme)}`}
        >
          {commande.plateforme}
        </span>
      </div>
      <div className="cmd-row-cell">
        <Calendar size={14} />{" "}
        {new Date(commande.dateReception).toLocaleDateString("fr-FR")}
      </div>
      <div className="cmd-row-cell">
        <Clock size={14} />{" "}
        {commande.dateEcheance
          ? new Date(commande.dateEcheance).toLocaleDateString("fr-FR")
          : "---"}
      </div>
      <div className="cmd-row-cell">
        <span className="cmd-row-status-pill">{commande.statut}</span>
      </div>
      <div className="cmd-row-cell">
        <div className="cmd-row-actions-group">
          {hasCertificat && (
            <button
              className="cmd-row-action-btn print-active"
              title="Imprimer"
              onClick={(e) => {
                e.stopPropagation();
                onPrintCertificat(commande);
              }}
            >
              <Printer size={16} color="#10b981" />
            </button>
          )}
          <button className="cmd-row-action-btn" onClick={handleToggleVu}>
            {localVu ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandeRow);
