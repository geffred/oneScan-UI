const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction fetcher pour SWR
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

// Fonction pour récupérer les données utilisateur
export const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const userEmail = JSON.parse(atob(token.split(".")[1])).sub;
  return fetchWithAuth(`${API_BASE_URL}/auth/user/${userEmail}`);
};

// Fonction pour récupérer les plateformes d'un utilisateur
export const getUserPlatforms = async (userId) => {
  if (!userId) return [];
  return fetchWithAuth(`${API_BASE_URL}/platforms/user/${userId}`);
};

// Fonction pour récupérer les commandes
export const getCommandes = async () => {
  return fetchWithAuth(`${API_BASE_URL}/public/commandes`);
};

// Configuration des endpoints
export const platformEndpoints = {
  MEDITLINK: `${API_BASE_URL}/meditlink/cases/save`,
  ITERO: `${API_BASE_URL}/itero/commandes`,
  THREESHAPE: `${API_BASE_URL}/threeshape/cases/save`,
  DEXIS: `${API_BASE_URL}/dexis/commandes`,
};
