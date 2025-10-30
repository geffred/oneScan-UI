// ThreeShapeDashboard.js - Nouveau composant
import React, { useState, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import {
  Link2,
  Activity,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Calendar,
  Download,
  Server,
  Info,
  Clock,
} from "lucide-react";
import useThreeShapeAuth from "../../../Config/useThreeShapeAuth";
import "./ThreeShapeDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuration du rafraîchissement automatique
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STATUS_CHECK_INTERVAL = 30000; // 30 secondes

const fetcher = (url) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    credentials: "include",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
};

const ThreeShapeDashboard = () => {
  const {
    authStatus,
    isLoading,
    error,
    isAuthenticated,
    hasToken,
    initiateAuth,
    logout,
    refresh,
    clearError,
    testConnection,
  } = useThreeShapeAuth();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const refreshIntervalRef = useRef(null);

  // SWR pour les données de statut
  const { data: authData, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/threeshape/auth/status`,
    fetcher,
    {
      refreshInterval: STATUS_CHECK_INTERVAL,
      revalidateOnFocus: true,
    }
  );

  const mergedAuthStatus = authData || authStatus;

  // Gestion du rafraîchissement automatique
  const scheduleAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }

    if (autoRefreshEnabled && isAuthenticated) {
      refreshIntervalRef.current = setTimeout(async () => {
        try {
          console.log("🔄 Rafraîchissement automatique du token...");
          await handleRefresh();
        } catch (err) {
          console.error("❌ Erreur lors du rafraîchissement automatique:", err);
        }
      }, AUTO_REFRESH_INTERVAL);

      // Calcul des dates pour l'affichage
      setLastRefresh(new Date());
      setNextRefresh(new Date(Date.now() + AUTO_REFRESH_INTERVAL));
    }
  }, [autoRefreshEnabled, isAuthenticated]);

  // Effet pour gérer le rafraîchissement automatique
  useEffect(() => {
    if (isAuthenticated && autoRefreshEnabled) {
      scheduleAutoRefresh();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, autoRefreshEnabled, scheduleAutoRefresh]);

  // Réinitialiser le timer quand l'authentification change
  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
      setLastRefresh(null);
      setNextRefresh(null);
    }
  }, [isAuthenticated]);

  // Handlers
  const handleConnect = useCallback(async () => {
    try {
      await initiateAuth();
      mutateAuth();
      setAutoRefreshEnabled(true);
    } catch (err) {
      console.error("Erreur connexion:", err);
    }
  }, [initiateAuth, mutateAuth]);

  const handleDisconnect = useCallback(async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir vous déconnecter de 3Shape ?")
    ) {
      try {
        if (refreshIntervalRef.current) {
          clearTimeout(refreshIntervalRef.current);
        }
        await logout();
        mutateAuth(undefined, { revalidate: false });
        setTestResult(null);
        setLastRefresh(null);
        setNextRefresh(null);
      } catch (err) {
        console.error("Erreur déconnexion:", err);
      }
    }
  }, [logout, mutateAuth]);

  const handleRefresh = useCallback(async () => {
    try {
      console.log("🔄 Lancement du rafraîchissement manuel...");
      await refresh();
      mutateAuth();
      setLastRefresh(new Date());

      // Rescheduler le prochain rafraîchissement automatique
      if (autoRefreshEnabled) {
        scheduleAutoRefresh();
      }

      console.log("✅ Token rafraîchi avec succès");
    } catch (err) {
      console.error("❌ Erreur rafraîchissement:", err);
      // En cas d'erreur, on désactive le rafraîchissement auto
      setAutoRefreshEnabled(false);
    }
  }, [refresh, mutateAuth, autoRefreshEnabled, scheduleAutoRefresh]);

  const handleTestConnection = useCallback(async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await testConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  }, [testConnection]);

  const toggleAutoRefresh = useCallback(() => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);

    if (newState && isAuthenticated) {
      scheduleAutoRefresh();
    } else if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }
  }, [autoRefreshEnabled, isAuthenticated, scheduleAutoRefresh]);

  const formatDate = (dateString) => {
    if (!dateString) return "Non disponible";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTimeRemaining = (dateString) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const target = new Date(dateString);
    const diff = target - now;

    if (diff <= 0) return "Maintenant";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  // Composants internes
  const ConnectionStatus = () => {
    if (isLoading) {
      return (
        <div className="threeshape-dashboard-status loading">
          <RefreshCw className="animate-spin" size={20} />
          <span>Connexion en cours...</span>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="threeshape-dashboard-status connected">
          <CheckCircle size={20} />
          <div className="status-details">
            <span>Connecté à 3Shape</span>
            {hasToken && <span className="token-status">Token actif</span>}
            {lastRefresh && (
              <span className="refresh-info">
                Rafraîchi: {formatDate(lastRefresh)}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="threeshape-dashboard-status disconnected">
        <AlertCircle size={20} />
        <span>Non connecté à 3Shape</span>
      </div>
    );
  };

  const AutoRefreshCard = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="threeshape-dashboard-card">
        <div className="card-header">
          <Clock size={20} />
          <h3>Rafraîchissement Automatique</h3>
        </div>
        <div className="card-content">
          <div className="auto-refresh-section">
            <div className="auto-refresh-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={toggleAutoRefresh}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  Rafraîchissement automatique
                </span>
              </label>
              <span
                className={`toggle-status ${
                  autoRefreshEnabled ? "enabled" : "disabled"
                }`}
              >
                {autoRefreshEnabled ? "Activé" : "Désactivé"}
              </span>
            </div>

            {autoRefreshEnabled && (
              <div className="refresh-timers">
                <div className="timer-item">
                  <span className="timer-label">Dernier rafraîchissement:</span>
                  <span className="timer-value">
                    {lastRefresh ? formatDate(lastRefresh) : "En attente..."}
                  </span>
                </div>
                <div className="timer-item">
                  <span className="timer-label">
                    Prochain rafraîchissement:
                  </span>
                  <span className="timer-value countdown">
                    {nextRefresh
                      ? formatTimeRemaining(nextRefresh)
                      : "Calcul..."}
                  </span>
                </div>
              </div>
            )}

            <div className="refresh-actions">
              <button
                onClick={handleRefresh}
                className="threeshape-btn secondary small"
              >
                <RefreshCw size={16} />
                Rafraîchir maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AuthStatusCard = () => {
    return (
      <div className="threeshape-dashboard-card">
        <div className="card-header">
          <Activity size={20} />
          <h3>Statut de Connexion</h3>
        </div>
        <div className="card-content">
          <div className="auth-details">
            <div className="auth-field">
              <label>État :</label>
              <span
                className={`status-badge ${
                  isAuthenticated ? "authenticated" : "not-authenticated"
                }`}
              >
                {isAuthenticated ? "Authentifié" : "Non authentifié"}
              </span>
            </div>
            <div className="auth-field">
              <label>Token :</label>
              <span
                className={`status-badge ${
                  hasToken ? "has-token" : "no-token"
                }`}
              >
                {hasToken ? "Présent" : "Absent"}
              </span>
            </div>
            <div className="auth-field">
              <label>Rafraîchissement auto :</label>
              <span
                className={`status-badge ${
                  autoRefreshEnabled ? "auto-enabled" : "auto-disabled"
                }`}
              >
                {autoRefreshEnabled ? "Activé" : "Désactivé"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TestConnectionCard = () => {
    return (
      <div className="threeshape-dashboard-card">
        <div className="card-header">
          <Server size={20} />
          <h3>Test de Connexion</h3>
        </div>
        <div className="card-content">
          <div className="test-section">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !isAuthenticated}
              className="threeshape-btn test-btn"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Test en cours...
                </>
              ) : (
                <>
                  <Activity size={18} />
                  Tester la connexion API
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`test-result ${
                  testResult.success ? "success" : "error"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>
                  {testResult.success
                    ? "Connexion API réussie"
                    : `Erreur: ${testResult.error}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ActionsCard = () => (
    <div className="threeshape-dashboard-card">
      <div className="card-header">
        <Database size={20} />
        <h3>Actions</h3>
      </div>
      <div className="card-content">
        <div className="action-buttons">
          {!isAuthenticated ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="threeshape-btn primary"
            >
              <Link2 size={18} />
              Se connecter à 3Shape
            </button>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                className="threeshape-btn secondary"
              >
                <RefreshCw size={18} />
                Rafraîchir maintenant
              </button>
              <button
                onClick={handleDisconnect}
                className="threeshape-btn danger"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const StatsCard = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="threeshape-dashboard-card">
        <div className="card-header">
          <User size={20} />
          <h3>Statistiques</h3>
        </div>
        <div className="card-content">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">✓</div>
              <div className="stat-label">Connecté</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{hasToken ? "✓" : "✗"}</div>
              <div className="stat-label">Token</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {testResult?.success ? "✓" : "..."}
              </div>
              <div className="stat-label">API</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{autoRefreshEnabled ? "✓" : "✗"}</div>
              <div className="stat-label">Auto Refresh</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="threeshape-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <Link2 size={28} />
          <div>
            <h1>Tableau de bord 3Shape</h1>
            <p className="header-subtitle">
              Gestion de la connexion OAuth et des données
            </p>
          </div>
        </div>
        <ConnectionStatus />
      </div>

      {error && (
        <div className="threeshape-dashboard-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={clearError} className="error-close">
            ×
          </button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <AuthStatusCard />
          <AutoRefreshCard />
          <TestConnectionCard />
          <StatsCard />
          <ActionsCard />
        </div>
      </div>

      {isAuthenticated && (
        <div className="dashboard-footer">
          <div className="footer-info">
            <Info size={16} />
            <span>
              Connexion OAuth 2.0 sécurisée - Rafraîchissement automatique
              toutes les 15 minutes
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeShapeDashboard;
