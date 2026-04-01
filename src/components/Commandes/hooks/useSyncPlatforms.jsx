import { useCallback } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const platformEndpoints = {
  MEDITLINK: `${API_BASE_URL}/meditlink/cases/save`,
  ITERO: `${API_BASE_URL}/itero/commandes/save`,
  DEXIS: `${API_BASE_URL}/dexis/cases/sync`,
  THREESHAPE: `${API_BASE_URL}/threeshape/cases/save`,
  CSCONNECT: `${API_BASE_URL}/csconnect/commandes`,
};

export const useSyncPlatforms = ({
  mutateCommandes,
  setSyncStatus,
  setIsSyncing,
  getConnectionStatus, // ← FIX : reçu ici une fois, pas à chaque appel
}) => {
  // ── Fonction générique de sync ────────────────────────────────────────────
  const syncPlatform = useCallback(
    async (platformName, endpoint, method = "POST") => {
      setSyncStatus((prev) => ({
        ...prev,
        [platformName]: {
          status: "loading",
          message: "Synchronisation en cours...",
        },
      }));

      try {
        const token = localStorage.getItem("token");
        let finalEndpoint = endpoint;
        if (platformName === "THREESHAPE")
          finalEndpoint += "?startPage=0&endPage=5";

        const response = await fetch(finalEndpoint, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(method === "POST" && { "Content-Type": "application/json" }),
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          mutateCommandes();

          let savedCount = 0,
            updatedCount = 0,
            totalCount = 0;
          if (platformName === "DEXIS") {
            savedCount = result.syncedCount || 0;
            updatedCount = result.updatedCount || 0;
            totalCount = savedCount;
          } else if (platformName === "CSCONNECT") {
            const commandes = result.commandes || result;
            totalCount = savedCount = Array.isArray(commandes)
              ? commandes.length
              : 0;
          } else if (platformName === "THREESHAPE") {
            savedCount = result.savedCount || 0;
            updatedCount = result.updatedCount || 0;
            totalCount = result.totalProcessed || savedCount + updatedCount;
          } else {
            savedCount = result.savedCount || result.count || 0;
            updatedCount = result.updatedCount || 0;
            totalCount = savedCount + updatedCount;
          }

          const detailMessage =
            updatedCount > 0
              ? `${savedCount} nouvelle(s), ${updatedCount} mise(s) à jour`
              : `${savedCount} commande(s) synchronisée(s)`;

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "success",
              message: "Synchronisation terminée",
              count: totalCount,
              savedCount,
              updatedCount,
            },
          }));

          toast.success(`${platformName}: ${detailMessage}`, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          const errorText = await response.text();
          let errorMessage = `Erreur: ${response.status}`;
          if (platformName === "DEXIS" && response.status === 401)
            errorMessage = "Session expirée. Veuillez vous reconnecter.";

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: { status: "error", message: errorMessage },
          }));
          toast.error(`${platformName}: ${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (err) {
        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: { status: "error", message: "Erreur de connexion" },
        }));
        toast.error(`${platformName}: Erreur de connexion`, {
          position: "top-right",
          autoClose: 5000,
        });
      }

      setTimeout(() => {
        setSyncStatus((prev) => {
          const s = { ...prev };
          delete s[platformName];
          return s;
        });
      }, 5000);
    },
    [mutateCommandes, setSyncStatus],
  );

  // ── Fonctions spécifiques ─────────────────────────────────────────────────
  const syncMeditLinkCommandes = useCallback(
    () =>
      syncPlatform(
        "MEDITLINK",
        `${API_BASE_URL}/meditlink/cases/save?page=0&size=20`,
        "POST",
      ),
    [syncPlatform],
  );

  const syncIteroCommandes = useCallback(
    () => syncPlatform("ITERO", `${API_BASE_URL}/itero/commandes/save`, "POST"),
    [syncPlatform],
  );

  const syncDexisCommandes = useCallback(
    () =>
      syncPlatform("DEXIS", `${API_BASE_URL}/dexis/cases/sync?limit=20`, "GET"),
    [syncPlatform],
  );

  const syncCsConnectCommandes = useCallback(
    () =>
      syncPlatform("CSCONNECT", `${API_BASE_URL}/csconnect/commandes`, "GET"),
    [syncPlatform],
  );

  const syncOtherPlatform = useCallback(
    (platformName) => {
      const endpoint = platformEndpoints[platformName];
      if (!endpoint) {
        console.error(`Endpoint non trouvé pour: ${platformName}`);
        return;
      }
      const method = ["MEDITLINK", "THREESHAPE", "DEXIS"].includes(platformName)
        ? "GET"
        : "POST";
      return syncPlatform(platformName, endpoint, method);
    },
    [syncPlatform],
  );

  // ── FIX : syncPlatformCommandes n'attend plus getConnectionStatus en argument
  const syncPlatformCommandes = useCallback(
    (platformName) => {
      // Utilise getConnectionStatus injecté au niveau du hook
      if (!getConnectionStatus) {
        console.error("getConnectionStatus non fourni à useSyncPlatforms");
        return;
      }

      const connectionStatus = getConnectionStatus(platformName);
      if (!connectionStatus?.authenticated) {
        toast.warning(`${platformName}: Veuillez d'abord vous connecter`, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

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
      getConnectionStatus,
      syncMeditLinkCommandes,
      syncIteroCommandes,
      syncDexisCommandes,
      syncCsConnectCommandes,
      syncOtherPlatform,
    ],
  );

  // ── FIX : syncAllPlatforms n'attend plus getConnectionStatus en argument
  const syncAllPlatforms = useCallback(
    async (userPlatforms) => {
      if (!userPlatforms?.length) return;
      if (!getConnectionStatus) {
        console.error("getConnectionStatus non fourni à useSyncPlatforms");
        return;
      }

      setIsSyncing(true);

      const connectedPlatforms = userPlatforms.filter(
        (p) => getConnectionStatus(p.name)?.authenticated,
      );

      if (!connectedPlatforms.length) {
        toast.warning("Aucune plateforme connectée", {
          position: "top-right",
          autoClose: 5000,
        });
        setIsSyncing(false);
        return;
      }

      const syncPromises = connectedPlatforms.map((p) => {
        switch (p.name) {
          case "MEDITLINK":
            return syncMeditLinkCommandes();
          case "ITERO":
            return syncIteroCommandes();
          case "DEXIS":
            return syncDexisCommandes();
          case "CSCONNECT":
            return syncCsConnectCommandes();
          default:
            return syncOtherPlatform(p.name);
        }
      });

      try {
        await Promise.all(syncPromises);
        toast.success("Synchronisation globale terminée", {
          position: "top-right",
          autoClose: 5000,
        });
      } catch (error) {
        console.error("Erreur synchronisation globale:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [
      getConnectionStatus,
      setIsSyncing,
      syncMeditLinkCommandes,
      syncIteroCommandes,
      syncDexisCommandes,
      syncCsConnectCommandes,
      syncOtherPlatform,
    ],
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
