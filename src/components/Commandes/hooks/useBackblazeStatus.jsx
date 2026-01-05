import { useState, useCallback, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Hook pour vérifier le statut de Backblaze B2
 * Note: Avec Backblaze B2, l'authentification est automatique via les credentials
 * Ce hook vérifie simplement que le service est initialisé
 */
export const useBackblazeStatus = (isAuthenticated) => {
  const [backblazeStatus, setBackblazeStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
    provider: "backblaze-b2",
  });

  const checkBackblazeStatus = useCallback(async () => {
    try {
      setBackblazeStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setBackblazeStatus({
          authenticated: false,
          loading: false,
          error: null,
          provider: "backblaze-b2",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/drive/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackblazeStatus({
          authenticated: data.authenticated || false,
          loading: false,
          error: null,
          provider: data.provider || "backblaze-b2",
        });
      } else if (response.status === 401) {
        setBackblazeStatus({
          authenticated: false,
          loading: false,
          error: null,
          provider: "backblaze-b2",
        });
      } else {
        setBackblazeStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
          provider: "backblaze-b2",
        });
      }
    } catch (error) {
      setBackblazeStatus({
        authenticated: false,
        loading: false,
        error: error.message,
        provider: "backblaze-b2",
      });
    }
  }, []);

  // Vérifier le statut Backblaze B2 au chargement
  useEffect(() => {
    if (isAuthenticated) {
      checkBackblazeStatus();
    }
  }, [isAuthenticated, checkBackblazeStatus]);

  return backblazeStatus;
};

export default useBackblazeStatus;
