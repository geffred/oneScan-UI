// useMeditLinkAuth.js - Version corrigée
import { useState, useCallback, useContext } from "react";
import useSWR from "swr";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetcher = (url) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    credentials: "include", // IMPORTANT : envoyer les cookies MeditLink
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
      revalidateOnFocus: true,
    }
  );

  const isAuthenticated = authStatus?.authenticated || false;
  const userInfo = authStatus?.user || null;

  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/login`, {
        credentials: "include", // IMPORTANT
        headers,
      });

      const data = await response.json();

      if (data.success && data.authUrl) {
        // Sauvegarder le JWT avant redirection
        if (token) {
          sessionStorage.setItem("preserve_jwt", token);
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

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/logout`, {
        method: "POST",
        credentials: "include", // IMPORTANT
        headers,
      });

      const data = await response.json();

      if (data.success) {
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
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth, setAuthData]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/refresh`, {
        method: "POST",
        credentials: "include", // IMPORTANT
        headers,
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
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/meditlink/auth/debug`, {
        credentials: "include", // IMPORTANT
        headers,
      });

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
  const isExpiringSoon = authStatus?.tokenDetails?.remainingSeconds
    ? authStatus.tokenDetails.remainingSeconds < 300
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
    userInfo,
  };
};

export default useMeditLinkAuth;
