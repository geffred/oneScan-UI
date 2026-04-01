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
      className={`details-action-card${disabled ? " details-action-card-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div
        className={`details-action-icon${title.includes("Générer") ? " details-action-icon-ai" : ""}`}
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : icon}
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
    if (commande.plateforme === "DEXIS") return "Télécharger (Dexis)";
    if (
      commande.plateforme === "THREESHAPE" ||
      commande.plateforme === "MEDITLINK"
    )
      return "Télécharger (ZIP)";
    return "Télécharger les fichiers";
  };

  return (
    <div className="details-actions-section">
      <div className="details-actions-grid">
        <ActionCard
          onClick={handleDownload}
          disabled={actionStates.download}
          icon={<Download size={18} />}
          title={getDownloadLabel()}
          description="Télécharger les fichiers du cas"
          isLoading={actionStates.download}
        />

        <ActionCard
          onClick={handleGenerateOrder}
          disabled={actionStates.generate || isCommentLoading}
          icon={<Sparkles size={18} />}
          title="Générer le bon de commande"
          description={
            isCommentLoading ? "Chargement..." : "Analyse IA du commentaire"
          }
          isLoading={actionStates.generate}
        />

        <ActionCard
          onClick={handleOpenBonCommande}
          disabled={!canDownloadBonCommande}
          icon={<FileText size={18} />}
          title="Voir le bon de commande"
          description={
            canDownloadBonCommande
              ? "Visualiser et imprimer le PDF"
              : "Type d'appareil requis"
          }
          isLoading={false}
        />

        <ActionCard
          onClick={handleOpenCertificat}
          disabled={!commande?.id}
          icon={<Shield size={18} />}
          title={hasCertificat ? "Gérer le certificat" : "Créer certificat"}
          description="Certificat de conformité médicale"
          isLoading={false}
        />

        <ActionCard
          onClick={handleSendEmailNotification}
          disabled={actionStates.sendEmail || !canSendEmail}
          icon={<Mail size={18} />}
          title="Notifier — commande expédiée"
          description={
            !canSendEmail
              ? "Cabinet requis"
              : "Email de confirmation au cabinet"
          }
          isLoading={actionStates.sendEmail}
        />

        {commande.notification && (
          <div className="notification-status">
            <CheckCircle size={15} className="notification-sent-icon" />
            <span>Notification envoyée</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandeActions;
