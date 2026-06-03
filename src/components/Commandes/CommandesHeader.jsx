/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { RefreshCw, Loader2, Clock } from "lucide-react";
import "./CommandesHeader.css";

/**
 * Formate "il y a Xmin" à partir d'un timestamp epoch ms.
 * Retourne "à l'instant" si < 1 min, "il y a Xh Ymin" si > 60 min.
 * Renvoie null si le timestamp est invalide / absent.
 */
function formatRelativeTime(epochMs) {
  if (!epochMs || typeof epochMs !== "number") return null;
  const diffMs = Date.now() - epochMs;
  if (diffMs < 0) return "à l'instant";
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `il y a ${h} h` : `il y a ${h} h ${rem} min`;
}

const CommandesHeader = ({
  stats,
  userPlatforms,
  isSyncing,
  onSyncAll,
  lastSyncMs,
}) => {
  // Re-render chaque 20 s pour que le "il y a Xmin" reste à jour entre les
  // refreshs SWR (qui sont à 30 s).
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  const freshnessLabel = formatRelativeTime(lastSyncMs);
  // Code couleur :
  // - < 15 min  : frais (vert)
  // - < 60 min  : modéré (gris)
  // - > 60 min  : ancien (orange, peut-être une sync ratée)
  let freshnessClass = "commandes-freshness";
  if (lastSyncMs) {
    const ageMin = (Date.now() - lastSyncMs) / 60_000;
    if (ageMin < 15) freshnessClass += " commandes-freshness--fresh";
    else if (ageMin < 60) freshnessClass += " commandes-freshness--moderate";
    else freshnessClass += " commandes-freshness--stale";
  }

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
        {freshnessLabel && (
          <span className={freshnessClass} title="Fraîcheur des commandes">
            <Clock size={14} />
            Dernière sync : {freshnessLabel}
          </span>
        )}
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
