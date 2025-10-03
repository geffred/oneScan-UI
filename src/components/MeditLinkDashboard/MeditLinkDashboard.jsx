// MeditLinkDashboard.js - Version nettoyée
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
  User,
  Info,
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
    userInfo,
  } = useMeditLinkAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // SWR pour les données utilisateur et statut
  const { data: authData, mutate: mutateAuth } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/meditlink/auth/status` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: userData } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/meditlink/user/me` : null,
    fetcher
  );

  const mergedAuthStatus = authData || authStatus;
  const mergedUserInfo = userData || userInfo;

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
      window.confirm("Êtes-vous sûr de vouloir vous déconnecter de MeditLink ?")
    ) {
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
        <div className="meditlink-dashboard-status loading">
          <RefreshCw className="animate-spin" size={20} />
          <span>Connexion en cours...</span>
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
          <div className="status-details">
            <span>Connecté à MeditLink</span>
            {isExpiringSoon && (
              <span className="time-remaining">⚠️ Bientôt expiré</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="meditlink-dashboard-status disconnected">
        <AlertCircle size={20} />
        <span>Non connecté à MeditLink</span>
      </div>
    );
  };

  const UserInfoCard = () => {
    if (!mergedUserInfo || !isAuthenticated) return null;

    return (
      <div className="meditlink-dashboard-card">
        <div className="card-header">
          <User size={20} />
          <h3>Informations Utilisateur</h3>
        </div>
        <div className="card-content">
          <div className="user-details">
            <div className="user-field">
              <label>Nom :</label>
              <span>{mergedUserInfo.name || "Non spécifié"}</span>
            </div>
            <div className="user-field">
              <label>Email :</label>
              <span>{mergedUserInfo.email || "Non spécifié"}</span>
            </div>
            <div className="user-field">
              <label>ID :</label>
              <span className="user-id">
                {mergedUserInfo.id || "Non spécifié"}
              </span>
            </div>
            {mergedUserInfo.company && (
              <div className="user-field">
                <label>Entreprise :</label>
                <span>{mergedUserInfo.company}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AuthStatusCard = () => {
    return (
      <div className="meditlink-dashboard-card">
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
              <label>Dernière mise à jour :</label>
              <span>{formatDate(new Date().toISOString())}</span>
            </div>
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
              Se connecter à MeditLink
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
                {isRefreshing ? "Rafraîchissement..." : "Rafraîchir"}
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
          <div>
            <h1>Tableau de bord MeditLink</h1>
            <p className="header-subtitle">
              Gestion de la connexion OAuth et des données
            </p>
          </div>
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
          <UserInfoCard />
          <ActionsCard />
        </div>
      </div>

      {isAuthenticated && (
        <div className="dashboard-footer">
          <div className="footer-info">
            <Info size={16} />
            <span>
              Connexion sécurisée OAuth 2.0 - Les tokens sont automatiquement
              rafraîchis avant expiration
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditLinkDashboard;
