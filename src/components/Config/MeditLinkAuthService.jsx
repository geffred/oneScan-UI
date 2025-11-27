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
   * HELPER : Génère les headers d'authentification
   * Pour MeditLink, on utilise à la fois JWT ET cookies
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
        credentials: "include", // IMPORTANT : envoyer les cookies
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Erreur initiation OAuth: ${errText}`);
      }

      const data = await res.json();

      if (data.success && data.authUrl) {
        // Sauvegarder le token JWT avant redirection
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          sessionStorage.setItem("preserve_jwt", currentToken);
          console.debug("Token JWT sauvegardé avant redirection MeditLink");
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
   * CORRECTION CRITIQUE : utilise credentials: "include" pour envoyer les cookies
   */
  async handleCallback(code, state = null) {
    try {
      // Restauration du token JWT AVANT l'appel
      const savedToken = sessionStorage.getItem("preserve_jwt");
      if (savedToken) {
        localStorage.setItem("token", savedToken);
        sessionStorage.removeItem("preserve_jwt");
        console.debug("Token JWT restauré avant callback");
      }

      const params = new URLSearchParams({ code });
      if (state) params.append("state", state);

      const res = await fetch(`${this.baseUrl}/auth/callback`, {
        method: "POST",
        credentials: "include", // CORRECTION : envoyer les cookies
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Ajouter le JWT si disponible
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: params.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Session expirée pendant l'authentification MeditLink. Veuillez vous reconnecter."
          );
        }
        const message =
          data?.message || data?.error || `Erreur callback: ${res.status}`;
        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(
          data?.message || data?.error || "Callback OAuth non réussi"
        );
      }

      // Rafraîchir le statut
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
        credentials: "include", // IMPORTANT : envoyer les cookies
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
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
        credentials: "include", // IMPORTANT : envoyer les cookies
        headers: this.getAuthHeaders(),
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
