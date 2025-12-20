/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";

const CommandeRow = ({
  commande,
  onViewDetails,
  onToggleVu,
  onUpdateStatus,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(commande.id, newStatus);
    }
    setShowMenu(false);
  };

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
      CSCONNECT: "cyan",
      GOOGLE_DRIVE: "red",
    };
    return colors[plateforme] || "gray";
  };

  const getPlatformDisplayName = (platformName) => {
    switch (platformName) {
      case "THREESHAPE":
        return "3Shape";
      case "GOOGLE_DRIVE":
        return "Google Drive";
      case "CSCONNECT":
        return "CS Connect";
      default:
        return platformName;
    }
  };

  // --- LOGIQUE DES BORDURES ---
  const getRowBorderClass = () => {
    if (commande.statut === "ANNULEE") return "commandes-row-cancelled";
    if (commande.statut === "TERMINEE") return "commandes-row-completed";
    if (!commande.vu) return "commandes-row-unread"; // Fallback sur non lu si pas de statut critique
    return "";
  };

  const echeanceStatus = getEcheanceStatus(commande.dateEcheance);
  const plateformeColor = getPlateformeColor(commande.plateforme);
  const platformDisplayName = getPlatformDisplayName(commande.plateforme);
  const rowBorderClass = getRowBorderClass();

  return (
    <div
      className={`commandes-table-row ${rowBorderClass}`}
      onClick={() => onViewDetails(commande)}
      style={{ cursor: "pointer" }}
    >
      <div className="commandes-table-cell" data-label="ID">
        <span className="commandes-external-id">
          #{commande.externalId ? commande.id : "N/A"}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Patient">
        <div className="commandes-patient-info">
          {/* On affiche le point bleu seulement si ce n'est pas annulé/terminé pour ne pas surcharger */}
          {!commande.vu &&
            commande.statut !== "ANNULEE" &&
            commande.statut !== "TERMINEE" && (
              <span className="commandes-unread-badge"></span>
            )}
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
          {platformDisplayName}
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
          {/* Bouton Oeil */}
          <button
            className={
              "commandes-action-btn" +
              (commande.vu ? " .commandes-btn-white" : " commandes-btn-blue")
            }
            title={commande.vu ? "Marquer comme non lu" : "Marquer comme lu"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVu(commande);
            }}
          >
            {commande.vu ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Bouton Menu (3 points) */}
          <div
            className="commandes-menu-container"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="commandes-action-btn commandes-btn-ghost"
              onClick={() => setShowMenu(!showMenu)}
              title="Modifier le statut"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="commandes-dropdown-menu">
                <button
                  onClick={() => handleStatusChange("EN_COURS")}
                  className="commandes-dropdown-item"
                >
                  <PlayCircle size={14} className="text-blue" /> En cours
                </button>
                <button
                  onClick={() => handleStatusChange("TERMINEE")}
                  className="commandes-dropdown-item"
                >
                  <CheckCircle size={14} className="text-green" /> Terminée
                </button>
                <button
                  onClick={() => handleStatusChange("ANNULEE")}
                  className="commandes-dropdown-item"
                >
                  <XCircle size={14} className="text-red" /> Annulée
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandeRow);
