const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Statuts HTTP transitoires (passerelle / serveur en redémarrage) → on réessaie.
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetcher authentifié pour SWR, avec réessais automatiques.
 *
 * Absorbe les coupures de connexion transitoires (net::ERR_CONNECTION_RESET,
 * connexion keep-alive obsolète, brève indisponibilité du serveur) : au lieu
 * d'échouer dès le premier essai, la requête est retentée sur une connexion
 * neuve. L'utilisateur n'a donc plus besoin de rafraîchir la page à la main.
 *
 * Ne réessaie PAS sur les erreurs applicatives (401, 404, 500...) : celles-ci
 * sont de vraies erreurs et sont remontées immédiatement.
 */
export const fetchWithAuth = async (
  url,
  { retries = 3, retryDelay = 900 } = {},
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      // Serveur momentanément indisponible → on patiente puis on réessaie.
      if (RETRYABLE_STATUS.has(response.status) && attempt < retries) {
        await sleep(retryDelay * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      lastError = err;
      // Une coupure réseau (connexion réinitialisée, hors-ligne bref) fait
      // rejeter fetch() avec un TypeError → on réessaie sur une connexion neuve.
      const isNetworkError = err instanceof TypeError;
      if (isNetworkError && attempt < retries) {
        console.warn(
          `[fetchWithAuth] Échec réseau (tentative ${attempt + 1}/${
            retries + 1
          }) — nouvel essai...`,
        );
        await sleep(retryDelay * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
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
  const data = await fetchWithAuth(`${API_BASE_URL}/public/commandes`);

  // Trier les commandes par date de réception décroissante (les plus récentes en premier)
  if (data && Array.isArray(data)) {
    return data.sort(
      (a, b) => new Date(b.dateReception) - new Date(a.dateReception),
    );
  }

  return data;
};

// Configuration des endpoints
export const platformEndpoints = {
  MEDITLINK: `${API_BASE_URL}/meditlink/cases/save`,
  ITERO: `${API_BASE_URL}/itero/commandes/save`, // ou /itero/commandes selon controller
  THREESHAPE: `${API_BASE_URL}/threeshape/cases/save`,
  DEXIS: `${API_BASE_URL}/dexis/cases/sync`, // Endpoint corrigé pour la synchro Dexis
  CSCONNECT: `${API_BASE_URL}/csconnect/commandes`,
  MYSCAN: `${API_BASE_URL}/myscan/commandes/save`,
};
