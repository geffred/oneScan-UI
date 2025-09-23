// config/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Fonction utilitaire pour construire les URLs
export const buildApiUrl = (endpoint) => {
  // En production, utiliser l'URL complète
  if (import.meta.env.PROD) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // En développement, utiliser le proxy
  return endpoint;
};

// Client API avec gestion d'authentification
export const apiClient = {
  async request(url, options = {}) {
    const fullUrl = buildApiUrl(url);
    const token = localStorage.getItem("token");

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include",
    };

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async get(url) {
    return this.request(url, { method: "GET" });
  },

  async post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put(url, data) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(url) {
    return this.request(url, { method: "DELETE" });
  },

  async upload(url, formData) {
    const fullUrl = buildApiUrl(url);
    const token = localStorage.getItem("token");

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload error! status: ${response.status}`);
    }

    return response.json();
  },
};
