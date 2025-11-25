/* eslint-disable no-empty */
/* eslint-disable no-console */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class MeditLinkAuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/meditlink`;
    this.authStatus = null;
    this.userInfo = null;
    this.callbacks = new Set();
  }

  /**
   * 🛠️ HELPER : Génère les headers d'authentification
   * Récupère le token JWT du localStorage pour authentifier la requête
   * auprès de votre backend Spring Boot.
   */
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  notifyStatusChange(status) {
    this.authStatus = status;
    this.callbacks.forEach((cb) => {
      try {
        cb?.(status);
      } catch (err) {
        console.error("MeditLink callback error:", err);
      }
    });
    // Emission d'un event global
    try {
      window.dispatchEvent(
        new CustomEvent("meditlink:status", { detail: { status } })
      );
    } catch (e) {
      // ignore si non supporté
    }
  }

  onStatusChange(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  async initiateAuth() {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        credentials: "include",
        headers: this.getAuthHeaders(), // <--- AJOUT DES HEADERS JWT
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Erreur initiation OAuth: ${errText}`);
      }

      const data = await res.json();

      if (data.success && data.authUrl) {
        // On préserve le JWT actuel pour le restaurer au retour
        try {
          sessionStorage.setItem(
            "preserve_jwt",
            localStorage.getItem("token") ?? ""
          );
        } catch (e) {
          console.warn("Impossible de sauvegarder preserve_jwt:", e);
        }

        // Redirection vers MeditLink
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || "Réponse inattendue du serveur OAuth");
      }
    } catch (err) {
      console.error("MeditLink initiateAuth error:", err);
      throw err;
    }
  }

  /**
   * handleCallback :
   * Appelle le backend pour échanger le code.
   * C'est ici que l'erreur 401 se produisait car le fetch manquait de token.
   */
  async handleCallback(code, state = null) {
    try {
      // --- RESTAURATION PRÉVENTIVE DU TOKEN ---
      // On restaure le token AVANT l'appel fetch pour être sûr d'être authentifié
      const savedToken = sessionStorage.getItem("preserve_jwt");
      if (savedToken) {
        localStorage.setItem("token", savedToken);
        sessionStorage.removeItem("preserve_jwt");
        console.debug("MeditLink: token restauré avant l'appel callback");
      }

      const params = new URLSearchParams({ code });
      if (state) params.append("state", state);

      const res = await fetch(`${this.baseUrl}/auth/callback`, {
        method: "POST",
        credentials: "include",
        // Fusion des headers (Content-Type form + Authorization Bearer)
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...this.getAuthHeaders(), // <--- CORRECTION CRITIQUE DU 401
        },
        body: params.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Gestion spécifique 401/403
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Session expirée pendant l'authentification MeditLink. Veuillez vous reconnecter à l'application."
          );
        }
        const message = data?.message || `Erreur callback: ${res.status}`;
        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(data?.message || "Callback OAuth non réussi");
      }

      // Rafraîchir le statut depuis l'API MeditLink
      await this.refreshAuthStatus();

      try {
        window.dispatchEvent(
          new CustomEvent("meditlink:callback", { detail: data })
        );
      } catch (e) {
        // noop
      }

      return data;
    } catch (err) {
      console.error("MeditLink handleCallback error:", err);
      throw err;
    }
  }

  async checkAuthStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/auth/status`, {
        credentials: "include",
        headers: this.getAuthHeaders(), // <--- AJOUT DES HEADERS JWT
      });

      if (!res.ok) {
        // Si 401, on considère simplement que l'utilisateur n'est pas authentifié MeditLink (ou App)
        if (res.status === 401) {
          this.notifyStatusChange({ authenticated: false });
          return { authenticated: false };
        }
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Erreur status MeditLink: ${text}`);
      }

      const status = await res.json();
      this.notifyStatusChange(status);
      return status;
    } catch (err) {
      console.error("MeditLink checkAuthStatus error:", err);
      const fallback = { authenticated: false, error: err.message };
      this.notifyStatusChange(fallback);
      return fallback;
    }
  }

  async refreshAuthStatus() {
    return this.checkAuthStatus();
  }

  async logout() {
    try {
      const res = await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: this.getAuthHeaders(), // <--- AJOUT DES HEADERS JWT
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        console.warn("MeditLink logout non OK:", txt);
      }
    } catch (err) {
      console.warn("MeditLink logout erreur:", err);
    } finally {
      this.authStatus = { authenticated: false };
      this.userInfo = null;
      this.notifyStatusChange(this.authStatus);

      try {
        window.dispatchEvent(new CustomEvent("meditlink:loggedout"));
      } catch (e) {}
    }
  }

  isAuthenticated() {
    return !!this.authStatus?.authenticated;
  }
}

const meditLinkAuthService = new MeditLinkAuthService();
export default meditLinkAuthService;
