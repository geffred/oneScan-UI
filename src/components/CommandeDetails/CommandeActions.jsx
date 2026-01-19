/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
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
  handleDownload, // Reçoit la fonction handleDownload unifiée du parent
  handleOpenCertificat,
  hasCertificat,
}) => {
  // Texte dynamique pour le bouton
  const getDownloadLabel = () => {
    if (commande.plateforme === "DEXIS") return "Télécharger le scan (Dexis)";
    if (
      commande.plateforme === "THREESHAPE" ||
      commande.plateforme === "MEDITLINK"
    )
      return "Télécharger le scan (ZIP)";
    return "Télécharger les fichiers";
  };

  return (
    <div className="details-actions-section">
      <div className="details-actions-grid">
        {/* 1. Télécharger Fichiers (Zip/Direct) */}
        <ActionCard
          onClick={handleDownload}
          disabled={actionStates.download}
          icon={<Download size={24} />}
          title={getDownloadLabel()}
          description="Télécharger tous les fichiers du cas (compressés si nécessaire)"
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
