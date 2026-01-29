/* eslint-disable react/prop-types */
import React from "react";
import "./CommandeRow.css";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  MailCheck,
  AlertCircle,
} from "lucide-react";

const CommandeRow = ({
  commande,
  onViewDetails,
  onToggleVu,
  isSelected,
  onSelect,
}) => {
  // --- Formattage de la date ---
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- Calcul de l'urgence (Délai) ---
  const getDeadlineInfo = (dateEcheance) => {
    if (!dateEcheance) return null;
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { label: "Expiré", className: "cmd-row-deadline-expired" };
    if (diffDays <= 3)
      return {
        label: `${diffDays}j (Urgent)`,
        className: "cmd-row-deadline-urgent",
      };
    return { label: "", className: "cmd-row-deadline-normal" }; // Pas de badge si délai confortable
  };

  // --- Configuration des couleurs par Plateforme ---
  const getPlateformeConfig = (plateforme) => {
    const configs = {
      MEDITLINK: "cmd-row-plat-blue",
      ITERO: "cmd-row-plat-green",
      THREESHAPE: "cmd-row-plat-purple",
      DEXIS: "cmd-row-plat-orange",
      CSCONNECT: "cmd-row-plat-cyan",
      GOOGLE_DRIVE: "cmd-row-plat-red",
      MYSMILELAB: "cmd-row-plat-indigo",
    };
    return configs[plateforme] || "cmd-row-plat-gray";
  };

  // --- Configuration du Statut de la Commande (Workflow) ---
  const getWorkflowStatusConfig = (status) => {
    // Normalisation si le statut vient de l'enum Java (ex: EN_COURS)
    const normalizedStatus = status ? status.toUpperCase() : "EN_ATTENTE";

    switch (normalizedStatus) {
      case "TERMINEE":
        return { label: "Terminée", className: "cmd-row-status-completed" };
      case "EXPEDIEE":
        return { label: "Expédiée", className: "cmd-row-status-shipped" };
      case "EN_COURS":
        return { label: "En cours", className: "cmd-row-status-processing" };
      case "ANNULEE":
        return { label: "Annulée", className: "cmd-row-status-cancelled" };
      case "EN_ATTENTE":
      default:
        return { label: "En attente", className: "cmd-row-status-pending" };
    }
  };

  const deadlineInfo = getDeadlineInfo(commande.dateEcheance);
  const plateformeClass = getPlateformeConfig(commande.plateforme);
  const statusConfig = getWorkflowStatusConfig(commande.statut);

  // Vérification si une notification a été envoyée (soit global, soit commande spécifique)
  const isNotificationSent =
    commande.notification === true || commande.commandeNotification === true;

  return (
    <div
      className={`cmd-row-container ${!commande.vu ? "cmd-row-unread" : ""} ${isSelected ? "cmd-row-selected" : ""}`}
      onClick={() => onViewDetails(commande)}
    >
      {/* 1. Checkbox */}
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

      {/* 2. ID */}
      <div className="cmd-row-cell" data-label="ID">
        <span className="cmd-row-id-badge">
          #{commande.externalId ? commande.id : "N/A"}
        </span>
      </div>

      {/* 3. Patient */}
      <div className="cmd-row-cell" data-label="Patient">
        <div className="cmd-row-patient-wrapper">
          {!commande.vu && <span className="cmd-row-dot-unread"></span>}
          <span className="cmd-row-patient-text">
            {commande.refPatient || "Non spécifié"}
          </span>
        </div>
      </div>

      {/* 4. Cabinet */}
      <div className="cmd-row-cell" data-label="Cabinet">
        <span className="cmd-row-text-secondary">
          {commande.cabinet || "Non spécifié"}
        </span>
      </div>

      {/* 5. Plateforme */}
      <div className="cmd-row-cell" data-label="Plateforme">
        <span className={`cmd-row-badge ${plateformeClass}`}>
          {commande.plateforme === "THREESHAPE"
            ? "3Shape"
            : commande.plateforme}
        </span>
      </div>

      {/* 6. Réception */}
      <div className="cmd-row-cell" data-label="Réception">
        <div className="cmd-row-date-group">
          <Calendar size={14} />
          <span>{formatDate(commande.dateReception)}</span>
        </div>
      </div>

      {/* 7. Échéance (Date + Badge Urgence) */}
      <div className="cmd-row-cell" data-label="Échéance">
        <div className="cmd-row-column-flex">
          <div className="cmd-row-date-group">
            <Clock size={14} />
            <span>
              {commande.dateEcheance != null
                ? formatDate(commande.dateEcheance)
                : "---"}
            </span>
          </div>
          {deadlineInfo && deadlineInfo.label && (
            <span className={`cmd-row-mini-badge ${deadlineInfo.className}`}>
              {deadlineInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* 8. Statut & Notification (MODIFIÉ) */}
      <div className="cmd-row-cell" data-label="Statut">
        <div className="cmd-row-status-wrapper">
          <span className={`cmd-row-status-pill ${statusConfig.className}`}>
            {statusConfig.label}
          </span>

          {/* Indicateur de notification par mail */}
          {isNotificationSent && (
            <div
              className="cmd-row-notif-indicator"
              title="Notification email envoyée"
            >
              <MailCheck size={16} />
            </div>
          )}
          {/* Indicateur si pas de notif mais statut expédié (Warning) */}
          {!isNotificationSent && commande.statut === "EXPEDIEE" && (
            <div
              className="cmd-row-notif-warning"
              title="Aucune notification envoyée"
            >
              <AlertCircle size={16} />
            </div>
          )}
        </div>
      </div>

      {/* 9. Actions */}
      <div className="cmd-row-cell" data-label="Actions">
        <div className="cmd-row-actions-group">
          <button
            className={`cmd-row-action-btn ${commande.vu ? "cmd-row-btn-ghost" : "cmd-row-btn-active"}`}
            title={commande.vu ? "Marquer comme non lu" : "Marquer comme lu"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVu(commande);
            }}
          >
            {commande.vu ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandeRow);
