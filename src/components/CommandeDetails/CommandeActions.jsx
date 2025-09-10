import React from "react";
import { Sparkles, FileText, Mail, Download, CheckCircle } from "lucide-react";

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
          title.includes("commande") ? "details-action-icon-ai" : ""
        }`}
      >
        {isLoading ? <div className="details-download-spinner"></div> : icon}
      </div>
      <div className="details-action-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  )
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
}) => {
  return (
    <div className="details-actions-section">
      <div className="details-actions-grid">
        <ActionCard
          onClick={handleGenerateOrder}
          disabled={actionStates.generate || isCommentLoading}
          icon={<Sparkles size={24} />}
          title="Générer le bon de commande"
          description={
            isCommentLoading
              ? "Attente du chargement du commentaire..."
              : "Analyser le commentaire et créer un bon de commande personnalisé avec l'assistance IA"
          }
          isLoading={actionStates.generate}
        />

        <ActionCard
          onClick={handleOpenBonCommande}
          disabled={!canDownloadBonCommande}
          icon={<FileText size={24} />}
          title="Télécharger le bon de commande"
          description={
            canDownloadBonCommande
              ? "Ouvrir et télécharger le bon de commande généré"
              : "Le type d'appareil doit être défini pour télécharger le bon de commande"
          }
          isLoading={false}
        />

        <ActionCard
          onClick={handleSendEmailNotification}
          disabled={actionStates.sendEmail || !canSendEmail}
          icon={<Mail size={24} />}
          title="Envoyer notification par email"
          description={
            !canSendEmail
              ? "Associez d'abord un cabinet pour envoyer une notification"
              : "Envoyer une notification par email au cabinet associé"
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
