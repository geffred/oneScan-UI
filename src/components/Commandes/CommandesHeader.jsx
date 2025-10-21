/* eslint-disable react/prop-types */
import React from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import "./CommandesHeader.css";

const CommandesHeader = ({ stats, userPlatforms, isSyncing, onSyncAll }) => {
  return (
    <div className="commandes-header">
      <div className="commandes-header-content">
        <h2 className="commandes-card-title">Gestion des Commandes</h2>
        <div className="commandes-stats">
          <div className="commandes-stat">
            <span className="commandes-stat-number">
              {stats.totalCommandes}
            </span>
            <span className="commandes-stat-label">Total</span>
          </div>
          <div className="commandes-stat">
            <span className="commandes-stat-number commandes-stat-unread">
              {stats.commandesNonVues}
            </span>
            <span className="commandes-stat-label">Non vues</span>
          </div>
          <div className="commandes-stat">
            <span className="commandes-stat-number commandes-stat-overdue">
              {stats.commandesEchues}
            </span>
            <span className="commandes-stat-label">Échues</span>
          </div>
        </div>
      </div>
      <div className="commandes-header-actions">
        {userPlatforms.length > 0 && (
          <button
            className="commandes-btn commandes-btn-primary"
            onClick={onSyncAll}
            disabled={isSyncing || stats.connectedPlatformsCount === 0}
            title={
              stats.connectedPlatformsCount === 0
                ? "Aucune plateforme connectée"
                : "Synchroniser toutes les plateformes connectées"
            }
          >
            {isSyncing ? (
              <>
                <Loader2 size={16} className="commandes-btn-spinner" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Synchroniser tout ({stats.connectedPlatformsCount})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(CommandesHeader);
