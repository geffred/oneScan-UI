// MeditLinkAuthService.js
// Service d'authentification dédié pour MeditLink OAuth

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class MeditLinkAuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/meditlink`;
    this.authStatus = null;
    this.userInfo = null;
    this.callbacks = new Set();
  }

  // ================== GESTION DES ÉVÉNEMENTS ==================

  /**
   * Ajoute un callback pour les changements d'état d'authentification
   */
  onAuthStatusChange(callback) {
    this.callbacks.add(callback);

    // Retourne une fonction pour supprimer le callback
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notifie tous les callbacks des changements d'état
   */
  notifyStatusChange(status) {
    this.authStatus = status;
    this.callbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Erreur dans le callback d'authentification:", error);
      }
    });
  }

  // ================== MÉTHODES D'AUTHENTIFICATION ==================

  /**
   * Initie le processus d'authentification OAuth
   */
  async initiateAuth() {
    try {
      console.log("🚀 Initiation de l'authentification MeditLink OAuth");

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.authUrl) {
        throw new Error(data.error || "URL d'authentification non reçue");
      }

      console.log("✅ URL d'authentification générée avec succès");
      return data.authUrl;
    } catch (error) {
      console.error("❌ Erreur lors de l'initiation OAuth:", error);
      throw new Error(
        `Impossible d'initier l'authentification: ${error.message}`
      );
    }
  }

  /**
   * Traite le callback OAuth
   */
  async handleCallback(code, state = null) {
    try {
      console.log("🔄 Traitement du callback OAuth...", {
        code: code?.substring(0, 10) + "...",
        state,
      });

      // Préparer les paramètres
      const params = new URLSearchParams();
      params.append("code", code);

      if (state && state.trim() !== "" && state !== "null") {
        params.append("state", state);
      }

      const response = await fetch(`${this.baseUrl}/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Erreur lors du callback"
        );
      }

      console.log("✅ Callback traité avec succès");

      // Mettre à jour les informations locales
      this.userInfo = data.user;

      // Récupérer le statut complet
      await this.refreshAuthStatus();

      return data;
    } catch (error) {
      console.error("❌ Erreur lors du callback:", error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'authentification actuel
   */
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/status`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const status = await response.json();

      this.authStatus = status;
      this.notifyStatusChange(status);

      return status;
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du statut:", error);

      // Retourner un statut par défaut en cas d'erreur
      const defaultStatus = {
        authenticated: false,
        error: error.message,
      };

      this.authStatus = defaultStatus;
      this.notifyStatusChange(defaultStatus);

      return defaultStatus;
    }
  }

  /**
   * Rafraîchit le statut d'authentification
   */
  async refreshAuthStatus() {
    return this.checkAuthStatus();
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseUrl}/user/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const userInfo = await response.json();

      this.userInfo = userInfo;
      return userInfo;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des infos utilisateur:",
        error
      );
      throw error;
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  async refreshToken() {
    try {
      console.log("🔄 Rafraîchissement du token...");

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du rafraîchissement");
      }

      console.log("✅ Token rafraîchi avec succès");

      // Rafraîchir le statut après le refresh
      await this.refreshAuthStatus();

      return true;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du token:", error);
      throw error;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async logout() {
    try {
      console.log("🔓 Déconnexion MeditLink...");

      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.warn("Avertissement lors de la déconnexion:", data.error);
        // Continuer même en cas d'erreur côté serveur
      }

      // Nettoyer les données locales
      this.authStatus = { authenticated: false };
      this.userInfo = null;

      this.notifyStatusChange(this.authStatus);

      console.log("✅ Déconnexion locale terminée");
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);

      // Forcer la déconnexion locale même en cas d'erreur
      this.authStatus = { authenticated: false };
      this.userInfo = null;
      this.notifyStatusChange(this.authStatus);

      throw error;
    }
  }

  // ================== MÉTHODES UTILITAIRES ==================

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return this.authStatus?.authenticated === true;
  }

  /**
   * Récupère le statut d'authentification actuel (synchrone)
   */
  getAuthStatus() {
    return this.authStatus;
  }

  /**
   * Récupère les informations utilisateur actuelles (synchrone)
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Prolonge la session sans rafraîchir le token
   */
  async extendSession() {
    try {
      console.log("🕐 Prolongation de la session MeditLink...");

      const response = await fetch(`${this.baseUrl}/auth/extend-session`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la prolongation");
      }

      console.log("✅ Session prolongée avec succès");

      // Rafraîchir le statut après la prolongation
      await this.refreshAuthStatus();

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la prolongation de session:", error);
      throw error;
    }
  }

  /**
   * Vérifie si le token va expirer bientôt (sans le rafraîchir automatiquement)
   */
  isTokenExpiringSoon(minutes = 30) {
    if (!this.authStatus?.expiresAt) {
      return false;
    }

    const expiresAt = new Date(this.authStatus.expiresAt);
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();

    return timeDiff < minutes * 60 * 1000;
  }

  /**
   * Rafraîchit automatiquement le token si nécessaire (DÉSACTIVÉ)
   */
  async autoRefreshToken() {
    // Méthode désactivée - pas de rafraîchissement automatique
    console.log("🔄 Rafraîchissement automatique désactivé");
    return false;
  }

  /**
   * Démarre le rafraîchissement automatique des tokens
   */
  startAutoRefresh(intervalMinutes = 30) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.autoRefreshToken();
    }, intervalMinutes * 60 * 1000);

    console.log(
      `🔄 Rafraîchissement automatique démarré (${intervalMinutes} min)`
    );
  }

  /**
   * Arrête le rafraîchissement automatique
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log("⏹️ Rafraîchissement automatique arrêté");
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    this.stopAutoRefresh();
    this.callbacks.clear();
    this.authStatus = null;
    this.userInfo = null;
  }

  // ================== MÉTHODES DE DEBUG ==================

  /**
   * Récupère les détails du token pour le debug
   */
  async getTokenDetails() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token-debug`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const details = await response.json();
      return details;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des détails du token:",
        error
      );
      throw error;
    }
  }

  /**
   * Affiche l'état complet du service (pour debug)
   */
  debugStatus() {
    console.log("🐛 État du service MeditLink:", {
      authStatus: this.authStatus,
      userInfo: this.userInfo,
      isAuthenticated: this.isAuthenticated(),
      callbacksCount: this.callbacks.size,
      hasRefreshInterval: !!this.refreshInterval,
    });
  }
}

// Instance singleton
const meditLinkAuthService = new MeditLinkAuthService();

export default meditLinkAuthService;
