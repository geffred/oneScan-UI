/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React from "react";
import { Server, AlertCircle } from "lucide-react";
import PlatformCard from "./PlatformCard";
import "./PlatformsSection.css";

const PlatformsSection = ({
  userPlatforms,
  syncStatus,
  onSyncPlatform,
  getConnectionStatus,
  connectedPlatformsCount,
  totalPlatformsCount,
}) => {
  if (userPlatforms.length === 0) return null;

  return (
    <div className="commandes-platforms-section">
      <h3 className="commandes-platforms-title">
        <Server size={20} />
        Vos Plateformes ({connectedPlatformsCount}/{totalPlatformsCount}{" "}
        connectées)
      </h3>
      <div className="commandes-platforms-grid">
        {userPlatforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            syncStatus={syncStatus[platform.name]}
            onSync={onSyncPlatform}
            connectionStatus={getConnectionStatus(platform.name)}
          />
        ))}
      </div>

      {connectedPlatformsCount === 0 && (
        <div className="commandes-platforms-warning">
          <AlertCircle size={20} />
          <p>
            Aucune plateforme n'est connectée. Rendez-vous dans la section
            <strong> Plateformes</strong> pour configurer vos connexions.
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(PlatformsSection);
