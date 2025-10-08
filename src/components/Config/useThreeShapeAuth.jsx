// useThreeShapeAuth.js
import { useState, useCallback, useContext, useEffect } from "react";
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

  // SWR pour le statut d'authentification 3Shape avec intervalle réduit
  const { data: authStatus, mutate: mutateAuth } = useSWR(
    `${API_BASE_URL}/threeshape/auth/status`,
    fetcher,
    {
      refreshInterval: 30000, // Vérifier toutes les 30 secondes
      onError: (err) => {
        console.error("Erreur SWR:", err);
        setError(err.message);
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const isAuthenticated = authStatus?.authenticated || false;
  const hasToken = authStatus?.hasToken || false;
  const hasRefreshToken = authStatus?.hasRefreshToken || false;
  const secondsUntilExpiry = authStatus?.secondsUntilExpiry || 0;
  const autoRefreshEnabled = authStatus?.autoRefreshEnabled !== false;

  // Rafraîchissement automatique quand le token approche de l'expiration
  useEffect(() => {
    if (
      autoRefreshEnabled &&
      secondsUntilExpiry > 0 &&
      secondsUntilExpiry < 300
    ) {
      // 5 minutes
      console.log("🔄 Token expire bientôt, rafraîchissement automatique...");
      refreshToken();
    }
  }, [secondsUntilExpiry, autoRefreshEnabled]);

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
      window.open(authUrl, "_blank");

      return authUrl;
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
   * Rafraîchit le token manuellement
   */
  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${API_BASE_URL}/threeshape/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        await mutateAuth();
        console.log("✅ Token rafraîchi avec succès");
        return result;
      } else {
        throw new Error(result.message || "Erreur lors du rafraîchissement");
      }
    } catch (err) {
      console.error("❌ Erreur rafraîchissement token:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  /**
   * Déconnexion de 3Shape
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`${API_BASE_URL}/threeshape/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await mutateAuth();

        // Mettre à jour le contexte
        if (setAuthData) {
          setAuthData((prev) => ({
            ...prev,
            threeshapeAuthenticated: false,
            threeshapeConnectedAt: null,
          }));
        }

        console.log("✅ Déconnexion 3Shape réussie");
        return result;
      } else {
        throw new Error(result.message || "Erreur lors de la déconnexion");
      }
    } catch (err) {
      console.error("❌ Erreur déconnexion:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth, setAuthData]);

  /**
   * Rafraîchit le statut d'authentification
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
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
        `${API_BASE_URL}/threeshape/files/${caseId}/${attachmentHash}`,
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

      // Vérifier d'abord le statut d'authentification
      await mutateAuth();

      // Tester une requête API simple
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

      if (response.ok) {
        return {
          success: true,
          message: "Connexion 3Shape active et fonctionnelle",
        };
      } else {
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        message: err.message,
        error: err.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  /**
   * Vérifie si le token est sur le point d'expirer
   */
  const isTokenExpiringSoon = useCallback(() => {
    return secondsUntilExpiry > 0 && secondsUntilExpiry < 600; // 10 minutes
  }, [secondsUntilExpiry]);

  /**
   * Formatte le temps restant avant expiration
   */
  const formatTimeUntilExpiry = useCallback(() => {
    if (secondsUntilExpiry <= 0) return "Expiré";

    const minutes = Math.floor(secondsUntilExpiry / 60);
    const seconds = secondsUntilExpiry % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [secondsUntilExpiry]);

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
    hasRefreshToken,
    secondsUntilExpiry,
    autoRefreshEnabled,

    // États calculés
    isTokenExpiringSoon: isTokenExpiringSoon(),
    timeUntilExpiryFormatted: formatTimeUntilExpiry(),

    // Méthodes d'authentification
    initiateAuth,
    handleCallback,
    refresh,
    refreshToken,
    logout,
    testConnection,

    // Méthodes API
    getCases,
    getConnections,
    saveAndFetchCases,
    downloadAttachment,

    // Utilitaires
    clearError,
    formatTimeUntilExpiry,
    isTokenExpiringSoon,
  };
};

export default useThreeShapeAuth;
