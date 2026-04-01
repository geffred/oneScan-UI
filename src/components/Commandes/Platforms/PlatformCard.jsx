/* eslint-disable react/prop-types */
import React from "react";
import {
  RefreshCw,
  Loader2,
  Link2,
  AlertCircle,
  CheckCircle,
  WifiOff,
} from "lucide-react";

const PLATFORM_DISPLAY_NAMES = {
  THREESHAPE: "3Shape",
  MEDITLINK: "MeditLink",
  ITERO: "Itero",
  DEXIS: "Dexis",
  CSCONNECT: "CS Connect",
  MYSMILELAB: "MySmileLab",
};

const CONNECTION_LABELS = {
  MEDITLINK: { yes: "Connecté OAuth", no: "Non connecté" },
  THREESHAPE: { yes: "Connecté OAuth", no: "Non connecté" },
  ITERO: { yes: "Connecté à l'API", no: "Non connecté" },
  DEXIS: { yes: "Connecté Dexis OAuth", no: "Non connecté" },
  CSCONNECT: { yes: "Connecté à l'API", no: "Non connecté" },
};

const PlatformCard = ({ platform, syncStatus, onSync, connectionStatus }) => {
  const isConnected = connectionStatus?.authenticated === true;
  const displayName = PLATFORM_DISPLAY_NAMES[platform.name] || platform.name;
  const connLabel = (CONNECTION_LABELS[platform.name] || {
    yes: "Connecté",
    no: "Non connecté",
  })[isConnected ? "yes" : "no"];

  const getSyncIcon = () => {
    if (!syncStatus) return null;
    if (syncStatus.status === "loading")
      return <Loader2 size={14} className="commandes-sync-loading-spinner" />;
    if (syncStatus.status === "success")
      return <CheckCircle size={14} className="commandes-sync-success" />;
    if (syncStatus.status === "error")
      return <AlertCircle size={14} className="commandes-sync-error" />;
    return null;
  };

  return (
    <div className="commandes-platform-card">
      <div className="commandes-platform-info">
        <div className="commandes-platform-header">
          <h4 className="commandes-platform-name">{displayName}</h4>
          <div
            className={`commandes-connection-status ${isConnected ? "connected" : "disconnected"}`}
          >
            {isConnected ? (
              <Link2 size={16} className="commandes-connection-success" />
            ) : (
              <WifiOff size={16} className="commandes-connection-error" />
            )}
            <span className="commandes-connection-text">{connLabel}</span>
          </div>
        </div>
        <p className="commandes-platform-email">{platform.email}</p>
      </div>

      <div className="commandes-platform-actions">
        {syncStatus && (
          <div
            className={`commandes-sync-status commandes-sync-${syncStatus.status}`}
          >
            {getSyncIcon()}
            <div className="commandes-sync-details">
              <span className="commandes-sync-message">
                {syncStatus.message}
              </span>
              {syncStatus.status === "success" &&
                syncStatus.count !== undefined && (
                  <div className="commandes-sync-count">
                    <strong>{syncStatus.count}</strong> commande(s)
                  </div>
                )}
            </div>
          </div>
        )}

        {/* onSync reçoit platform.name — useSyncPlatforms.syncPlatformCommandes gère le reste */}
        <button
          className={`commandes-btn ${isConnected ? "commandes-btn-primary" : "commandes-btn-disabled"}`}
          onClick={() => onSync(platform.name)}
          disabled={syncStatus?.status === "loading" || !isConnected}
          title={!isConnected ? "Connexion requise" : "Récupérer les données"}
        >
          {syncStatus?.status === "loading" ? (
            <>
              <Loader2 size={14} className="commandes-sync-loading-spinner" />
              Sync...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              {isConnected ? "Synchroniser" : "Non connecté"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(PlatformCard);
