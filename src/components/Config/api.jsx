// Configuration des URLs API selon l'environnement
const isProduction = import.meta.env.PROD;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isProduction
    ? "https://mysmilelab-api-production.up.railway.app"
    : "http://localhost:8080");

console.log("API Configuration:", { isProduction, API_BASE_URL });

// Fonction utilitaire pour créer des URLs API complètes
export const createApiUrl = (endpoint) => {
  // Nettoyer l'URL de base (supprimer le slash final)
  const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

  // Nettoyer l'endpoint (ajouter un slash au début si absent)
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${cleanBaseUrl}${cleanEndpoint}`;
};

// Configuration pour fetch
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Fonction fetch avec gestion d'erreurs améliorée
export const fetchPublic = async (endpoint, options = {}) => {
  const url = createApiUrl(endpoint);
  console.log(`Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
