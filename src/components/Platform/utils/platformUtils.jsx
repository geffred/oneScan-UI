import { API_BASE_URL } from "../constants/platformConstants";

export const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const userEmail = JSON.parse(atob(token.split(".")[1])).sub;
  return fetchWithAuth(`${API_BASE_URL}/auth/user/${userEmail}`);
};

export const getUserPlatforms = async (userId) => {
  if (!userId) return [];
  return fetchWithAuth(`${API_BASE_URL}/platforms/user/${userId}`);
};

/**
 * Vérifie le statut d'une plateforme externe
 */
export const checkPlatformStatus = async (platformType) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const endpoints = {
      ITERO: `${API_BASE_URL}/itero/status`,
      DEXIS: `${API_BASE_URL}/dexis/status`,
      CSCONNECT: `${API_BASE_URL}/csconnect/status`,
      MYSMILELAB: `${API_BASE_URL}/drive/status`, // Backblaze B2 backend
    };

    const endpoint = endpoints[platformType];
    if (!endpoint)
      throw new Error(`Type de plateforme non supporté: ${platformType}`);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, data, error: null };
    } else if (response.status === 401) {
      return { authenticated: false, data: null, error: null };
    } else {
      throw new Error("Erreur de vérification");
    }
  } catch (error) {
    return { authenticated: false, data: null, error: error.message };
  }
};
