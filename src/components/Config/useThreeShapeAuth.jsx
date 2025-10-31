// useThreeShapeAuth.js
import { useState, useCallback, useContext } from "react";
import useSWR from "swr";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetcher = (url) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
};

export const useThreeShapeAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuthData } = useContext(AuthContext);

  // SWR pour le statut d'authentification 3Shape
  const { data: authStatus, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/auth/status`,
    fetcher,
    {
      refreshInterval: 60000, // Vérifier toutes les minutes
      onError: (err) => setError(err.message),
      errorRetryCount: 1,
      onErrorRetry: () => {}, // Désactiver le retry automatique
    }
  );

  const isAuthenticated = authStatus?.authenticated || false;
  const hasToken = authStatus?.hasToken || false;

  /**
   * Initie le processus d'authentification 3Shape
   */
  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const htmlContent = await response.text();

      // Extraire l'URL d'authentification du HTML
      const urlMatch = htmlContent.match(/href="([^"]+)"/);
      if (!urlMatch || !urlMatch[1]) {
        throw new Error("URL d'authentification non trouvée dans la réponse");
      }

      const authUrl = urlMatch[1];

      // Ouvrir l'URL d'authentification dans un nouvel onglet
      const authWindow = window.open(authUrl, "_blank");

      // Retourner l'URL pour confirmation
      return { success: true, authUrl, authWindow };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Traite le callback d'authentification
   */
  const handleCallback = useCallback(
    async (code, state = null) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const url = `${API_BASE_URL}/callback?code=${encodeURIComponent(code)}${
          state ? `&state=${encodeURIComponent(state)}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erreur HTTP ${response.status}: ${
              errorText || "Erreur lors du callback"
            }`
          );
        }

        const responseText = await response.text();

        // Vérifier si la réponse indique un succès
        if (
          responseText.includes("Connexion réussie") ||
          responseText.includes("✅") ||
          response.status === 200
        ) {
          // Rafraîchir les données SWR
          await mutateAuth();

          // Mettre à jour le contexte
          if (setAuthData) {
            setAuthData((prev) => ({
              ...prev,
              threeshapeAuthenticated: true,
              threeshapeConnectedAt: new Date().toISOString(),
            }));
          }

          return {
            success: true,
            message: "Authentification 3Shape réussie",
          };
        } else {
          throw new Error("Réponse inattendue du serveur 3Shape");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateAuth, setAuthData]
  );

  /**
   * Rafraîchit le statut d'authentification
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Revalider les données SWR
      await mutateAuth();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  /**
   * Récupère les cas depuis 3Shape
   */
  const getCases = useCallback(async (page = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${API_BASE_URL}/cases?page=${page}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const cases = await response.json();
      return cases;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère les connexions 3Shape
   */
  const getConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${API_BASE_URL}/connections`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const connections = await response.json();
      return connections;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sauvegarde les cas en base de données
   */
  const saveAndFetchCases = useCallback(async (startPage = 0, endPage = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${API_BASE_URL}/cases/save?startPage=${startPage}&endPage=${endPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Télécharge un fichier d'attachment
   */
  const downloadAttachment = useCallback(async (caseId, attachmentHash) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${API_BASE_URL}/cases/${caseId}/attachments/${attachmentHash}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le nom du fichier depuis les headers
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download.stl";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Teste la connexion avec 3Shape
   */
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await mutateAuth();

      const currentStatus = await mutateAuth();

      if (currentStatus?.authenticated && currentStatus?.hasToken) {
        return { success: true, message: "Connexion 3Shape active" };
      } else {
        return { success: false, message: "Connexion 3Shape inactive" };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  /**
   * Efface les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // États
    authStatus,
    isLoading,
    error,
    isAuthenticated,
    hasToken,

    // Méthodes d'authentification
    initiateAuth,
    handleCallback,
    refresh,
    testConnection,

    // Méthodes API
    getCases,
    getConnections,
    saveAndFetchCases,
    downloadAttachment,

    // Utilitaires
    clearError,
  };
};

export default useThreeShapeAuth;
