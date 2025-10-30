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
    onDisconnectMeditLink,
    onDisconnectGoogleDrive,
    onShowMeditLinkDashboard,
    onShowThreeShapeDashboard,
    threeshapeStatus,
    meditlinkStatus,
    iteroStatus,
    dexisStatus,
    googledriveStatus,
  }) => {
    const is3Shape = platform.name === "THREESHAPE";
    const isMeditLink = platform.name === "MEDITLINK";
    const isItero = platform.name === "ITERO";
    const isDexis = platform.name === "DEXIS";
    const isGoogleDrive = platform.name === "GOOGLE_DRIVE";

    const getPlatformDisplayName = () => {
      switch (platform.name) {
        case "THREESHAPE":
          return "3Shape";
        case "GOOGLE_DRIVE":
          return "Google Drive";
        default:
          return platform.name;
      }
    };

    return (
      <div className="platform-card">
        <div className="platform-card-header">
          <h3 className="platform-card-title">{getPlatformDisplayName()}</h3>

          {is3Shape && (
            <div
              className={`platform-dashboard-status ${
                threeshapeStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {threeshapeStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {threeshapeStatus?.authenticated
                  ? "Connecté à 3Shape"
                  : "Non connecté à 3Shape"}
              </span>
            </div>
          )}

          {isMeditLink && (
            <div
              className={`platform-dashboard-status ${
                meditlinkStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {meditlinkStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {meditlinkStatus?.authenticated
                  ? "Connecté à MeditLink"
                  : "Non connecté à MeditLink"}
              </span>
            </div>
          )}

          {isItero && (
            <div
              className={`platform-dashboard-status ${
                iteroStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {iteroStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {iteroStatus?.authenticated
                  ? "Connecté à Itero"
                  : "Non connecté à Itero"}
              </span>
            </div>
          )}

          {isDexis && (
            <div
              className={`platform-dashboard-status ${
                dexisStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {dexisStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {dexisStatus?.authenticated
                  ? "Connecté à Dexis"
                  : "Non connecté à Dexis"}
              </span>
            </div>
          )}

          {isGoogleDrive && (
            <div
              className={`platform-googledrive-status ${
                googledriveStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {googledriveStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {googledriveStatus?.authenticated
                  ? "Connecté à Google Drive"
                  : "Non connecté à Google Drive"}
              </span>
            </div>
          )}
        </div>

        <div className="platform-card-content">
          <div className="platform-card-info">
            <Mail size={16} />
            <span>{platform.email}</span>
          </div>
          <div className="platform-card-status">
            <span className="platform-connected-status">Configuré</span>
          </div>

          {isMeditLink &&
            meditlinkStatus?.authenticated &&
            meditlinkStatus.userInfo && (
              <div className="platform-user-info">
                <Shield size={14} />
                <span>{meditlinkStatus.userInfo.name}</span>
              </div>
            )}

          {is3Shape &&
            threeshapeStatus?.authenticated &&
            threeshapeStatus.hasToken && (
              <div className="platform-user-info">
                <Link2 size={14} />
                <span>Token 3Shape actif</span>
              </div>
            )}

          {isItero && iteroStatus?.authenticated && (
            <div className="platform-user-info">
              <Link2 size={14} />
              <span>Connecté à l'API Itero</span>
            </div>
          )}

          {isDexis && dexisStatus?.authenticated && (
            <div className="platform-user-info">
              <Link2 size={14} />
              <span>Connecté à l'API Dexis</span>
            </div>
          )}

          {isGoogleDrive && googledriveStatus?.authenticated && (
            <div className="platform-user-info">
              <Cloud size={14} />
              <span>Accès Drive activé</span>
            </div>
          )}
        </div>

        <div className="platform-card-actions">
          {is3Shape && (
            <div className="threeshape-actions-group">
              <button
                onClick={() => onConnect3Shape(platform)}
                className={`platform-connect-btn ${
                  threeshapeStatus?.authenticated ? "connected" : ""
                }`}
                aria-label="Connecter à 3Shape"
              >
                <Link2 size={16} />
                {threeshapeStatus?.authenticated ? "Reconnecter" : "Connecter"}
              </button>
              {threeshapeStatus?.authenticated && (
                <button
                  onClick={() => onShowThreeShapeDashboard(platform)}
                  className="platform-connect-btn"
                  aria-label="Tableau de bord 3Shape"
                >
                  <Activity size={16} />
                  Dashboard
                </button>
              )}
            </div>
          )}

          {isMeditLink && (
            <>
              {meditlinkStatus?.authenticated ? (
                <div className="meditlink-actions-group">
                  <button
                    onClick={() => onShowMeditLinkDashboard(platform)}
                    className="platform-connect-btn"
                    aria-label="Tableau de bord MeditLink"
                  >
                    <Activity size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => onDisconnectMeditLink(platform)}
                    className="platform-disconnect-btn"
                    aria-label="Déconnecter de MeditLink"
                  >
                    <X size={16} />
                    Déconnecter
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onConnectMeditLink(platform)}
                  className="platform-connect-btn"
                  disabled={meditlinkStatus?.loading}
                  aria-label="Connecter à MeditLink"
                >
                  <Shield size={16} />
                  {meditlinkStatus?.loading
                    ? "Connexion..."
                    : "Connecter OAuth"}
                </button>
              )}
            </>
          )}

          {isItero && (
            <div className="itero-actions-group">
              <button
                onClick={() => onConnectItero(platform)}
                className={`platform-connect-btn ${
                  iteroStatus?.authenticated ? "connected" : ""
                }`}
                disabled={iteroStatus?.loading}
                aria-label="Connecter à Itero"
              >
                <Shield size={16} />
                {iteroStatus?.loading
                  ? "Connexion..."
                  : iteroStatus?.authenticated
                  ? "Reconnecter"
                  : "Connecter"}
              </button>
            </div>
          )}

          {isDexis && (
            <div className="dexis-actions-group">
              <button
                onClick={() => onConnectDexis(platform)}
                className={`platform-connect-btn ${
                  dexisStatus?.authenticated ? "connected" : ""
                }`}
                disabled={dexisStatus?.loading}
                aria-label="Connecter à Dexis"
              >
                <Shield size={16} />
                {dexisStatus?.loading
                  ? "Connexion..."
                  : dexisStatus?.authenticated
                  ? "Reconnecter"
                  : "Connecter"}
              </button>
            </div>
          )}

          {isGoogleDrive && (
            <>
              {googledriveStatus?.authenticated ? (
                <div className="googledrive-actions-group">
                  <button
                    onClick={() => onConnectGoogleDrive(platform)}
                    className="platform-connect-btn connected"
                    aria-label="Reconnecter à Google Drive"
                  >
                    <Cloud size={16} />
                    Reconnecter
                  </button>
                  <button
                    onClick={() => onDisconnectGoogleDrive(platform)}
                    className="platform-disconnect-btn"
                    aria-label="Déconnecter Google Drive"
                    disabled={googledriveStatus?.loading}
                  >
                    {googledriveStatus?.loading ? (
                      <RefreshCw size={16} className="spinner" />
                    ) : (
                      <X size={16} />
                    )}
                    Déconnecter
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onConnectGoogleDrive(platform)}
                  className="platform-connect-btn"
                  disabled={googledriveStatus?.loading}
                  aria-label="Connecter à Google Drive"
                >
                  <Cloud size={16} />
                  {googledriveStatus?.loading
                    ? "Connexion..."
                    : "Connecter OAuth"}
                </button>
              )}
            </>
          )}

          <button
            onClick={() => onEdit(platform)}
            className="platform-edit-btn"
            aria-label="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(platform.id)}
            className="platform-delete-btn"
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
