/* eslint-disable react/prop-types */
import React from "react";
import { Calendar, Clock, Eye } from "lucide-react";

const CommandeRow = ({ commande, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEcheanceStatus = (dateEcheance) => {
    if (!dateEcheance)
      return { status: "unknown", label: "Non spécifiée", class: "gray" };

    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", label: "Échue", class: "red" };
    if (diffDays <= 3)
      return {
        status: "urgent",
        label: `${diffDays}j restant`,
        class: "yellow",
      };
    return {
      status: "normal",
      label: `${diffDays}j restant`,
      class: "green",
    };
  };

  const getPlateformeColor = (plateforme) => {
    const colors = {
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
      GOOGLE_DRIVE: "red",
    };
    return colors[plateforme] || "gray";
  };

  const echeanceStatus = getEcheanceStatus(commande.dateEcheance);
  const plateformeColor = getPlateformeColor(commande.plateforme);

  return (
    <div
      className={`commandes-table-row ${
        !commande.vu ? "commandes-row-unread" : ""
      }`}
      onClick={() => onViewDetails(commande)}
      style={{ cursor: "pointer" }}
    >
      <div className="commandes-table-cell" data-label="ID">
        <span className="commandes-external-id">
          #{commande.externalId ? commande.externalId.substring(0, 9) : "N/A"}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Patient">
        <div className="commandes-patient-info">
          {!commande.vu && <span className="commandes-unread-badge"></span>}
          <span className="commandes-patient-name">
            {commande.refPatient || "Non spécifié"}
          </span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Cabinet">
        <span className="commandes-cabinet-name">
          {commande.cabinet || "Non spécifié"}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Plateforme">
        <span
          className={`commandes-plateforme-badge commandes-plateforme-${plateformeColor}`}
        >
          {commande.plateforme === "THREESHAPE"
            ? "3Shape"
            : commande.plateforme === "GOOGLE_DRIVE"
            ? "Google Drive"
            : commande.plateforme}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Réception">
        <div className="commandes-date-info">
          <Calendar size={14} />
          <span>{formatDate(commande.dateReception)}</span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Échéance">
        <div className="commandes-date-info">
          <Clock size={14} />
          <span>
            {commande.dateEcheance != null
              ? formatDate(commande.dateEcheance)
              : "Non spécifiée"}
          </span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Statut">
        <span
          className={`commandes-status-badge commandes-status-${echeanceStatus.class}`}
        >
          {echeanceStatus.label}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Actions">
        <div className="commandes-actions">
          <button
            className={`commandes-action-btn ${
              !commande.vu ? "commandes-action-view" : ""
            }`}
            title="Voir les détails"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(commande);
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandeRow);
