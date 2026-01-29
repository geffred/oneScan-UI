/* eslint-disable no-case-declarations */
import { useMemo, useCallback } from "react";

export const useCommandesData = ({
  commandes,
  userPlatforms,
  searchTerm,
  selectedPlateforme,
  showOnlyUnread,
  dateFilter,
  customDateFrom,
  customDateTo,
  deadlineFilter,
  customDeadlineFrom,
  customDeadlineTo,
  meditlinkAuth,
  threeshapeAuth,
  backblazeStatus,
  iteroStatus, // Reçu de Commandes.jsx
  dexisStatus,
  csconnectStatus, // Reçu de Commandes.jsx
}) => {
  // Fonction pour obtenir le statut de connexion d'une plateforme
  const getConnectionStatus = useCallback(
    (platformName) => {
      switch (platformName) {
        case "MEDITLINK":
          return {
            authenticated: meditlinkAuth.isAuthenticated,
            userInfo: meditlinkAuth.userInfo,
            ...meditlinkAuth.authStatus,
          };
        case "THREESHAPE":
          return {
            authenticated: threeshapeAuth.isAuthenticated,
            userInfo: threeshapeAuth.userInfo,
            ...threeshapeAuth.authStatus,
          };
        case "ITERO":
          return {
            authenticated: iteroStatus?.authenticated || false,
            loading: iteroStatus?.loading || false,
            error: iteroStatus?.error || null,
          };
        case "DEXIS":
          return {
            authenticated: dexisStatus?.authenticated || false,
            loading: dexisStatus?.loading || false,
            error: dexisStatus?.error || null,
          };
        case "CSCONNECT":
          return {
            authenticated: csconnectStatus?.authenticated || false,
            loading: csconnectStatus?.loading || false,
            error: csconnectStatus?.error || null,
          };
        case "MYSMILELAB":
          return {
            authenticated: backblazeStatus.authenticated,
            loading: backblazeStatus.loading,
            error: backblazeStatus.error,
            provider: backblazeStatus.provider,
          };
        default:
          return { authenticated: false };
      }
    },
    [
      meditlinkAuth.isAuthenticated,
      meditlinkAuth.userInfo,
      meditlinkAuth.authStatus,
      threeshapeAuth.isAuthenticated,
      threeshapeAuth.userInfo,
      threeshapeAuth.authStatus,
      iteroStatus, // AJOUTÉ AUX DÉPENDANCES
      dexisStatus,
      csconnectStatus, // AJOUTÉ AUX DÉPENDANCES
      backblazeStatus,
    ],
  );

  // Fonction pour filtrer par date de réception
  const filterByDate = useCallback(
    (commande) => {
      if (dateFilter === "all") return true;
      if (!commande.dateReception) return false;

      const receptionDate = new Date(commande.dateReception);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return receptionDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return receptionDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return receptionDate >= monthAgo;
        case "custom":
          if (!customDateFrom && !customDateTo) return true;
          const fromDate = customDateFrom
            ? new Date(customDateFrom)
            : new Date(0);
          const toDate = customDateTo ? new Date(customDateTo) : new Date();
          toDate.setHours(23, 59, 59, 999);
          return receptionDate >= fromDate && receptionDate <= toDate;
        default:
          return true;
      }
    },
    [dateFilter, customDateFrom, customDateTo],
  );

  // Fonction pour filtrer par date d'échéance
  const filterByDeadline = useCallback(
    (commande) => {
      if (deadlineFilter === "all") return true;
      if (!commande.dateEcheance) return false;

      const echeance = new Date(commande.dateEcheance);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (deadlineFilter) {
        case "expired":
          return echeance < today;
        case "today":
          return echeance.toDateString() === today.toDateString();
        case "tomorrow":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return echeance.toDateString() === tomorrow.toDateString();
        case "week":
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          weekEnd.setHours(23, 59, 59, 999);
          return echeance >= today && echeance <= weekEnd;
        case "month":
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
          );
          monthEnd.setHours(23, 59, 59, 999);
          return echeance >= today && echeance <= monthEnd;
        case "custom":
          if (!customDeadlineFrom && !customDeadlineTo) return true;
          const fromDate = customDeadlineFrom
            ? new Date(customDeadlineFrom)
            : new Date(0);
          const toDate = customDeadlineTo
            ? new Date(customDeadlineTo)
            : new Date();
          toDate.setHours(23, 59, 59, 999);
          return echeance >= fromDate && echeance <= toDate;
        default:
          return true;
      }
    },
    [deadlineFilter, customDeadlineFrom, customDeadlineTo],
  );

  // Calcul des statistiques mémorisées
  const stats = useMemo(() => {
    const totalCommandes = commandes?.length || 0;
    const commandesNonVues = commandes?.filter((cmd) => !cmd.vu).length || 0;
    const commandesEchues =
      commandes?.filter((cmd) => {
        if (!cmd.dateEcheance) return false;
        const today = new Date();
        const echeance = new Date(cmd.dateEcheance);
        return echeance < today;
      }).length || 0;

    const connectedPlatformsCount = userPlatforms.filter((platform) => {
      const connectionStatus = getConnectionStatus(platform.name);
      return connectionStatus.authenticated;
    }).length;

    const statsByPlatform = {};
    commandes?.forEach((cmd) => {
      const platform = cmd.plateforme;
      if (!statsByPlatform[platform]) {
        statsByPlatform[platform] = {
          total: 0,
          nonVues: 0,
          echues: 0,
        };
      }
      statsByPlatform[platform].total++;
      if (!cmd.vu) statsByPlatform[platform].nonVues++;
      if (cmd.dateEcheance && new Date(cmd.dateEcheance) < new Date()) {
        statsByPlatform[platform].echues++;
      }
    });

    return {
      totalCommandes,
      commandesNonVues,
      commandesEchues,
      connectedPlatformsCount,
      totalPlatformsCount: userPlatforms.length,
      statsByPlatform,
    };
  }, [commandes, userPlatforms, getConnectionStatus]);

  // Filtrage et tri des commandes mémorisés
  const filteredCommandes = useMemo(() => {
    const filtered =
      commandes?.filter((commande) => {
        const matchesSearch =
          commande.refPatient
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          commande.cabinet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          commande.externalId?.toString().includes(searchTerm);

        const matchesPlateforme =
          selectedPlateforme === "" ||
          commande.plateforme === selectedPlateforme;
        const matchesUnread = !showOnlyUnread || !commande.vu;
        const matchesDate = filterByDate(commande);
        const matchesDeadline = filterByDeadline(commande);

        return (
          matchesSearch &&
          matchesPlateforme &&
          matchesUnread &&
          matchesDate &&
          matchesDeadline
        );
      }) || [];

    return filtered.sort((a, b) => {
      if (deadlineFilter !== "all") {
        const echeanceA = a.dateEcheance
          ? new Date(a.dateEcheance).getTime()
          : Infinity;
        const echeanceB = b.dateEcheance
          ? new Date(b.dateEcheance).getTime()
          : Infinity;
        return echeanceA - echeanceB;
      }
      return new Date(b.dateReception || 0) - new Date(a.dateReception || 0);
    });
  }, [
    commandes,
    searchTerm,
    selectedPlateforme,
    showOnlyUnread,
    filterByDate,
    filterByDeadline,
    deadlineFilter,
  ]);

  return {
    stats,
    filteredCommandes,
    connectionStatus: {
      get: getConnectionStatus,
    },
  };
};

export default useCommandesData;
