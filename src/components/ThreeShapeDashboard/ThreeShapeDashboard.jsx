// ThreeShapeDashboard.js - Nouveau composant
import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import useThreeShapeAuth from "../../components/Config/useThreeShapeAuth";
import "./ThreeShapeDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // SWR pour les données de statut
  const { data: authData, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/threeshape/auth/status`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const mergedAuthStatus = authData || authStatus;

  // Handlers
  const handleConnect = useCallback(async () => {
    try {
      await initiateAuth();
      mutateAuth();
    } catch (err) {
      console.error("Erreur connexion:", err);
    }
  }, [initiateAuth, mutateAuth]);

  const handleDisconnect = useCallback(async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir vous déconnecter de 3Shape ?")
    ) {
      try {
        await logout();
        mutateAuth(undefined, { revalidate: false });
        setTestResult(null);
      } catch (err) {
        console.error("Erreur déconnexion:", err);
      }
    }
  }, [logout, mutateAuth]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      mutateAuth();
    } catch (err) {
      console.error("Erreur rafraîchissement:", err);
    }
  }, [refresh, mutateAuth]);

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
            {hasToken && <span className="token-status">Token actif</span>}
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
              <label>Dernière mise à jour :</label>
              <span>{formatDate(new Date().toISOString())}</span>
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
                Rafraîchir
              </button>

              {/* <button
                onClick={() =>
                  window.open(
                    `${API_BASE_URL}/threeshape/cases?page=0`,
                    "_blank"
                  )
                }
                className="threeshape-btn info"
              >
                <Download size={18} />
                Voir les cas
              </button>

              <button
                onClick={handleDisconnect}
                className="threeshape-btn danger"
              >
                <LogOut size={18} />
                Déconnexion
              </button> */}
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
              Connexion OAuth 2.0 sécurisée - Accès aux cas et fichiers 3Shape
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeShapeDashboard;
