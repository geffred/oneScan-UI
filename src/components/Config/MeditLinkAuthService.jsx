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
    this.callbacks.forEach((cb) => cb?.(status));
  }

  async initiateAuth() {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.success && data.authUrl) {
      sessionStorage.setItem("preserve_jwt", localStorage.getItem("token"));
      window.location.href = data.authUrl;
    } else throw new Error(data.error || "Erreur OAuth");
  }

  async handleCallback(code, state = null) {
    const params = new URLSearchParams({ code });
    if (state) params.append("state", state);

    const res = await fetch(`${this.baseUrl}/auth/callback`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok || !data.success)
      throw new Error(data.message || "Erreur callback");

    // Restaure le token utilisateur principal
    const savedToken = sessionStorage.getItem("preserve_jwt");
    if (savedToken && !localStorage.getItem("token")) {
      localStorage.setItem("token", savedToken);
      sessionStorage.removeItem("preserve_jwt");
    }

    await this.refreshAuthStatus();
    return data;
  }

  async checkAuthStatus() {
    const res = await fetch(`${this.baseUrl}/auth/status`, {
      credentials: "include",
    });
    const status = await res.json();
    this.notifyStatusChange(status);
    return status;
  }

  async refreshAuthStatus() {
    return this.checkAuthStatus();
  }

  async logout() {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    this.authStatus = { authenticated: false };
    this.userInfo = null;
    this.notifyStatusChange(this.authStatus);
  }

  isAuthenticated() {
    return this.authStatus?.authenticated;
  }
}

const meditLinkAuthService = new MeditLinkAuthService();
export default meditLinkAuthService;
