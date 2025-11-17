import { useCallback } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const platformEndpoints = {
  MEDITLINK: `${API_BASE_URL}/meditlink/cases/save`,
  ITERO: `${API_BASE_URL}/itero/commandes/save`,
  DEXIS: `${API_BASE_URL}/dexis/commandes/save`,
  THREESHAPE: `${API_BASE_URL}/threeshape/cases/save`,
  CSCONNECT: `${API_BASE_URL}/csconnect/commandes`,
};

export const useSyncPlatforms = ({
  mutateCommandes,
  setSyncStatus,
  setIsSyncing,
}) => {
  // Fonction pour synchroniser MeditLink
  const syncMeditLinkCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/meditlink/cases/save?page=0&size=20`;

    setSyncStatus((prev) => ({
      ...prev,
      MEDITLINK: {
        status: "loading",
        message: "Synchronisation MeditLink en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        mutateCommandes();

        const savedCount = result.savedCount || result.count || 0;
        const message =
          savedCount > 0
            ? `${savedCount} nouvelle(s) commande(s) récupérée(s)`
            : "Aucune nouvelle commande";

        setSyncStatus((prev) => ({
          ...prev,
          MEDITLINK: {
            status: "success",
            message: message,
            count: savedCount,
          },
        }));

        if (savedCount > 0) {
          toast.success(`MeditLink: ${savedCount} nouvelle(s) commande(s)`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.info(`MeditLink: Aucune nouvelle commande`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Erreur MeditLink:", errorText);

        setSyncStatus((prev) => ({
          ...prev,
          MEDITLINK: {
            status: "error",
            message: "Erreur de synchronisation MeditLink",
          },
        }));

        toast.error("Erreur lors de la synchronisation MeditLink", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation MeditLink:", err);
      setSyncStatus((prev) => ({
        ...prev,
        MEDITLINK: {
          status: "error",
          message: "Erreur de connexion MeditLink",
        },
      }));

      toast.error("Erreur de connexion avec MeditLink", {
        position: "top-right",
        autoClose: 5000,
      });
    }

    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus.MEDITLINK;
        return newStatus;
      });
    }, 5000);
  }, [mutateCommandes, setSyncStatus]);

  // Fonction pour synchroniser Itero
  const syncIteroCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/itero/commandes/save`;

    setSyncStatus((prev) => ({
      ...prev,
      ITERO: {
        status: "loading",
        message: "Synchronisation Itero en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        mutateCommandes();

        const savedCount = result.savedCount || result.count || 0;
        const message =
          savedCount > 0
            ? `${savedCount} nouvelle(s) commande(s) récupérée(s)`
            : "Aucune nouvelle commande";

        setSyncStatus((prev) => ({
          ...prev,
          ITERO: {
            status: "success",
            message: message,
            count: savedCount,
          },
        }));

        if (savedCount > 0) {
          toast.success(`Itero: ${savedCount} nouvelle(s) commande(s)`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.info(`Itero: Aucune nouvelle commande`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Erreur Itero:", errorText);

        setSyncStatus((prev) => ({
          ...prev,
          ITERO: {
            status: "error",
            message: "Erreur de synchronisation Itero",
          },
        }));

        toast.error("Erreur lors de la synchronisation Itero", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation Itero:", err);
      setSyncStatus((prev) => ({
        ...prev,
        ITERO: {
          status: "error",
          message: "Erreur de connexion Itero",
        },
      }));

      toast.error("Erreur de connexion avec Itero", {
        position: "top-right",
        autoClose: 5000,
      });
    }

    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus.ITERO;
        return newStatus;
      });
    }, 5000);
  }, [mutateCommandes, setSyncStatus]);

  // Fonction pour synchroniser Dexis
  const syncDexisCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/dexis/commandes`;

    setSyncStatus((prev) => ({
      ...prev,
      DEXIS: {
        status: "loading",
        message: "Synchronisation Dexis en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        mutateCommandes();

        // Dexis retourne directement un tableau de commandes
        const savedCount = Array.isArray(result) ? result.length : 0;
        const message =
          savedCount > 0
            ? `${savedCount} nouvelle(s) commande(s) récupérée(s)`
            : "Aucune nouvelle commande";

        setSyncStatus((prev) => ({
          ...prev,
          DEXIS: {
            status: "success",
            message: message,
            count: savedCount,
          },
        }));

        if (savedCount > 0) {
          toast.success(`Dexis: ${savedCount} nouvelle(s) commande(s)`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.info(`Dexis: Aucune nouvelle commande`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Erreur Dexis:", errorText);

        setSyncStatus((prev) => ({
          ...prev,
          DEXIS: {
            status: "error",
            message: "Erreur de synchronisation Dexis",
          },
        }));

        toast.error("Erreur lors de la synchronisation Dexis", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation Dexis:", err);
      setSyncStatus((prev) => ({
        ...prev,
        DEXIS: {
          status: "error",
          message: "Erreur de connexion Dexis",
        },
      }));

      toast.error("Erreur de connexion avec Dexis", {
        position: "top-right",
        autoClose: 5000,
      });
    }

    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus.DEXIS;
        return newStatus;
      });
    }, 5000);
  }, [mutateCommandes, setSyncStatus]);

  // Fonction pour synchroniser CS Connect
  const syncCsConnectCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/csconnect/commandes`;

    setSyncStatus((prev) => ({
      ...prev,
      CSCONNECT: {
        status: "loading",
        message: "Synchronisation CS Connect en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        mutateCommandes();

        // CS Connect retourne un objet avec les commandes
        const commandes = result.commandes || result;
        const savedCount = Array.isArray(commandes) ? commandes.length : 0;
        const message =
          savedCount > 0
            ? `${savedCount} nouvelle(s) commande(s) récupérée(s)`
            : "Aucune nouvelle commande";

        setSyncStatus((prev) => ({
          ...prev,
          CSCONNECT: {
            status: "success",
            message: message,
            count: savedCount,
          },
        }));

        if (savedCount > 0) {
          toast.success(`CS Connect: ${savedCount} nouvelle(s) commande(s)`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.info(`CS Connect: Aucune nouvelle commande`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Erreur CS Connect:", errorText);

        setSyncStatus((prev) => ({
          ...prev,
          CSCONNECT: {
            status: "error",
            message: "Erreur de synchronisation CS Connect",
          },
        }));

        toast.error("Erreur lors de la synchronisation CS Connect", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation CS Connect:", err);
      setSyncStatus((prev) => ({
        ...prev,
        CSCONNECT: {
          status: "error",
          message: "Erreur de connexion CS Connect",
        },
      }));

      toast.error("Erreur de connexion avec CS Connect", {
        position: "top-right",
        autoClose: 5000,
      });
    }

    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus.CSCONNECT;
        return newStatus;
      });
    }, 5000);
  }, [mutateCommandes, setSyncStatus]);

  // Fonction pour synchroniser les autres plateformes - CORRIGÉE
  const syncOtherPlatform = useCallback(
    async (platformName) => {
      let endpoint = platformEndpoints[platformName];
      if (!endpoint) {
        console.error(
          `Endpoint non trouvé pour la plateforme: ${platformName}`
        );
        return;
      }

      // CORRECTION : Ajouter les paramètres de pagination pour 3Shape
      if (platformName === "THREESHAPE") {
        endpoint += "?startPage=0&endPage=1"; // Paramètres requis par le backend
      }

      setSyncStatus((prev) => ({
        ...prev,
        [platformName]: {
          status: "loading",
          message: `Synchronisation ${platformName} en cours...`,
        },
      }));

      try {
        const token = localStorage.getItem("token");

        // CORRECTION : Log pour débogage
        console.log(`🔗 Appel ${platformName}: ${endpoint}`);

        const method =
          platformName === "MEDITLINK" || platformName === "THREESHAPE"
            ? "GET"
            : "POST";

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(method === "POST" && { "Content-Type": "application/json" }),
          },
          credentials: "include",
        });

        // CORRECTION : Meilleur logging des réponses
        console.log(
          `📥 Réponse ${platformName}:`,
          response.status,
          response.statusText
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Succès ${platformName}:`, result);

          mutateCommandes();

          const savedCount = result.savedCount || result.count || 0;
          const message =
            savedCount > 0
              ? `${savedCount} nouvelle(s) commande(s) récupérée(s)`
              : "Aucune nouvelle commande";

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "success",
              message: message,
              count: savedCount,
            },
          }));

          if (savedCount > 0) {
            toast.success(
              `${platformName}: ${savedCount} nouvelle(s) commande(s)`,
              {
                position: "top-right",
                autoClose: 5000,
              }
            );
          } else {
            toast.info(`${platformName}: Aucune nouvelle commande`, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else {
          const errorText = await response.text();
          console.error(
            `❌ Erreur ${platformName}:`,
            response.status,
            errorText
          );

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "error",
              message: `Erreur ${response.status} - Synchronisation ${platformName}`,
            },
          }));

          toast.error(
            `Erreur ${response.status} lors de la synchronisation ${platformName}`,
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
        }
      } catch (err) {
        console.error(`💥 Erreur réseau ${platformName}:`, err);
        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: {
            status: "error",
            message: `Erreur de connexion ${platformName}`,
          },
        }));

        toast.error(`Erreur de connexion avec ${platformName}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }

      setTimeout(() => {
        setSyncStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[platformName];
          return newStatus;
        });
      }, 5000);
    },
    [mutateCommandes, setSyncStatus]
  );

  // Fonction pour synchroniser une plateforme spécifique - AMÉLIORÉE
  const syncPlatformCommandes = useCallback(
    (platformName, getConnectionStatus) => {
      // Ignorer Google Drive
      if (platformName === "GOOGLE_DRIVE") {
        return;
      }

      const connectionStatus = getConnectionStatus(platformName);

      // CORRECTION : Meilleur logging de l'état de connexion
      console.log(`🔐 Statut connexion ${platformName}:`, connectionStatus);

      if (!connectionStatus.authenticated) {
        toast.warning(
          `${platformName} n'est pas connectée. Veuillez d'abord vous connecter.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return;
      }

      console.log(`🔄 Lancement synchronisation ${platformName}...`);

      switch (platformName) {
        case "MEDITLINK":
          return syncMeditLinkCommandes();
        case "ITERO":
          return syncIteroCommandes();
        case "DEXIS":
          return syncDexisCommandes();
        case "CSCONNECT":
          return syncCsConnectCommandes();
        default:
          return syncOtherPlatform(platformName);
      }
    },
    [
      syncMeditLinkCommandes,
      syncIteroCommandes,
      syncDexisCommandes,
      syncCsConnectCommandes,
      syncOtherPlatform,
    ]
  );

  // Fonction pour synchroniser toutes les plateformes connectées
  const syncAllPlatforms = useCallback(
    async (userPlatforms, getConnectionStatus) => {
      if (userPlatforms.length === 0) return;

      setIsSyncing(true);

      // Filtrer seulement les plateformes connectées (exclure Google Drive)
      const connectedPlatforms = userPlatforms.filter((platform) => {
        // Exclure Google Drive de la synchronisation
        if (platform.name === "GOOGLE_DRIVE") return false;

        const connectionStatus = getConnectionStatus(platform.name);
        return connectionStatus.authenticated;
      });

      if (connectedPlatforms.length === 0) {
        toast.warning("Aucune plateforme connectée à synchroniser", {
          position: "top-right",
          autoClose: 5000,
        });
        setIsSyncing(false);
        return;
      }

      const syncPromises = connectedPlatforms.map((platform) => {
        switch (platform.name) {
          case "MEDITLINK":
            return syncMeditLinkCommandes();
          case "ITERO":
            return syncIteroCommandes();
          case "DEXIS":
            return syncDexisCommandes();
          case "CSCONNECT":
            return syncCsConnectCommandes();
          default:
            return syncOtherPlatform(platform.name);
        }
      });

      try {
        await Promise.all(syncPromises);

        toast.success(
          `${connectedPlatforms.length} plateforme(s) synchronisée(s)`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } catch (error) {
        console.error("Erreur lors de la synchronisation globale:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [
      syncMeditLinkCommandes,
      syncIteroCommandes,
      syncDexisCommandes,
      syncCsConnectCommandes,
      syncOtherPlatform,
      setIsSyncing,
    ]
  );

  return {
    syncMeditLinkCommandes,
    syncIteroCommandes,
    syncDexisCommandes,
    syncCsConnectCommandes,
    syncOtherPlatform,
    syncPlatformCommandes,
    syncAllPlatforms,
  };
};

export default useSyncPlatforms;
