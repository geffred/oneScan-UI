/* eslint-disable no-empty */
// MeditLinkAuthService.js
/* eslint-disable no-console */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class MeditLinkAuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/meditlink`;
    this.authStatus = null;
    this.userInfo = null;
    this.callbacks = new Set();
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
    // Emission d'un event global (pratique pour le AuthProvider ou autres)
    try {
      window.dispatchEvent(
        new CustomEvent("meditlink:status", { detail: { status } })
      );
    } catch (e) {
      // ignore si non supporté — juste un utilitaire
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
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Erreur initiation OAuth: ${errText}`);
      }

      const data = await res.json();

      if (data.success && data.authUrl) {
        // On préserve le JWT actuel (même si null) sous forme explicite
        // afin de pouvoir le restaurer après le flow OAuth.
        // Rendre la clé explicite aide au debug.
        try {
          sessionStorage.setItem(
            "preserve_jwt",
            localStorage.getItem("token") ?? ""
          );
        } catch (e) {
          console.warn("Impossible de sauvegarder preserve_jwt:", e);
        }

        // On redirige vers l'URL fournie par l'API (flow OAuth externe)
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
   * - appelle le backend pour échanger le code
   * - restaure systématiquement le token sauvegardé (si présent dans sessionStorage)
   *   — on ne dépend plus de l'état actuel de localStorage pour éviter la race condition
   * - notifie le statut et retourne les données du backend
   */
  async handleCallback(code, state = null) {
    try {
      const params = new URLSearchParams({ code });
      if (state) params.append("state", state);

      const res = await fetch(`${this.baseUrl}/auth/callback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Si le backend retourne une erreur JSON utilisable, on l'affiche.
        const message = data?.message || `Erreur callback: ${res.status}`;
        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(data?.message || "Callback OAuth non réussi");
      }

      // --- RESTAURATION DU TOKEN PRINCIPAL (fix race condition) ---
      try {
        const savedToken = sessionStorage.getItem("preserve_jwt");

        // Si une valeur existe (même chaîne vide) on la traite.
        if (savedToken != null) {
          // Si c'est une chaîne vide => on ne restaure pas un token vide,
          // mais on nettoie la clé pour éviter réutilisation.
          if (savedToken === "") {
            // possible que l'utilisateur n'avait pas de token avant l'OAuth
            sessionStorage.removeItem("preserve_jwt");
          } else {
            // On restaure le token quoi qu'il arrive (ne pas tester localStorage)
            try {
              localStorage.setItem("token", savedToken);
              sessionStorage.removeItem("preserve_jwt");
              console.debug("MeditLink: token restauré depuis sessionStorage");
            } catch (e) {
              console.warn("MeditLink: impossible de restaurer le token :", e);
            }
          }
        }
      } catch (e) {
        console.warn(
          "MeditLink: erreur lors de la tentative de restauration du token :",
          e
        );
      }

      // Rafraîchir le statut depuis l'API MeditLink
      await this.refreshAuthStatus();

      // Notifier composants externes que l'on est revenu du flow OAuth
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
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Erreur status MeditLink: ${text}`);
      }

      const status = await res.json();
      this.notifyStatusChange(status);
      return status;
    } catch (err) {
      console.error("MeditLink checkAuthStatus error:", err);
      // notifie un status "non authentifié" si on a une erreur réseau/serveur
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

      // Émettre un event global pour que l'app principale puisse réagir (ex: nettoyage)
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
