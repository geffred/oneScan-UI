/* eslint-disable react/prop-types */
import React from "react";
import {
  RefreshCw,
  Loader2,
  HardDrive,
  Wifi,
  WifiOff,
  Shield,
  Link2,
  Cloud,
  AlertCircle,
  CheckCircle,
  Cpu,
} from "lucide-react";

const PlatformCard = ({ platform, syncStatus, onSync, connectionStatus }) => {
  const getSyncStatusIcon = () => {
    if (!syncStatus) return null;

    switch (syncStatus.status) {
      case "loading":
        return <Loader2 size={14} className="commandes-sync-loading-spinner" />;
      case "success":
        return <CheckCircle size={14} className="commandes-sync-success" />;
      case "error":
        return <AlertCircle size={14} className="commandes-sync-error" />;
      default:
        return null;
    }
  };

  const getConnectionStatusIcon = () => {
    if (!connectionStatus)
      return <WifiOff size={16} className="commandes-connection-unknown" />;

    switch (platform.name) {
      case "MEDITLINK":
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
      case "THREESHAPE":
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
      case "ITERO":
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
      case "DEXIS":
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
      case "CSCONNECT":
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
      case "GOOGLE_DRIVE":
        return connectionStatus.authenticated ? (
          <Cloud size={16} className="commandes-connection-success" />
        ) : (
          <Cloud size={16} className="commandes-connection-error" />
        );
      default:
        return connectionStatus.authenticated ? (
          <Link2 size={16} className="commandes-connection-success" />
        ) : (
          <Link2 size={16} className="commandes-connection-error" />
        );
    }
  };

  const getConnectionStatusText = () => {
    if (!connectionStatus) return "Statut inconnu";

    switch (platform.name) {
      case "MEDITLINK":
        return connectionStatus.authenticated
          ? "Connecté OAuth"
          : "Non connecté";
      case "THREESHAPE":
        return connectionStatus.authenticated
          ? "Connecté OAuth"
          : "Non connecté";
      case "ITERO":
        return connectionStatus.authenticated
          ? "Connecté à l'API"
          : "Non connecté";
      case "DEXIS":
        return connectionStatus.authenticated
          ? "Connecté à l'API"
          : "Non connecté";
      case "CSCONNECT":
        return connectionStatus.authenticated
          ? "Connecté à l'API"
          : "Non connecté";
      case "GOOGLE_DRIVE":
        return connectionStatus.authenticated ? "Drive activé" : "Non connecté";
      default:
        return connectionStatus.authenticated ? "Connecté" : "Non connecté";
    }
  };

  const getPlatformDisplayName = (name) => {
    switch (name) {
      case "THREESHAPE":
        return "3Shape";
      case "ITERO":
        return "Itero";
      case "DEXIS":
        return "Dexis";
      case "CSCONNECT":
        return "CS Connect";
      case "GOOGLE_DRIVE":
        return "Google Drive";
      default:
        return name;
    }
  };

  const isConnected = connectionStatus?.authenticated === true;

  return (
    <div className="commandes-platform-card">
      <div className="commandes-platform-info">
        <div className="commandes-platform-header">
          <h4 className="commandes-platform-name">
            {getPlatformDisplayName(platform.name)}
          </h4>
          <div
            className={`commandes-connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            {getConnectionStatusIcon()}
            <span className="commandes-connection-text">
              {getConnectionStatusText()}
            </span>
          </div>
        </div>
        <p className="commandes-platform-email">{platform.email}</p>

        {/* Affichage des informations utilisateur si connecté */}
        {isConnected && connectionStatus.userInfo && (
          <div className="commandes-user-info">
            <span className="commandes-user-name">
              {connectionStatus.userInfo.name ||
                connectionStatus.userInfo.email}
            </span>
          </div>
        )}
      </div>

      <div className="commandes-platform-actions">
        {syncStatus && (
          <div
            className={`commandes-sync-status commandes-sync-${syncStatus.status}`}
          >
            {getSyncStatusIcon()}
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

        {/* Désactiver le bouton de sync pour Google Drive */}
        {platform.name === "GOOGLE_DRIVE" ? (
          <div className="commandes-platform-note">
            <HardDrive size={14} />
            <span className="commandes-note-text">Stockage fichiers</span>
          </div>
        ) : (
          <button
            className={`commandes-btn ${
              isConnected ? "commandes-btn-primary" : "commandes-btn-disabled"
            }`}
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
        )}
      </div>
    </div>
  );
};

export default React.memo(PlatformCard);
