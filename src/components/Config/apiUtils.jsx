const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction pour obtenir le token JWT
const getAuthToken = () => localStorage.getItem("token");

// Vérifie si le token est expiré
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Déconnexion locale (ne touche pas aux cookies)
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  window.location.href = "/login";
};

// Requête API générique avec JWT
export const apiRequest = async (endpoint, options = {}) => {
  let token = getAuthToken();

  if (token && isTokenExpired(token)) {
    handleUnauthorized();
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "omit", // IMPORTANT : ne pas envoyer de cookies pour éviter conflit OAuth
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Non autorisé, veuillez vous reconnecter");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

// Fonctions HTTP
export const apiGet = (endpoint, options = {}) =>
  apiRequest(endpoint, { method: "GET", ...options });

export const apiPost = (endpoint, data, options = {}) =>
  apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });

export const apiPut = (endpoint, data, options = {}) =>
  apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });

export const apiDelete = (endpoint, options = {}) =>
  apiRequest(endpoint, { method: "DELETE", ...options });

// Exemple API cabinet
export const cabinetApi = {
  getProfile: () => apiGet("/cabinet/auth/profile"),
  getAll: () => apiGet("/cabinet"),
  getById: (id) => apiGet(`/cabinet/${id}`),
  create: (data) => apiPost("/cabinet", data),
  update: (id, data) => apiPut(`/cabinet/${id}`, data),
  delete: (id) => apiDelete(`/cabinet/${id}`),
  changePassword: (currentPassword, newPassword) =>
    apiPost("/cabinet/auth/change-password", null, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ currentPassword, newPassword }).toString(),
    }),
  regeneratePassword: (id) => apiPost(`/cabinet/${id}/regenerate-password`),
  markPasswordSent: (id) => apiPost(`/cabinet/${id}/mark-password-sent`),
};

export default { apiRequest, apiGet, apiPost, apiPut, apiDelete, cabinetApi };
