/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  RefreshCw,
  Loader2,
  Play,
  Square,
  Settings,
  Clock,
} from "lucide-react";
import "./CommandesHeader.css";

const CommandesHeader = ({
  stats,
  userPlatforms,
  isSyncing,
  isAutoSyncActive,
  syncInterval,
  onSyncAll,
  onManualSync,
  onToggleAutoSync,
  onChangeSyncInterval,
}) => {
  const [showIntervalSettings, setShowIntervalSettings] = useState(false);
  const [tempInterval, setTempInterval] = useState(syncInterval);

  const handleIntervalSubmit = (e) => {
    e.preventDefault();
    onChangeSyncInterval(tempInterval);
    setShowIntervalSettings(false);
  };

  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 60) {
      setTempInterval(value);
    }
  };

  const quickIntervals = [1, 5, 10, 15, 30, 60];

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
          <div
            className={`commandes-stat commandes-stat-sync ${
              isAutoSyncActive ? "active" : "inactive"
            }`}
          >
            <span className="commandes-stat-number">
              {isAutoSyncActive ? "🔄" : "⏹️"}
            </span>
            <span className="commandes-stat-label">
              {isAutoSyncActive ? `${syncInterval}min` : "Auto OFF"}
            </span>
          </div>
        </div>
      </div>
      <div className="commandes-header-actions">
        <div className="sync-controls-group">
          {/* Paramètres d'intervalle */}
          <div className="interval-controls">
            <button
              className="commandes-btn commandes-btn-outline"
              onClick={() => setShowIntervalSettings(!showIntervalSettings)}
              title="Configurer l'intervalle de synchronisation"
            >
              <Clock size={16} />
              {syncInterval}min
            </button>

            {showIntervalSettings && (
              <div className="interval-settings-dropdown">
                <div className="interval-settings-header">
                  <h4>Intervalle de synchronisation</h4>
                  <button
                    className="close-btn"
                    onClick={() => setShowIntervalSettings(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="quick-intervals">
                  <label>Intervalles rapides :</label>
                  <div className="quick-intervals-buttons">
                    {quickIntervals.map((interval) => (
                      <button
                        key={interval}
                        className={`quick-interval-btn ${
                          syncInterval === interval ? "active" : ""
                        }`}
                        onClick={() => {
                          onChangeSyncInterval(interval);
                          setShowIntervalSettings(false);
                        }}
                      >
                        {interval}min
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleIntervalSubmit}
                  className="custom-interval"
                >
                  <label htmlFor="custom-interval">
                    Intervalle personnalisé :
                  </label>
                  <div className="custom-interval-input">
                    <input
                      id="custom-interval"
                      type="number"
                      min="1"
                      max="60"
                      value={tempInterval}
                      onChange={handleIntervalChange}
                      placeholder="Minutes"
                    />
                    <span>minutes</span>
                  </div>
                  <button
                    type="submit"
                    className="commandes-btn commandes-btn-primary"
                  >
                    <Settings size={16} />
                    Appliquer
                  </button>
                </form>

                <div className="interval-info">
                  <small>
                    Définissez la fréquence de synchronisation automatique (1-60
                    minutes)
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Synchronisation Manuelle */}
          <button
            className="commandes-btn commandes-btn-secondary"
            onClick={onManualSync}
            disabled={isSyncing}
            title="Synchronisation manuelle immédiate"
          >
            {isSyncing ? (
              <>
                <Loader2 size={16} className="commandes-btn-spinner" />
                Synchro...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Sync Now
              </>
            )}
          </button>

          {/* Bouton Auto Sync ON/OFF */}
          <button
            className={`commandes-btn ${
              isAutoSyncActive
                ? "commandes-btn-danger"
                : "commandes-btn-success"
            }`}
            onClick={onToggleAutoSync}
            disabled={isSyncing}
            title={
              isAutoSyncActive
                ? "Désactiver la synchronisation automatique"
                : "Activer la synchronisation automatique"
            }
          >
            {isAutoSyncActive ? (
              <>
                <Square size={16} />
                Stop Auto
              </>
            ) : (
              <>
                <Play size={16} />
                Start Auto
              </>
            )}
          </button>

          {/* Bouton Sync All (existant) */}
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
              <RefreshCw size={16} />
              Sync All ({stats.connectedPlatformsCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandesHeader);
