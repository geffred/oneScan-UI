const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction pour obtenir le token du localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Fonction pour vérifier si le token est expiré
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Fonction pour déconnecter l'utilisateur si le token est invalide
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  window.location.href = "/login";
};

// Fonction générique pour faire des requêtes API avec authentification
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  // Vérifier si le token est expiré avant de faire la requête
  if (token && isTokenExpired(token)) {
    handleUnauthorized();
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Ajouter le token JWT si disponible
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Gérer les erreurs 401 (Non autorisé)
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Non autorisé, veuillez vous reconnecter");
    }

    // Gérer les autres erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    // Retourner la réponse JSON
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
};

// Fonctions spécifiques pour chaque méthode HTTP
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: "GET",
    ...options,
  });
};

export const apiPost = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
};

export const apiPut = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
};

export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: "DELETE",
    ...options,
  });
};

// Fonctions spécifiques pour les cabinets
export const cabinetApi = {
  // Récupérer le profil du cabinet connecté
  getProfile: () => apiGet("/cabinet/auth/profile"),

  // Récupérer tous les cabinets (pour laboratoire)
  getAll: () => apiGet("/cabinet"),

  // Récupérer un cabinet par ID
  getById: (id) => apiGet(`/cabinet/${id}`),

  // Créer un nouveau cabinet (pour laboratoire)
  create: (cabinetData) => apiPost("/cabinet", cabinetData),

  // Mettre à jour un cabinet
  update: (id, cabinetData) => apiPut(`/cabinet/${id}`, cabinetData),

  // Supprimer un cabinet
  delete: (id) => apiDelete(`/cabinet/${id}`),

  // Changer le mot de passe
  changePassword: (currentPassword, newPassword) =>
    apiPost("/cabinet/auth/change-password", null, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        currentPassword,
        newPassword,
      }).toString(),
    }),

  // Régénérer le mot de passe (pour laboratoire)
  regeneratePassword: (id) => apiPost(`/cabinet/${id}/regenerate-password`),

  // Marquer le mot de passe comme envoyé
  markPasswordSent: (cabinetId) =>
    apiPost(`/cabinet/${cabinetId}/mark-password-sent`),
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  cabinetApi,
};
