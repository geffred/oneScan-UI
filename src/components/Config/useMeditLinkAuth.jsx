// useMeditLinkAuth.js
import { useState, useCallback, useContext } from "react";
import useSWR from "swr";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Fonction pour obtenir les headers d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ✅ Fetcher avec authentification JWT
const fetcher = (url) => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    credentials: "include",
    headers,
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
};

export const useMeditLinkAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuthData } = useContext(AuthContext);

  // SWR uniquement pour le statut d'auth
  const { data: authStatus, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/meditlink/auth/status`,
    fetcher,
    {
      refreshInterval: 30000,
      onError: (err) => setError(err.message),
    }
  );

  const isAuthenticated = authStatus?.authenticated || false;

  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/login`, {
        credentials: "include",
        headers: getAuthHeaders(), // ✅ Ajout des headers avec token JWT
      });

      const data = await response.json();

      if (data.success && data.authUrl) {
        // ✅ Préserver le token JWT avant la redirection OAuth
        try {
          sessionStorage.setItem(
            "preserve_jwt",
            localStorage.getItem("token") || ""
          );
        } catch (e) {
          console.warn("Impossible de sauvegarder preserve_jwt:", e);
        }

        window.location.href = data.authUrl;
      } else {
        throw new Error(
          data.error || "Erreur lors de l'initiation de l'authentification"
        );
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(), // ✅ Ajout des headers avec token JWT
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => response.statusText);
        console.warn("MeditLink logout non OK:", txt);
      }

      const data = await response.json().catch(() => ({ success: true }));

      if (data.success || response.ok) {
        // Invalider le cache SWR
        mutateAuth(undefined, { revalidate: false });

        // Mettre à jour le contexte
        if (setAuthData) {
          setAuthData((prev) => ({
            ...prev,
            meditlinkAuthenticated: false,
            meditlinkUser: null,
          }));
        }
      } else {
        throw new Error(data.error || "Erreur lors de la déconnexion");
      }
    } catch (err) {
      setError(err.message);
      console.error("Erreur logout MeditLink:", err);
      // Continuer même en cas d'erreur pour nettoyer l'état local
      mutateAuth(undefined, { revalidate: false });
      if (setAuthData) {
        setAuthData((prev) => ({
          ...prev,
          meditlinkAuthenticated: false,
          meditlinkUser: null,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth, setAuthData]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(), // ✅ Ajout des headers avec token JWT
      });

      const data = await response.json();

      if (data.success) {
        // Rafraîchir les données SWR
        mutateAuth();
      } else {
        throw new Error(data.error || "Erreur lors du rafraîchissement");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getTokenDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/meditlink/auth/token-debug`,
        {
          credentials: "include",
          headers: getAuthHeaders(), // ✅ Ajout des headers avec token JWT
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du token");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Vérifie si le token expire bientôt (dans 5 min)
  const isExpiringSoon = authStatus?.expiresAt
    ? new Date(authStatus.expiresAt).getTime() - Date.now() < 5 * 60 * 1000
    : false;

  return {
    authStatus,
    isLoading,
    error,
    isAuthenticated,
    isExpiringSoon,
    initiateAuth,
    logout,
    refresh,
    clearError,
    getTokenDetails,
  };
};

export default useMeditLinkAuth;
