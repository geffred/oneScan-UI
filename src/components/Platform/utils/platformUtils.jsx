import CryptoJS from "crypto-js";
import { API_BASE_URL, SECRET_KEY } from "../constants/platformConstants";

export const encryptPassword = (password) => {
  try {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    return password;
  }
};

export const decryptPassword = (encryptedPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    return encryptedPassword;
  }
};

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

export const checkPlatformStatus = async (platformType) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const endpoints = {
      GOOGLE_DRIVE: `${API_BASE_URL}/drive/status`,
      ITERO: `${API_BASE_URL}/itero/status`,
      DEXIS: `${API_BASE_URL}/dexis/status`,
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
