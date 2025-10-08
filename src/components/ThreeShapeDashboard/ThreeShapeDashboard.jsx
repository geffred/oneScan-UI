// ThreeShapeDashboard.js
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
  Shield,
  Zap,
} from "lucide-react";
import useThreeShapeAuth from "../../components/Config/useThreeShapeAuth";
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
    hasRefreshToken,
    secondsUntilExpiry,
    autoRefreshEnabled,
    isTokenExpiringSoon,
    timeUntilExpiryFormatted,
    initiateAuth,
    logout,
    refresh,
    refreshToken,
    clearError,
    testConnection,
  } = useThreeShapeAuth();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Handlers
  const handleConnect = useCallback(async () => {
    try {
      await initiateAuth();
    } catch (err) {
      console.error("Erreur connexion:", err);
    }
  }, [initiateAuth]);

  const handleDisconnect = useCallback(async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir vous déconnecter de 3Shape ?")
    ) {
      try {
        await logout();
        setTestResult(null);
        setLastRefresh(null);
      } catch (err) {
        console.error("Erreur déconnexion:", err);
      }
    }
  }, [logout]);

  const handleRefresh = useCallback(async () => {
    try {
      console.log("🔄 Lancement du rafraîchissement manuel...");
      await refresh();
      setLastRefresh(new Date());
      console.log("Statut rafraîchi avec succès");
    } catch (err) {
      console.error(" Erreur rafraîchissement:", err);
    }
  }, [refresh]);

  const handleRefreshToken = useCallback(async () => {
    try {
      setIsRefreshingToken(true);
      await refreshToken();
      setLastRefresh(new Date());
    } catch (err) {
      console.error(" Erreur rafraîchissement token:", err);
    } finally {
      setIsRefreshingToken(false);
    }
  }, [refreshToken]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "Non disponible";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <div className="status-subdetails">
              {hasToken && <span className="token-status">Token actif</span>}
              {secondsUntilExpiry > 0 && (
                <span
                  className={`expiry-status ${
                    isTokenExpiringSoon ? "warning" : "normal"
                  }`}
                >
                  Expire dans: {timeUntilExpiryFormatted}
                </span>
              )}
              {lastRefresh && (
                <span className="refresh-info">
                  Rafraîchi: {formatDate(lastRefresh)}
                </span>
              )}
            </div>
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

  const TokenStatusCard = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="threeshape-dashboard-card">
        <div className="card-header">
          <Shield size={20} />
          <h3>Statut du Token</h3>
        </div>
        <div className="card-content">
          <div className="token-details">
            <div className="token-field">
              <label>Token d'accès :</label>
              <span
                className={`status-badge ${
                  hasToken ? "has-token" : "no-token"
                }`}
              >
                {hasToken ? "✅ Présent" : " Absent"}
              </span>
            </div>
            <div className="token-field">
              <label>Refresh Token :</label>
              <span
                className={`status-badge ${
                  hasRefreshToken ? "has-token" : "no-token"
                }`}
              >
                {hasRefreshToken ? "✅ Présent" : " Absent"}
              </span>
            </div>
            <div className="token-field">
              <label>Temps restant :</label>
              <span
                className={`status-badge ${
                  isTokenExpiringSoon ? "expiring" : "valid"
                }`}
              >
                {timeUntilExpiryFormatted}
              </span>
            </div>
            <div className="token-field">
              <label>Rafraîchissement auto :</label>
              <span
                className={`status-badge ${
                  autoRefreshEnabled ? "auto-enabled" : "auto-disabled"
                }`}
              >
                {autoRefreshEnabled ? "✅ Activé" : " Désactivé"}
              </span>
            </div>
          </div>

          {isTokenExpiringSoon && (
            <div className="token-warning">
              <AlertCircle size={16} />
              <span>
                Le token expire bientôt. Rafraîchissement automatique en
                cours...
              </span>
            </div>
          )}

          <div className="token-actions">
            <button
              onClick={handleRefreshToken}
              disabled={isRefreshingToken || !hasRefreshToken}
              className="threeshape-btn secondary small"
            >
              {isRefreshingToken ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Rafraîchissement...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Rafraîchir le token
                </>
              )}
            </button>
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
              <label>Authentification :</label>
              <span
                className={`status-badge ${
                  isAuthenticated ? "authenticated" : "not-authenticated"
                }`}
              >
                {isAuthenticated ? " Authentifié" : " Non authentifié"}
              </span>
            </div>
            <div className="auth-field">
              <label>Dernière vérification :</label>
              <span className="status-value">
                {lastRefresh ? formatDate(lastRefresh) : "Jamais"}
              </span>
            </div>
            <div className="auth-field">
              <label>Refresh Token :</label>
              <span
                className={`status-badge ${
                  hasRefreshToken ? "has-token" : "no-token"
                }`}
              >
                {hasRefreshToken ? " Disponible" : " Indisponible"}
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
                    ? testResult.message || "Connexion API réussie"
                    : `Erreur: ${testResult.error || testResult.message}`}
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
            <div className="action-buttons-grid">
              <button
                onClick={handleRefresh}
                className="threeshape-btn secondary"
              >
                <RefreshCw size={18} />
                Actualiser le statut
              </button>
              <button
                onClick={handleRefreshToken}
                disabled={isRefreshingToken || !hasRefreshToken}
                className="threeshape-btn secondary"
              >
                {isRefreshingToken ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Zap size={18} />
                )}
                Rafraîchir le token
              </button>
              <button
                onClick={handleDisconnect}
                className="threeshape-btn danger"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
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
              <div className="stat-value">{isAuthenticated ? "ok" : "x"}</div>
              <div className="stat-label">Authentifié</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{hasToken ? "ok" : "x"}</div>
              <div className="stat-label">Token</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{hasRefreshToken ? "ok" : "x"}</div>
              <div className="stat-label">Refresh</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {autoRefreshEnabled ? "ok" : "x"}
              </div>
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
              Gestion de la connexion OAuth et prévention des déconnexions
              automatiques
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
          <TokenStatusCard />
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
              Système de rafraîchissement automatique activé - Le token sera
              rafraîchi automatiquement avant expiration
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeShapeDashboard;
