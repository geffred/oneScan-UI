// ThreeShapeAuthService.js
// Service d'authentification dédié pour 3Shape OAuth

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ThreeShapeAuthService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.authStatus = null;
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
        console.error(
          "Erreur dans le callback d'authentification 3Shape:",
          error
        );
      }
    });
  }

  // ================== MÉTHODES D'AUTHENTIFICATION ==================

  /**
   * Initie le processus d'authentification OAuth pour 3Shape
   */
  async initiateAuth() {
    try {
      console.log("🚀 Initiation de l'authentification 3Shape OAuth");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const htmlContent = await response.text();

      // Extraire l'URL d'authentification du HTML
      const urlMatch = htmlContent.match(/href="([^"]+)"/);
      if (!urlMatch || !urlMatch[1]) {
        throw new Error("URL d'authentification non trouvée dans la réponse");
      }

      const authUrl = urlMatch[1];
      console.log("✅ URL d'authentification 3Shape générée avec succès");
      return authUrl;
    } catch (error) {
      console.error("❌ Erreur lors de l'initiation OAuth 3Shape:", error);
      throw new Error(
        `Impossible d'initier l'authentification 3Shape: ${error.message}`
      );
    }
  }

  /**
   * Traite le callback OAuth pour 3Shape
   */
  async handleCallback(code, state = null) {
    try {
      console.log("🔄 Traitement du callback OAuth 3Shape...", {
        code: code?.substring(0, 10) + "...",
        state,
      });

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      // Construire l'URL avec les paramètres
      const url = `${this.baseUrl}/callback?code=${encodeURIComponent(code)}${
        state ? `&state=${encodeURIComponent(state)}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur HTTP ${response.status}: ${
            errorText || "Erreur lors du callback"
          }`
        );
      }

      const responseText = await response.text();

      // Vérifier si la réponse indique un succès
      if (
        responseText.includes("Connexion réussie") ||
        responseText.includes("✅") ||
        response.status === 200
      ) {
        console.log("✅ Callback 3Shape traité avec succès");

        // Récupérer le statut complet après succès
        await this.refreshAuthStatus();

        return {
          success: true,
          message: "Authentification 3Shape réussie",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Réponse inattendue du serveur 3Shape");
      }
    } catch (error) {
      console.error("❌ Erreur lors du callback 3Shape:", error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'authentification actuel
   */
  async checkAuthStatus() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${this.baseUrl}/auth/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      console.error(
        "❌ Erreur lors de la vérification du statut 3Shape:",
        error
      );

      // Retourner un statut par défaut en cas d'erreur
      const defaultStatus = {
        authenticated: false,
        hasToken: false,
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
   * Récupère les cas depuis 3Shape
   */
  async getCases(page = 0) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${this.baseUrl}/cases?page=${page}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const cases = await response.json();
      return cases;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des cas 3Shape:", error);
      throw error;
    }
  }

  /**
   * Récupère les connexions 3Shape
   */
  async getConnections() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${this.baseUrl}/connections`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const connections = await response.json();
      return connections;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des connexions 3Shape:",
        error
      );
      throw error;
    }
  }

  /**
   * Télécharge un fichier d'attachment
   */
  async downloadAttachment(caseId, attachmentHash) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${this.baseUrl}/cases/${caseId}/attachments/${attachmentHash}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement 3Shape:", error);
      throw error;
    }
  }

  /**
   * Sauvegarde les cas en base de données
   */
  async saveAndFetchCases(startPage = 0, endPage = 1) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${this.baseUrl}/cases/save?startPage=${startPage}&endPage=${endPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des cas 3Shape:", error);
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
   * Vérifie si le token est présent
   */
  hasToken() {
    return this.authStatus?.hasToken === true;
  }

  /**
   * Teste la connexion avec le serveur 3Shape
   */
  async testConnection() {
    try {
      console.log("🔍 Test de connexion 3Shape...");

      const status = await this.checkAuthStatus();

      if (status.authenticated && status.hasToken) {
        console.log("✅ Connexion 3Shape active");
        return { success: true, message: "Connexion 3Shape active" };
      } else {
        console.log("❌ Connexion 3Shape inactive");
        return { success: false, message: "Connexion 3Shape inactive" };
      }
    } catch (error) {
      console.error("❌ Erreur lors du test de connexion 3Shape:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    this.callbacks.clear();
    this.authStatus = null;
  }

  // ================== MÉTHODES DE DEBUG ==================

  /**
   * Affiche l'état complet du service (pour debug)
   */
  debugStatus() {
    console.log("🐛 État du service 3Shape:", {
      authStatus: this.authStatus,
      isAuthenticated: this.isAuthenticated(),
      hasToken: this.hasToken(),
      callbacksCount: this.callbacks.size,
    });
  }

  /**
   * Récupère les détails de connexion pour le debug
   */
  async getConnectionDetails() {
    try {
      const status = await this.checkAuthStatus();
      return {
        ...status,
        timestamp: new Date().toISOString(),
        service: "3Shape",
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
        service: "3Shape",
        authenticated: false,
      };
    }
  }
}

// Instance singleton
const threeShapeAuthService = new ThreeShapeAuthService();

export default threeShapeAuthService;
