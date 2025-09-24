// MeditLinkDashboard.js - Version simplifiée
import React, { useState, useCallback } from "react";
import useSWR from "swr";
import {
  Shield,
  Activity,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogOut,
} from "lucide-react";
import useMeditLinkAuth from "../../components/Config/useMeditLinkAuth";
import "./MeditLinkDashboard.css";

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

const MeditLinkDashboard = () => {
  const {
    authStatus,
    isLoading,
    error,
    isAuthenticated,
    isExpiringSoon,
    initiateAuth,
    logout,
    refresh,
    clearError,
    getTokenDetails,
  } = useMeditLinkAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // SWR uniquement pour l’auth status
  const { data: authData, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/meditlink/auth/status`,
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
    if (window.confirm("Déconnecter de MeditLink ?")) {
      try {
        await logout();
        mutateAuth(undefined, { revalidate: false });
      } catch (err) {
        console.error("Erreur déconnexion:", err);
      }
    }
  }, [logout, mutateAuth]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refresh();
      mutateAuth();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, mutateAuth]);

  // Composants internes
  const ConnectionStatus = () => {
    if (isLoading) {
      return (
        <div className="meditlink-dashboard-status loading">
          <RefreshCw className="animate-spin" size={20} />
          <span>Connexion...</span>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div
          className={`meditlink-dashboard-status connected ${
            isExpiringSoon ? "expiring" : ""
          }`}
        >
          <CheckCircle size={20} />
          <span>Connecté{isExpiringSoon && " (expiration proche)"}</span>
        </div>
      );
    }

    return (
      <div className="meditlink-dashboard-status disconnected">
        <AlertCircle size={20} />
        <span>Non connecté</span>
      </div>
    );
  };

  const AuthStatusCard = () => {
    if (!mergedAuthStatus) return null;

    return (
      <div className="meditlink-dashboard-card">
        <div className="card-header">
          <Activity size={20} />
          <h3>Statut</h3>
        </div>
        <div className="card-content">
          <div className="auth-details">
            <div className="auth-field">
              <label>État:</label>
              <span
                className={`status-badge ${
                  isAuthenticated ? "authenticated" : "not-authenticated"
                }`}
              >
                {isAuthenticated ? "Authentifié" : "Non authentifié"}
              </span>
            </div>
            {mergedAuthStatus.expiresAt && (
              <div className="auth-field">
                <label>Expiration:</label>
                <span>
                  {new Date(mergedAuthStatus.expiresAt).toLocaleString("fr-FR")}
                  {isExpiringSoon && (
                    <span className="expiring-notice"> (bientôt)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ActionsCard = () => (
    <div className="meditlink-dashboard-card">
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
              className="meditlink-btn primary"
            >
              <Shield size={18} />
              Se connecter
            </button>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="meditlink-btn secondary"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Actualiser
              </button>

              <button
                onClick={handleDisconnect}
                className="meditlink-btn danger"
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

  return (
    <div className="meditlink-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <Shield size={28} />
          <h1>MeditLink</h1>
        </div>
        <ConnectionStatus />
      </div>

      {error && (
        <div className="meditlink-dashboard-error">
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
          <ActionsCard />
        </div>
      </div>
    </div>
  );
};

export default MeditLinkDashboard;
