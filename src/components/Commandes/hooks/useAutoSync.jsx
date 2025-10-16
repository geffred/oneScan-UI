// src/components/Commandes/hooks/useAutoSync.js
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CommandeNotificationService } from "../CommandeNotificationService";

export const useAutoSync = ({
  mutateCommandes,
  setSyncStatus,
  setIsSyncing,
}) => {
  const syncIntervalRef = useRef(null);
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(false);
  const [syncInterval, setSyncInterval] = useState(1); // 1 minute par défaut

  // Fonction pour vérifier les nouvelles commandes et envoyer des notifications
  const checkNewCommandesAndNotify = useCallback(
    async (currentCommandes, previousCommandes) => {
      try {
        // Créer un Set des IDs des commandes précédentes
        const previousIds = new Set(
          previousCommandes.map((cmd) => cmd.externalId)
        );

        // Identifier les nouvelles commandes
        const newCommandes = currentCommandes.filter(
          (cmd) => !previousIds.has(cmd.externalId) && !cmd.commandeNotification
        );

        if (newCommandes.length === 0) {
          console.log("📭 Aucune nouvelle commande à notifier");
          return 0;
        }

        console.log(
          `📨 ${newCommandes.length} nouvelle(s) commande(s) détectée(s)`
        );

        let notificationsSent = 0;

        // Envoyer les notifications pour chaque nouvelle commande
        for (const commande of newCommandes) {
          try {
            // Envoyer la notification par email
            await CommandeNotificationService.sendNewCommandeNotification(
              commande
            );

            // Marquer la commande comme notifiée
            await CommandeNotificationService.markCommandeNotificationAsSent(
              commande.id
            );

            notificationsSent++;
            console.log(`✅ Notification envoyée pour: ${commande.externalId}`);

            // Petit délai entre chaque envoi pour éviter le spam
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(
              `❌ Erreur notification commande ${commande.externalId}:`,
              error
            );
          }
        }

        return notificationsSent;
      } catch (error) {
        console.error(
          "❌ Erreur lors de la vérification des nouvelles commandes:",
          error
        );
        return 0;
      }
    },
    []
  );

  // Fonction pour synchroniser une plateforme spécifique
  const syncPlatform = useCallback(async (platformName, token) => {
    const endpoints = {
      MEDITLINK: {
        url: `${
          import.meta.env.VITE_API_BASE_URL
        }/meditlink/cases/save?page=0&size=50`,
        method: "POST",
      },
      ITERO: {
        url: `${import.meta.env.VITE_API_BASE_URL}/itero/commandes/save`,
        method: "POST",
      },
      THREESHAPE: {
        url: `${import.meta.env.VITE_API_BASE_URL}/threeshape/cases/save`,
        method: "GET",
      },
      DEXIS: {
        url: `${import.meta.env.VITE_API_BASE_URL}/dexis/commandes`,
        method: "POST",
      },
    };

    const endpoint = endpoints[platformName];
    if (!endpoint) {
      console.warn(`⚠️ Plateforme non configurée: ${platformName}`);
      return;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(endpoint.method === "POST" && {
            "Content-Type": "application/json",
          }),
        },
      });

      if (response.ok) {
        console.log(`✅ ${platformName} synchronisée`);
        return { success: true, platform: platformName };
      } else {
        console.warn(`⚠️ Erreur ${platformName}: ${response.status}`);
        return {
          success: false,
          platform: platformName,
          error: response.status,
        };
      }
    } catch (error) {
      console.error(`❌ Erreur connexion ${platformName}:`, error);
      return { success: false, platform: platformName, error: error.message };
    }
  }, []);

  // Fonction pour synchroniser toutes les plateformes
  const syncAllPlatforms = useCallback(async () => {
    console.log("🔄 Début de la synchronisation automatique...");

    setIsSyncing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("❌ Token manquant pour la synchronisation automatique");
        return;
      }

      // Récupérer l'état actuel des commandes avant la synchronisation
      const responseBefore = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/public/commandes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!responseBefore.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const commandesBefore = await responseBefore.json();

      // Synchroniser toutes les plateformes en parallèle
      const platforms = ["MEDITLINK", "ITERO", "THREESHAPE", "DEXIS"];
      const syncResults = await Promise.allSettled(
        platforms.map((platform) => syncPlatform(platform, token))
      );

      // Analyser les résultats
      const successfulSyncs = syncResults.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      console.log(
        `✅ ${successfulSyncs}/${platforms.length} plateformes synchronisées avec succès`
      );

      // Attendre un peu pour que les synchronisations se terminent
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Rafraîchir les données
      await mutateCommandes();

      // Récupérer les nouvelles commandes après synchronisation
      const responseAfter = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/public/commandes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!responseAfter.ok) {
        throw new Error(
          "Erreur lors de la récupération des commandes après sync"
        );
      }

      const commandesAfter = await responseAfter.json();

      // Identifier et notifier les nouvelles commandes
      const notificationsSent = await checkNewCommandesAndNotify(
        commandesAfter,
        commandesBefore
      );

      // Mettre à jour le statut de synchronisation
      setSyncStatus((prev) => ({
        ...prev,
        AUTO_SYNC: {
          status: "success",
          message: `Sync: ${successfulSyncs}/4 plateformes - ${notificationsSent} nouvelle(s) commande(s)`,
          count: notificationsSent,
          timestamp: new Date().toLocaleTimeString(),
          interval: syncInterval,
        },
      }));

      // Afficher une notification toast si nouvelles commandes
      if (notificationsSent > 0) {
        toast.success(
          `🔄 ${notificationsSent} nouvelle(s) commande(s) synchronisée(s)`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } else if (successfulSyncs > 0) {
        toast.info(`🔄 Synchronisation terminée - Aucune nouvelle commande`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation automatique:", error);

      setSyncStatus((prev) => ({
        ...prev,
        AUTO_SYNC: {
          status: "error",
          message: "Erreur de synchronisation",
          timestamp: new Date().toLocaleTimeString(),
        },
      }));

      toast.error("❌ Erreur lors de la synchronisation automatique", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
    syncPlatform,
    checkNewCommandesAndNotify,
    syncInterval,
  ]);

  // Démarrer la synchronisation automatique
  const startAutoSync = useCallback(
    (intervalMinutes = null) => {
      // Utiliser l'intervalle fourni ou celui par défaut
      const intervalToUse =
        intervalMinutes !== null ? intervalMinutes : syncInterval;

      // Arrêter l'intervalle existant
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }

      setIsAutoSyncActive(true);

      // Démarrer immédiatement une première synchronisation
      syncAllPlatforms();

      // Configurer l'intervalle
      const intervalMs = intervalToUse * 60 * 1000;
      syncIntervalRef.current = setInterval(syncAllPlatforms, intervalMs);

      console.log(
        `🔄 Synchronisation automatique démarrée (toutes les ${intervalToUse} minutes)`
      );
      toast.success(
        `🔄 Auto Sync activé - Toutes les ${intervalToUse} minutes`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    },
    [syncAllPlatforms, syncInterval]
  );

  // Arrêter la synchronisation automatique
  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
      setIsAutoSyncActive(false);
      console.log("⏹️ Synchronisation automatique arrêtée");
      toast.info("⏹️ Auto Sync désactivé", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, []);

  // Changer l'intervalle de synchronisation
  const changeSyncInterval = useCallback(
    (newInterval) => {
      if (newInterval < 1 || newInterval > 60) {
        toast.error("❌ L'intervalle doit être entre 1 et 60 minutes", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      setSyncInterval(newInterval);

      // Si l'auto-sync est actif, redémarrer avec le nouvel intervalle
      if (isAutoSyncActive) {
        startAutoSync(newInterval);
      }

      console.log(
        `⏱️ Intervalle de synchronisation changé à ${newInterval} minutes`
      );
      toast.info(`⏱️ Intervalle défini à ${newInterval} minutes`, {
        position: "top-right",
        autoClose: 3000,
      });
    },
    [isAutoSyncActive, startAutoSync]
  );

  // Synchronisation manuelle
  const manualSync = useCallback(() => {
    console.log("🔄 Synchronisation manuelle déclenchée");
    syncAllPlatforms();
  }, [syncAllPlatforms]);

  // Nettoyer l'intervalle lors du démontage
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    startAutoSync,
    stopAutoSync,
    manualSync,
    syncAllPlatforms,
    isAutoSyncActive,
    syncInterval,
    changeSyncInterval,
  };
};

export default useAutoSync;
