// src/components/Config/useDexisAuth.js
import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useDexisAuth = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling du statut avec SWR
  const {
    data: authStatus,
    error: swrError,
    mutate: mutateAuth,
  } = useSWR(
    `${API_BASE_URL}/dexis/auth/status`,
    async (url) => {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur fetch status");
      return res.json();
    },
    {
      refreshInterval: options.refreshInterval || 30000,
      shouldRetryOnError: false,
    },
  );

  const isAuthenticated = authStatus?.authenticated || false;

  // Lancer l'auth OAuth2 (Popup)
  const initiateAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // 1. Obtenir l'URL de login
      const res = await fetch(`${API_BASE_URL}/dexis/auth/login`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.url) throw new Error("URL de connexion introuvable");

      // 2. Ouvrir la popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        "DexisAuth",
        `width=${width},height=${height},top=${top},left=${left}`,
      );

      // 3. Écouter la fermeture ou le succès (via localStorage ou timer)
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          mutateAuth(); // Rafraîchir le statut
          setIsLoading(false);
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [mutateAuth]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      // Note: Dexis n'a pas forcément de endpoint logout API, on supprime juste côté serveur si implémenté
      // ou on invalide le token localement. Ici on assume que tu ajoutes un endpoint logout ou delete token.
      // Si tu n'as pas de endpoint logout spécifique, cela réinitialise juste le state local via mutate
      await mutateAuth({ authenticated: false }, false);
    } catch (err) {
      console.error(err);
    }
  }, [mutateAuth]);

  // Fonction pour tester la connexion (appel d'un cas)
  const testConnection = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/dexis/cases/sync?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return { success: true };
      const text = await res.text();
      return { success: false, error: text };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    authStatus,
    isAuthenticated,
    isLoading: isLoading || (!authStatus && !swrError),
    error: error || swrError,
    initiateAuth,
    logout,
    mutateAuth,
    testConnection,
  };
};

export default useDexisAuth;
