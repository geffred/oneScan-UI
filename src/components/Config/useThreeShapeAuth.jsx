// useThreeShapeAuth.js
import { useState, useCallback, useContext, useEffect } from "react";
import useSWR from "swr";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuration
const REFRESH_INTERVAL = 15000; // 15 secondes
const TOKEN_EXPIRY_WARNING = 600; // 10 minutes
const AUTO_REFRESH_THRESHOLD = 300; // 5 minutes

const fetcher = (url) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
    }
    return res.json();
  });
};

export const useThreeShapeAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const { setAuthData } = useContext(AuthContext);

  // SWR avec revalidation agressive pour le statut d'authentification
  const {
    data: authStatus,
    mutate: mutateAuth,
    isValidating: isValidatingAuth,
  } = useSWR(`${API_BASE_URL}/api/threeshape/auth/status`, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (err) => {
      console.error("❌ Erreur lors de la vérification du statut auth:", err);
      setError(err.message);
    },
    onSuccess: (data) => {
      console.log("✅ Statut auth mis à jour:", {
        authenticated: data?.authenticated,
        secondsUntilExpiry: data?.secondsUntilExpiry,
        hasRefreshToken: data?.hasRefreshToken,
      });
    },
  });

  // États dérivés
  const isAuthenticated = authStatus?.authenticated || false;
  const hasToken = authStatus?.hasToken || false;
  const hasRefreshToken = authStatus?.hasRefreshToken || false;
  const secondsUntilExpiry = authStatus?.secondsUntilExpiry || 0;
  const autoRefreshEnabled = authStatus?.autoRefreshEnabled !== false;
  const tokenExpiry = authStatus?.tokenExpiry || null;

  // Formatage du temps restant
  const formatTimeUntilExpiry = useCallback((seconds) => {
    if (seconds <= 0) return "Expiré";

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  const timeUntilExpiryFormatted = formatTimeUntilExpiry(secondsUntilExpiry);
  const isTokenExpiringSoon =
    secondsUntilExpiry > 0 && secondsUntilExpiry < TOKEN_EXPIRY_WARNING;
  const shouldAutoRefresh =
    secondsUntilExpiry > 0 && secondsUntilExpiry < AUTO_REFRESH_THRESHOLD;

  // Rafraîchissement automatique quand le token approche de l'expiration
  useEffect(() => {
    if (autoRefreshEnabled && shouldAutoRefresh && hasRefreshToken) {
      console.log(
        "🔄 Rafraîchissement automatique déclenché - expire dans:",
        secondsUntilExpiry,
        "s"
      );
      refreshToken().catch((err) => {
        console.error("❌ Rafraîchissement automatique échoué:", err);
      });
    }
  }, [
    secondsUntilExpiry,
    autoRefreshEnabled,
    hasRefreshToken,
    shouldAutoRefresh,
  ]);

  // Vérification périodique de l'authentification
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !isValidatingAuth) {
        mutateAuth();
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated, isValidatingAuth, mutateAuth]);

  // Mise à jour du contexte d'authentification
  useEffect(() => {
    if (setAuthData) {
      setAuthData((prev) => ({
        ...prev,
        threeshapeAuthenticated: isAuthenticated,
        threeshapeConnectedAt: isAuthenticated
          ? prev.threeshapeConnectedAt || new Date().toISOString()
          : null,
        threeshapeTokenExpiry: tokenExpiry,
      }));
    }
  }, [isAuthenticated, tokenExpiry, setAuthData]);

  /**
   * Initie le processus d'authentification 3Shape
   */
  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLastAction("initiateAuth");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("🔗 Initialisation de l'authentification 3Shape...");

      const response = await fetch(`${API_BASE_URL}/api/login`, {
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
      const newWindow = window.open(authUrl, "_blank", "width=800,height=600");

      if (!newWindow) {
        throw new Error(
          "Le pop-up a été bloqué. Veuillez autoriser les pop-ups pour ce site."
        );
      }

      console.log("✅ URL d'authentification générée:", authUrl);
      return authUrl;
    } catch (err) {
      console.error(
        "❌ Erreur lors de l'initiation de l'authentification:",
        err
      );
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
        setLastAction("handleCallback");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        console.log(
          "📨 Traitement du callback 3Shape avec code:",
          code?.substring(0, 10) + "..."
        );

        const url = `${API_BASE_URL}/api/callback?code=${encodeURIComponent(
          code
        )}${state ? `&state=${encodeURIComponent(state)}` : ""}`;

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

          console.log("✅ Authentification 3Shape réussie via callback");
          return {
            success: true,
            message: "Authentification 3Shape réussie",
          };
        } else {
          throw new Error("Réponse inattendue du serveur 3Shape");
        }
      } catch (err) {
        console.error("❌ Erreur lors du traitement du callback:", err);
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
      setLastAction("refreshToken");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      if (!hasRefreshToken) {
        throw new Error("Aucun refresh token disponible");
      }

      console.log("🔄 Début du rafraîchissement manuel du token...");

      const response = await fetch(
        `${API_BASE_URL}/api/threeshape/auth/refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        await mutateAuth();
        console.log("✅ Token rafraîchi avec succès");
        setLastAction("refreshTokenSuccess");
        return result;
      } else {
        throw new Error(result.message || "Erreur lors du rafraîchissement");
      }
    } catch (err) {
      console.error("❌ Erreur lors du rafraîchissement du token:", err);
      setError(err.message);
      setLastAction("refreshTokenError");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth, hasRefreshToken]);

  /**
   * Déconnexion de 3Shape
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLastAction("logout");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("🚪 Déconnexion de 3Shape...");

      const response = await fetch(
        `${API_BASE_URL}/api/threeshape/auth/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

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
            threeshapeTokenExpiry: null,
          }));
        }

        console.log("✅ Déconnexion 3Shape réussie");
        setLastAction("logoutSuccess");
        return result;
      } else {
        throw new Error(result.message || "Erreur lors de la déconnexion");
      }
    } catch (err) {
      console.error("❌ Erreur lors de la déconnexion:", err);
      setError(err.message);
      setLastAction("logoutError");
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
      setLastAction("refreshStatus");

      console.log("🔄 Rafraîchissement manuel du statut...");
      await mutateAuth();
      setLastAction("refreshStatusSuccess");
    } catch (err) {
      console.error("❌ Erreur lors du rafraîchissement du statut:", err);
      setError(err.message);
      setLastAction("refreshStatusError");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAuth]);

  /**
   * Récupère les cas depuis 3Shape
   */
  const getCases = useCallback(
    async (page = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        setLastAction("getCases");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        if (!isAuthenticated) {
          throw new Error("Non authentifié avec 3Shape");
        }

        console.log(`📋 Récupération des cas 3Shape (page ${page})...`);

        const response = await fetch(`${API_BASE_URL}/api/cases?page=${page}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Non authentifié avec 3Shape - Token expiré");
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const cases = await response.json();
        console.log(`✅ ${cases?.length || 0} cas récupérés avec succès`);
        setLastAction("getCasesSuccess");
        return cases;
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des cas:", err);
        setError(err.message);
        setLastAction("getCasesError");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Récupère les connexions 3Shape
   */
  const getConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLastAction("getConnections");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      if (!isAuthenticated) {
        throw new Error("Non authentifié avec 3Shape");
      }

      console.log("🔗 Récupération des connexions 3Shape...");

      const response = await fetch(`${API_BASE_URL}/api/connections`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non authentifié avec 3Shape - Token expiré");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const connections = await response.json();
      console.log("✅ Connexions récupérées avec succès");
      setLastAction("getConnectionsSuccess");
      return connections;
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des connexions:", err);
      setError(err.message);
      setLastAction("getConnectionsError");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Sauvegarde les cas en base de données
   */
  const saveAndFetchCases = useCallback(
    async (startPage = 0, endPage = 1) => {
      try {
        setIsLoading(true);
        setError(null);
        setLastAction("saveAndFetchCases");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        if (!isAuthenticated) {
          throw new Error("Non authentifié avec 3Shape");
        }

        console.log(
          `💾 Sauvegarde des cas 3Shape (pages ${startPage} à ${endPage})...`
        );

        const response = await fetch(
          `${API_BASE_URL}/api/cases/save?startPage=${startPage}&endPage=${endPage}`,
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
            throw new Error("Non authentifié avec 3Shape - Token expiré");
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Cas sauvegardés avec succès:", result);
        setLastAction("saveAndFetchCasesSuccess");
        return result;
      } catch (err) {
        console.error("❌ Erreur lors de la sauvegarde des cas:", err);
        setError(err.message);
        setLastAction("saveAndFetchCasesError");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Télécharge un fichier d'attachment
   */
  const downloadAttachment = useCallback(
    async (caseId, attachmentHash) => {
      try {
        setIsLoading(true);
        setError(null);
        setLastAction("downloadAttachment");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        if (!isAuthenticated) {
          throw new Error("Non authentifié avec 3Shape");
        }

        console.log(
          `📥 Téléchargement du fichier ${attachmentHash} pour le cas ${caseId}...`
        );

        const response = await fetch(
          `${API_BASE_URL}/api/threeshape/files/${caseId}/${attachmentHash}`,
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
            throw new Error("Non authentifié avec 3Shape - Token expiré");
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

        console.log("✅ Fichier téléchargé avec succès:", filename);
        setLastAction("downloadAttachmentSuccess");
        return { success: true, filename };
      } catch (err) {
        console.error("❌ Erreur lors du téléchargement du fichier:", err);
        setError(err.message);
        setLastAction("downloadAttachmentError");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Teste la connexion avec 3Shape
   */
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLastAction("testConnection");

      // Vérifier d'abord le statut d'authentification
      await mutateAuth();

      if (!isAuthenticated) {
        throw new Error("Non authentifié avec 3Shape");
      }

      // Tester une requête API simple
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("🧪 Test de connexion 3Shape en cours...");

      const response = await fetch(`${API_BASE_URL}/api/connections`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = {
          success: true,
          message: "Connexion 3Shape active et fonctionnelle",
        };
        console.log("✅ Test de connexion réussi");
        setLastAction("testConnectionSuccess");
        return result;
      } else {
        throw new Error(
          `Erreur API: ${response.status} - ${response.statusText}`
        );
      }
    } catch (err) {
      console.error("❌ Erreur lors du test de connexion:", err);
      const result = {
        success: false,
        message: err.message,
        error: err.message,
      };
      setError(err.message);
      setLastAction("testConnectionError");
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, mutateAuth]);

  /**
   * Efface les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Réinitialise le dernier action
   */
  const clearLastAction = useCallback(() => {
    setLastAction(null);
  }, []);

  return {
    // États
    authStatus,
    isLoading,
    error,
    lastAction,
    isAuthenticated,
    hasToken,
    hasRefreshToken,
    secondsUntilExpiry,
    autoRefreshEnabled,
    tokenExpiry,

    // États calculés
    isTokenExpiringSoon,
    shouldAutoRefresh,
    timeUntilExpiryFormatted,

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
    clearLastAction,
    mutateAuth,
  };
};

export default useThreeShapeAuth;
