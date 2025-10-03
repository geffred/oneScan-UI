// MeditLinkDashboard.js - Version complète avec toutes les informations
import React, { useState, useCallback, useEffect } from "react";
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
  Calendar,
  Clock,
  Info,
  Server,
  Download,
  Upload,
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
    userInfo,
  } = useMeditLinkAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);

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

  // Récupérer les détails du token
  useEffect(() => {
    if (isAuthenticated && getTokenDetails) {
      const details = getTokenDetails();
      setTokenDetails(details);
    }
  }, [isAuthenticated, getTokenDetails]);

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
        setTokenDetails(null);
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
      // Recharger les détails du token après rafraîchissement
      if (getTokenDetails) {
        const details = getTokenDetails();
        setTokenDetails(details);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, mutateAuth, getTokenDetails]);

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

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = expires - now;

    if (remaining <= 0) return "Expiré";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
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
      const timeRemaining = tokenDetails?.expiresAt
        ? getTimeRemaining(tokenDetails.expiresAt)
        : null;

      return (
        <div
          className={`meditlink-dashboard-status connected ${
            isExpiringSoon ? "expiring" : ""
          }`}
        >
          <CheckCircle size={20} />
          <div className="status-details">
            <span>Connecté à MeditLink</span>
            {timeRemaining && (
              <span className="time-remaining">
                {isExpiringSoon ? "⚠️ " : ""}
                {timeRemaining}
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
            {mergedUserInfo.role && (
              <div className="user-field">
                <label>Rôle :</label>
                <span className="role-badge">{mergedUserInfo.role}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TokenInfoCard = () => {
    if (!isAuthenticated || !tokenDetails) return null;

    return (
      <div className="meditlink-dashboard-card">
        <div className="card-header">
          <Shield size={20} />
          <h3>Informations Token</h3>
        </div>
        <div className="card-content">
          <div className="token-details">
            <div className="token-field">
              <label>Créé le :</label>
              <span>{formatDate(tokenDetails.issuedAt)}</span>
            </div>
            <div className="token-field">
              <label>Expire le :</label>
              <span className={isExpiringSoon ? "expiring" : ""}>
                {formatDate(tokenDetails.expiresAt)}
                {isExpiringSoon && " ⚠️"}
              </span>
            </div>
            <div className="token-field">
              <label>Temps restant :</label>
              <span>{getTimeRemaining(tokenDetails.expiresAt)}</span>
            </div>
            {tokenDetails.scopes && (
              <div className="token-field">
                <label>Scopes :</label>
                <span className="scopes-list">
                  {tokenDetails.scopes.join(", ")}
                </span>
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
            {mergedAuthStatus?.lastRefresh && (
              <div className="auth-field">
                <label>Dernier rafraîchissement :</label>
                <span>{formatDate(mergedAuthStatus.lastRefresh)}</span>
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
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Rafraîchissement..." : "Rafraîchir le token"}
              </button>

              <button
                onClick={() =>
                  window.open(
                    `${API_BASE_URL}/meditlink/cases?page=0&size=10`,
                    "_blank"
                  )
                }
                className="meditlink-btn info"
              >
                <Download size={18} />
                Voir les cas
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
          <TokenInfoCard />
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
