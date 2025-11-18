import { useCallback } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuration des endpoints pour chaque plateforme
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
  // Fonction générique pour synchroniser une plateforme
  const syncPlatform = useCallback(
    async (platformName, endpoint, method = "POST") => {
      // Définir le statut de chargement
      setSyncStatus((prev) => ({
        ...prev,
        [platformName]: {
          status: "loading",
          message: "Synchronisation en cours...",
        },
      }));

      try {
        const token = localStorage.getItem("token");

        // Préparer les paramètres de requête pour 3Shape
        let finalEndpoint = endpoint;
        if (platformName === "THREESHAPE") {
          finalEndpoint += "?startPage=0&endPage=1";
        }

        // Effectuer la requête API
        const response = await fetch(finalEndpoint, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(method === "POST" && { "Content-Type": "application/json" }),
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();

          // Actualiser les commandes
          mutateCommandes();

          // CALCUL DU NOMBRE DE COMMANDES SAUVEGARDÉES AVEC LA NOUVELLE LOGIQUE
          let savedCount = 0;

          if (platformName === "DEXIS") {
            // Pour Dexis, utiliser savedCount directement depuis l'objet résultat
            savedCount = result.savedCount || result.count || 0;
          } else if (platformName === "CSCONNECT") {
            // Pour CS Connect, compter les commandes dans le tableau
            const commandes = result.commandes || result;
            savedCount = Array.isArray(commandes) ? commandes.length : 0;
          } else {
            // Pour les autres plateformes (MEDITLINK, ITERO, THREESHAPE)
            savedCount = result.savedCount || result.count || 0;
          }

          // Mettre à jour le statut avec un message simple
          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "success",
              message: "Synchronisation terminée",
              count: savedCount,
            },
          }));

          // Afficher un toast de succès avec le nombre de commandes
          toast.success(
            `${platformName}: ${savedCount} commande(s) synchronisée(s)`,
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        } else {
          // Gérer les erreurs HTTP
          const errorText = await response.text();
          console.error(`Erreur ${platformName}:`, errorText);

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "error",
              message: `Erreur de synchronisation: ${response.status}`,
            },
          }));

          toast.error(`${platformName}: Erreur de synchronisation`, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (err) {
        // Gérer les erreurs réseau
        console.error(`Erreur réseau ${platformName}:`, err);

        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: {
            status: "error",
            message: "Erreur de connexion",
          },
        }));

        toast.error(`${platformName}: Erreur de connexion`, {
          position: "top-right",
          autoClose: 5000,
        });
      }

      // Nettoyer le statut après 5 secondes
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

  // Fonctions spécifiques pour chaque plateforme
  const syncMeditLinkCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/meditlink/cases/save?page=0&size=20`;
    await syncPlatform("MEDITLINK", endpoint, "POST");
  }, [syncPlatform]);

  const syncIteroCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/itero/commandes/save`;
    await syncPlatform("ITERO", endpoint, "POST");
  }, [syncPlatform]);

  const syncDexisCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/dexis/commandes/save`;
    await syncPlatform("DEXIS", endpoint, "POST");
  }, [syncPlatform]);

  const syncCsConnectCommandes = useCallback(async () => {
    const endpoint = `${API_BASE_URL}/csconnect/commandes`;
    await syncPlatform("CSCONNECT", endpoint, "GET");
  }, [syncPlatform]);

  const syncOtherPlatform = useCallback(
    async (platformName) => {
      const endpoint = platformEndpoints[platformName];
      if (!endpoint) {
        console.error(`Endpoint non trouvé pour: ${platformName}`);
        return;
      }

      // Déterminer la méthode HTTP en fonction de la plateforme
      const method =
        platformName === "MEDITLINK" || platformName === "THREESHAPE"
          ? "GET"
          : "POST";

      await syncPlatform(platformName, endpoint, method);
    },
    [syncPlatform]
  );

  // Fonction pour synchroniser une plateforme spécifique
  const syncPlatformCommandes = useCallback(
    (platformName, getConnectionStatus) => {
      // Ignorer Google Drive (plateforme de stockage uniquement)
      if (platformName === "GOOGLE_DRIVE") {
        return;
      }

      // Vérifier si la plateforme est connectée
      const connectionStatus = getConnectionStatus(platformName);
      if (!connectionStatus.authenticated) {
        toast.warning(`${platformName}: Veuillez d'abord vous connecter`, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      // Lancer la synchronisation selon la plateforme
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

      // Filtrer les plateformes connectées (exclure Google Drive)
      const connectedPlatforms = userPlatforms.filter((platform) => {
        if (platform.name === "GOOGLE_DRIVE") return false;
        const connectionStatus = getConnectionStatus(platform.name);
        return connectionStatus.authenticated;
      });

      if (connectedPlatforms.length === 0) {
        toast.warning("Aucune plateforme connectée", {
          position: "top-right",
          autoClose: 5000,
        });
        setIsSyncing(false);
        return;
      }

      // Créer les promesses de synchronisation
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
        // Exécuter toutes les synchronisations en parallèle
        await Promise.all(syncPromises);

        toast.success("Synchronisation globale terminée", {
          position: "top-right",
          autoClose: 5000,
        });
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

  // Exposer les fonctions
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
