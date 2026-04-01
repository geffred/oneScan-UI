/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  User,
  Building,
  Server,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  ChevronDown,
  Info,
} from "lucide-react";
import CommentSection from "./CommentSection";
import "./CommandeInfoGrid.css";

// ── Dropdown statut ────────────────────────────────────────────────────────
const StatusDropdown = React.memo(
  ({ currentStatus, onStatusChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
      { value: "EN_ATTENTE", label: "En attente" },
      { value: "EN_COURS", label: "En cours" },
      { value: "TERMINEE", label: "Terminée" },
      { value: "EXPEDIEE", label: "Expédiée" },
      { value: "ANNULEE", label: "Annulée" },
    ];

    React.useEffect(() => {
      const close = (e) => {
        if (!e.target.closest(".status-dropdown")) setIsOpen(false);
      };
      if (isOpen) window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }, [isOpen]);

    const currentLabel =
      options.find((o) => o.value === currentStatus)?.label || "Inconnu";

    return (
      <div className="status-dropdown">
        <button
          className="status-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Edit size={13} />
          {currentLabel}
          <ChevronDown
            size={13}
            className={`status-dropdown-chevron${isOpen ? " open" : ""}`}
          />
        </button>
        {isOpen && (
          <div className="status-dropdown-menu">
            {options.map((s) => (
              <button
                key={s.value}
                className={`status-dropdown-item${currentStatus === s.value ? " active" : ""}`}
                onClick={() => {
                  onStatusChange(s.value);
                  setIsOpen(false);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

// ── Composant principal ────────────────────────────────────────────────────
const CommandeInfoGrid = ({
  commande,
  echeanceStatus,
  plateformeColor,
  formatDate,
  handleStatusChange,
  actionStates,
  isCommentLoading,
  finalCommentaire,
  mutateCommande,
  mutateCommandes,
  mutateCommentaire,
  showNotification,
}) => {
  return (
    <div className="details-info-grid">
      {/* 1. Patient */}
      <div className="details-info-card">
        <div className="details-card-header">
          <User size={15} />
          <h3>Patient</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Référence</span>
            <span className="details-item-value">
              {commande.refPatient || "Non spécifiée"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cabinet */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Building size={15} />
          <h3>Cabinet</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Nom</span>
            <span className="details-item-value">{commande.cabinet}</span>
          </div>
        </div>
      </div>

      {/* 3. Plateforme */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Server size={15} />
          <h3>Plateforme</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Source</span>
            <span
              className={`details-platform-badge commandes-plateforme-${plateformeColor}`}
            >
              {commande.plateforme}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Dates */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Calendar size={15} />
          <h3>Dates</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Réception</span>
            <span className="details-item-value">{commande.dateReception}</span>
          </div>
          <div className="details-item">
            <span className="details-item-label">Échéance</span>
            <span className="details-item-value">
              {formatDate(commande.dateEcheance)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Statut */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Clock size={15} />
          <h3>Statut</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">État</span>
            <span
              className={`details-status-badge commandes-status-${echeanceStatus.class}`}
            >
              {echeanceStatus.label}
            </span>
          </div>
          <div className="details-item">
            <span className="details-item-label">Traitement</span>
            <StatusDropdown
              currentStatus={commande.statut || "EN_ATTENTE"}
              onStatusChange={handleStatusChange}
              isLoading={actionStates.updateStatus}
            />
          </div>
          <div className="details-item">
            <span className="details-item-label">Lecture</span>
            {commande.vu ? (
              <span className="details-read-status">
                <CheckCircle size={13} />
                Lue
              </span>
            ) : (
              <span className="details-unread-status">
                <AlertCircle size={13} />
                Non lue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 6. Commentaire */}
      <CommentSection
        commentaire={finalCommentaire}
        isLoading={isCommentLoading}
        commande={commande}
        mutateCommande={mutateCommande}
        mutateCommandes={mutateCommandes}
        mutateCommentaire={mutateCommentaire}
        showNotification={showNotification}
      />

      {/* 7. Technique */}
      <div className="details-info-card">
        <div className="details-card-header">
          <div className="details-card-header-title">
            <FileText size={15} />
            <h3>Technique</h3>
          </div>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">ID Externe</span>
            <span className="details-external-id">{commande.externalId}</span>
          </div>
          <div className="details-item">
            <span className="details-item-label">Suivi</span>
            <span className="details-external-id">{commande.numeroSuivi}</span>
          </div>
          <div className="details-item">
            <span className="details-item-label">ID Interne</span>
            <span className="details-item-value">#{commande.id}</span>
          </div>
          {commande.typeAppareil && (
            <div className="details-item">
              <span className="details-item-label">Type appareil</span>
              <span className="details-item-value">
                {commande.typeAppareil}
              </span>
            </div>
          )}
          <div
            className="details-item"
            style={{
              borderTop: "1px solid #f0f0f0",
              marginTop: "0.25rem",
              paddingTop: "0.5rem",
            }}
          >
            <span
              className="details-item-label"
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Info size={12} style={{ color: "#007AFF", flexShrink: 0 }} />
              Fichiers 3D
            </span>
            <span
              className="details-item-value"
              style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 300 }}
            >
              Utilisez le bouton{" "}
              <strong style={{ fontWeight: 600, color: "#374151" }}>
                Télécharger
              </strong>{" "}
              dans la section Actions ci-dessous.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandeInfoGrid;
