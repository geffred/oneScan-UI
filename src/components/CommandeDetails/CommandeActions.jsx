/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import {
  Sparkles,
  FileText,
  Mail,
  Download,
  CheckCircle,
  Shield,
  Loader2,
} from "lucide-react";

const ActionCard = React.memo(
  ({ onClick, disabled, icon, title, description, isLoading }) => (
    <button
      className={`details-action-card ${
        disabled ? "details-action-card-disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <div
        className={`details-action-icon ${
          title.includes("Générer") ? "details-action-icon-ai" : ""
        }`}
      >
        {isLoading ? <Loader2 size={24} className="animate-spin" /> : icon}
      </div>
      <div className="details-action-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  ),
);

const CommandeActions = ({
  commande,
  actionStates,
  isCommentLoading,
  canDownloadBonCommande,
  canSendEmail,
  handleGenerateOrder,
  handleOpenBonCommande,
  handleSendEmailNotification,
  handleDownload,
  handleOpenCertificat,
  hasCertificat,
}) => {
  const getDownloadLabel = () => {
    if (!commande) return "Télécharger les fichiers STL";

    switch (commande.plateforme) {
      case "DEXIS":
        return "Télécharger les scans STL (Dexis)";
      case "THREESHAPE":
        return "Télécharger les scans STL (ZIP)";
      case "MEDITLINK":
        return "Télécharger les scans STL (ZIP)";
      case "ITERO":
        return "Télécharger les scans STL (Itero)";
      case "MYSMILELAB":
        return "Télécharger les fichiers STL (ZIP)";
      default:
        return "Télécharger les fichiers STL";
    }
  };

  const getDownloadDescription = () => {
    if (!commande) return "Télécharger tous les fichiers STL du cas";

    switch (commande.plateforme) {
      case "DEXIS":
        return "Télécharger tous les fichiers STL depuis Dexis";
      case "THREESHAPE":
      case "MEDITLINK":
        return "Tous les fichiers STL seront compressés en un seul fichier ZIP";
      case "ITERO":
        return "Télécharger tous les scans STL Itero";
      case "MYSMILELAB":
        return "Télécharger tous les fichiers STL disponibles";
      default:
        return "Télécharger tous les fichiers STL du cas";
    }
  };

  return (
    <div className="details-actions-section">
      <div className="details-actions-grid">
        {/* 1. Télécharger Fichiers STL */}
        <ActionCard
          onClick={handleDownload}
          disabled={actionStates.download}
          icon={<Download size={24} />}
          title={getDownloadLabel()}
          description={getDownloadDescription()}
          isLoading={actionStates.download}
        />

        {/* 2. Générer Bon de Commande */}
        <ActionCard
          onClick={handleGenerateOrder}
          disabled={actionStates.generate || isCommentLoading}
          icon={<Sparkles size={24} />}
          title="Générer le bon de commande"
          description={
            isCommentLoading
              ? "Chargement..."
              : "Analyse IA du commentaire pour créer le bon de commande"
          }
          isLoading={actionStates.generate}
        />

        {/* 3. Télécharger PDF Bon de Commande */}
        <ActionCard
          onClick={handleOpenBonCommande}
          disabled={!canDownloadBonCommande}
          icon={<FileText size={24} />}
          title="Voir le bon de commande"
          description={
            canDownloadBonCommande
              ? "Visualiser et imprimer le PDF généré"
              : "Type d'appareil requis"
          }
          isLoading={false}
        />

        {/* 4. Certificat */}
        <ActionCard
          onClick={handleOpenCertificat}
          disabled={!commande || !commande.id}
          icon={<Shield size={24} />}
          title={hasCertificat ? "Gérer le certificat" : "Créer certificat"}
          description="Gérer le certificat de conformité médicale"
          isLoading={false}
        />

        {/* 5. Notification Email */}
        <ActionCard
          onClick={handleSendEmailNotification}
          disabled={actionStates.sendEmail || !canSendEmail}
          icon={<Mail size={24} />}
          title="Notifier par email"
          description={
            !canSendEmail
              ? "Cabinet requis"
              : "Envoyer l'email de confirmation au cabinet"
          }
          isLoading={actionStates.sendEmail}
        />

        {commande.notification && (
          <div className="notification-status">
            <CheckCircle size={40} className="notification-sent-icon" />
            <span>Notification envoyée</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandeActions;
