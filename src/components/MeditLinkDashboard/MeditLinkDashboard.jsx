// MeditLinkDashboard.js - Version mise à jour avec rafraîchissement fonctionnel
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
  Clock,
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
  const [lastRefresh, setLastRefresh] = useState(null);

  // SWR pour les données utilisateur et statut
  const { data: authData, mutate: mutateAuth } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/meditlink/auth/status` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const { data: userData } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/meditlink/user/me` : null,
    fetcher,
    { revalidateOnFocus: false }
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
        setLastRefresh(null);
      } catch (err) {
        console.error("Erreur déconnexion:", err);
      }
    }
  }, [logout, mutateAuth]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Appel direct à l'API de rafraîchissement
      const response = await fetch(`${API_BASE_URL}/meditlink/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Rafraîchir les données locales
        await refresh();
        mutateAuth();
        setLastRefresh(new Date().toISOString());
        console.log("✅ Token MeditLink rafraîchi avec succès");
      } else {
        throw new Error(result.error || "Erreur lors du rafraîchissement");
      }
    } catch (err) {
      console.error("❌ Erreur lors du rafraîchissement:", err);
      // En cas d'erreur, on essaie de rafraîchir quand même les données
      try {
        await refresh();
        mutateAuth();
      } catch (fallbackError) {
        console.error("❌ Erreur de fallback:", fallbackError);
      }
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

  const getTimeSinceLastRefresh = () => {
    if (!lastRefresh) return null;
    const now = new Date();
    const last = new Date(lastRefresh);
    const diffInMinutes = Math.floor((now - last) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes === 1) return "Il y a 1 minute";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minutes`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "Il y a 1 heure";
    return `Il y a ${diffInHours} heures`;
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
            {lastRefresh && (
              <span className="last-refresh">
                <Clock size={12} />
                {getTimeSinceLastRefresh()}
              </span>
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
            {lastRefresh && (
              <div className="auth-field">
                <label>Dernier rafraîchissement :</label>
                <span>{getTimeSinceLastRefresh()}</span>
              </div>
            )}
            {isExpiringSoon && isAuthenticated && (
              <div className="auth-field warning">
                <label>Attention :</label>
                <span className="warning-text">Le token expire bientôt</span>
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
              Se connecter à MeditLink
            </button>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="meditlink-btn secondary"
                title="Rafraîchir manuellement le token"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Rafraîchissement..." : "Rafraîchir le token"}
              </button>

              <button
                onClick={handleDisconnect}
                className="meditlink-btn danger"
                title="Se déconnecter de MeditLink"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          )}
        </div>

        {isAuthenticated && (
          <div className="refresh-info">
            <Info size={14} />
            <span>
              Le token est automatiquement rafraîchi avant expiration. Utilisez
              le bouton pour un rafraîchissement manuel.
            </span>
          </div>
        )}
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
              Connexion sécurisée OAuth 2.0 -
              {isExpiringSoon
                ? " Token bientôt expiré - rafraîchissement recommandé"
                : " Token valide - rafraîchissement automatique activé"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditLinkDashboard;
