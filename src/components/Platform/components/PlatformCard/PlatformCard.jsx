/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Link2,
  Shield,
  Cloud,
  Activity,
  X,
  RefreshCw,
} from "lucide-react";
import "./PlatformCard.css";

const PlatformCard = React.memo(
  ({
    platform,
    onEdit,
    onDelete,
    onConnect3Shape,
    onConnectMeditLink,
    onConnectItero,
    onConnectDexis,
    onConnectGoogleDrive,
    onConnectCsConnect,
    onDisconnectMeditLink,
    onDisconnectGoogleDrive,
    onDisconnectCsConnect,
    onShowMeditLinkDashboard,
    onShowThreeShapeDashboard,
    threeshapeStatus,
    meditlinkStatus,
    iteroStatus,
    dexisStatus,
    googledriveStatus,
    csconnectStatus,
  }) => {
    const is3Shape = platform.name === "THREESHAPE";
    const isMeditLink = platform.name === "MEDITLINK";
    const isItero = platform.name === "ITERO";
    const isDexis = platform.name === "DEXIS";
    const isGoogleDrive = platform.name === "GOOGLE_DRIVE";
    const isCsConnect = platform.name === "CSCONNECT";

    const getPlatformDisplayName = () => {
      switch (platform.name) {
        case "THREESHAPE":
          return "3Shape";
        case "GOOGLE_DRIVE":
          return "Google Drive";
        case "CSCONNECT":
          return "CS Connect";
        default:
          return platform.name;
      }
    };

    const getPlatformStatus = () => {
      if (is3Shape) return threeshapeStatus;
      if (isMeditLink) return meditlinkStatus;
      if (isItero) return iteroStatus;
      if (isDexis) return dexisStatus;
      if (isGoogleDrive) return googledriveStatus;
      if (isCsConnect) return csconnectStatus;
      return null;
    };

    const status = getPlatformStatus();
    const isConnected = status?.authenticated;
    const isLoading = status?.loading;

    return (
      <div className="platform-card-component">
        <div className="platform-card-component__header">
          <h3 className="platform-card-component__title">
            {getPlatformDisplayName()}
          </h3>

          <div
            className={`platform-card-component__status ${
              isConnected
                ? "platform-card-component__status--connected"
                : "platform-card-component__status--disconnected"
            }`}
          >
            {isConnected ? (
              <CheckCircle
                size={16}
                className="platform-card-component__status-icon"
              />
            ) : (
              <AlertCircle
                size={16}
                className="platform-card-component__status-icon"
              />
            )}
            <span>
              {isConnected
                ? `Connecté à ${getPlatformDisplayName()}`
                : `Non connecté à ${getPlatformDisplayName()}`}
            </span>
          </div>
        </div>

        <div className="platform-card-component__content">
          <div className="platform-card-component__info">
            <Mail size={16} className="platform-card-component__info-icon" />
            <span>{platform.email}</span>
          </div>

          <div className="platform-card-component__config-status">
            Configuré
          </div>

          {isMeditLink && isConnected && meditlinkStatus?.userInfo && (
            <div className="platform-card-component__user-info">
              <Shield
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>{meditlinkStatus.userInfo.name}</span>
            </div>
          )}

          {is3Shape && isConnected && threeshapeStatus?.hasToken && (
            <div className="platform-card-component__user-info">
              <Link2
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>Token 3Shape actif</span>
            </div>
          )}

          {isItero && isConnected && (
            <div className="platform-card-component__user-info">
              <Link2
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>Connecté à l'API Itero</span>
            </div>
          )}

          {isDexis && isConnected && (
            <div className="platform-card-component__user-info">
              <Link2
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>Connecté à l'API Dexis</span>
            </div>
          )}

          {isGoogleDrive && isConnected && (
            <div className="platform-card-component__user-info">
              <Cloud
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>Accès Drive activé</span>
            </div>
          )}

          {isCsConnect && isConnected && (
            <div className="platform-card-component__user-info">
              <Link2
                size={14}
                className="platform-card-component__user-info-icon"
              />
              <span>Connecté à l'API CS Connect</span>
            </div>
          )}
        </div>

        <div className="platform-card-component__actions">
          <div className="platform-card-component__actions-group">
            {/* 3Shape Actions */}
            {is3Shape && (
              <>
                <button
                  onClick={() => onConnect3Shape(platform)}
                  className={`platform-card-component__connect-btn ${
                    isConnected
                      ? "platform-card-component__connect-btn--connected"
                      : ""
                  }`}
                  aria-label={
                    isConnected ? "Reconnecter à 3Shape" : "Connecter à 3Shape"
                  }
                >
                  <Link2 size={16} />
                  {isConnected ? "Reconnecter" : "Connecter OAuth"}
                </button>
                {isConnected && (
                  <button
                    onClick={() => onShowThreeShapeDashboard(platform)}
                    className="platform-card-component__dashboard-btn"
                    aria-label="Tableau de bord 3Shape"
                  >
                    <Activity size={16} />
                    Dashboard
                  </button>
                )}
              </>
            )}

            {/* MeditLink Actions */}
            {isMeditLink && (
              <>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => onShowMeditLinkDashboard(platform)}
                      className="platform-card-component__dashboard-btn"
                      aria-label="Tableau de bord MeditLink"
                    >
                      <Activity size={16} />
                      Dashboard
                    </button>
                    <button
                      onClick={() => onDisconnectMeditLink(platform)}
                      className="platform-card-component__disconnect-btn"
                      aria-label="Déconnecter de MeditLink"
                    >
                      <X size={16} />
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onConnectMeditLink(platform)}
                    className="platform-card-component__connect-btn"
                    disabled={isLoading}
                    aria-label="Connecter à MeditLink"
                  >
                    <Link2 size={16} />
                    {isLoading ? "Connexion..." : "Connecter OAuth"}
                  </button>
                )}
              </>
            )}

            {/* Itero Actions */}
            {isItero && (
              <button
                onClick={() => onConnectItero(platform)}
                className={`platform-card-component__connect-btn ${
                  isConnected
                    ? "platform-card-component__connect-btn--connected"
                    : ""
                }`}
                disabled={isLoading}
                aria-label={
                  isConnected ? "Reconnecter à Itero" : "Connecter à Itero"
                }
              >
                <Link2 size={16} />
                {isLoading
                  ? "Connexion..."
                  : isConnected
                  ? "Reconnecter"
                  : "Connecter"}
              </button>
            )}

            {/* Dexis Actions */}
            {isDexis && (
              <button
                onClick={() => onConnectDexis(platform)}
                className={`platform-card-component__connect-btn ${
                  isConnected
                    ? "platform-card-component__connect-btn--connected"
                    : ""
                }`}
                disabled={isLoading}
                aria-label={
                  isConnected ? "Reconnecter à Dexis" : "Connecter à Dexis"
                }
              >
                <Link2 size={16} />
                {isLoading
                  ? "Connexion..."
                  : isConnected
                  ? "Reconnecter"
                  : "Connecter"}
              </button>
            )}

            {/* CS Connect Actions */}
            {isCsConnect && (
              <>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => onConnectCsConnect(platform)}
                      className="platform-card-component__connect-btn platform-card-component__connect-btn--connected"
                      aria-label="Reconnecter à CS Connect"
                    >
                      <Link2 size={16} />
                      Reconnecter
                    </button>
                    <button
                      onClick={() => onDisconnectCsConnect(platform)}
                      className="platform-card-component__disconnect-btn"
                      aria-label="Déconnecter CS Connect"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw
                          size={16}
                          className="platform-card-component__spinner"
                        />
                      ) : (
                        <X size={16} />
                      )}
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onConnectCsConnect(platform)}
                    className="platform-card-component__connect-btn"
                    disabled={isLoading}
                    aria-label="Connecter à CS Connect"
                  >
                    <Link2 size={16} />
                    {isLoading ? "Connexion..." : "Connecter"}
                  </button>
                )}
              </>
            )}

            {/* Google Drive Actions */}
            {isGoogleDrive && (
              <>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => onConnectGoogleDrive(platform)}
                      className="platform-card-component__connect-btn platform-card-component__connect-btn--connected"
                      aria-label="Reconnecter à Google Drive"
                    >
                      <Cloud size={16} />
                      Reconnecter
                    </button>
                    <button
                      onClick={() => onDisconnectGoogleDrive(platform)}
                      className="platform-card-component__disconnect-btn"
                      aria-label="Déconnecter Google Drive"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw
                          size={16}
                          className="platform-card-component__spinner"
                        />
                      ) : (
                        <X size={16} />
                      )}
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onConnectGoogleDrive(platform)}
                    className="platform-card-component__connect-btn"
                    disabled={isLoading}
                    aria-label="Connecter à Google Drive"
                  >
                    <Cloud size={16} />
                    {isLoading ? "Connexion..." : "Connecter OAuth"}
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => onEdit(platform)}
            className="platform-card-component__edit-btn"
            aria-label="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(platform.id)}
            className="platform-card-component__delete-btn"
            aria-label="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }
);

PlatformCard.displayName = "PlatformCard";

export default PlatformCard;
