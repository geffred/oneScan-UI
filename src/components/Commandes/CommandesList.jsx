/* eslint-disable react/prop-types */
import React from "react";
import { FileText, RefreshCw } from "lucide-react";
import CommandeRow from "./CommandeRow";
import "./CommandesList.css";

const CommandesList = ({
  commandes,
  totalCommandes,
  onViewDetails,
  onSyncAll,
  connectedPlatformsCount,
}) => {
  return (
    <div className="commandes-list-section">
      {commandes.length === 0 ? (
        <div className="commandes-empty-state">
          <FileText className="commandes-empty-icon" size={48} />
          <h3 className="commandes-empty-title">Aucune commande trouvée</h3>
          <p className="commandes-empty-message">
            {totalCommandes === 0
              ? "Aucune commande n'a été créée pour le moment. Connectez vos plateformes et synchronisez pour récupérer vos commandes."
              : "Aucune commande ne correspond à vos critères de recherche."}
          </p>
          {totalCommandes === 0 && connectedPlatformsCount > 0 && (
            <button
              className="commandes-btn commandes-btn-primary"
              onClick={onSyncAll}
            >
              <RefreshCw size={16} />
              Synchroniser maintenant
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="commandes-table">
            <div className="commandes-table-header">
              <div className="commandes-table-cell">ID</div>
              <div className="commandes-table-cell">Patient</div>
              <div className="commandes-table-cell">Cabinet</div>
              <div className="commandes-table-cell">Plateforme</div>
              <div className="commandes-table-cell">Réception</div>
              <div className="commandes-table-cell">Échéance</div>
              <div className="commandes-table-cell">Statut</div>
              <div className="commandes-table-cell">Actions</div>
            </div>

            <div className="commandes-table-body">
              {commandes.map((commande) => (
                <CommandeRow
                  key={commande.id}
                  commande={commande}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>

          {/* Footer avec le compte des résultats */}
          <div className="commandes-footer">
            <p className="commandes-results-count">
              {commandes.length} commande
              {commandes.length > 1 ? "s" : ""} affichée
              {commandes.length > 1 ? "s" : ""}
              {commandes.length !== totalCommandes &&
                ` sur ${totalCommandes} au total`}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CommandesList);
