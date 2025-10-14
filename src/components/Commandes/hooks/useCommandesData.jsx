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
  meditlinkAuth,
  threeshapeAuth,
  googleDriveStatus,
  iteroStatus,
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
            authenticated: true,
            loading: iteroStatus?.loading || false,
            error: iteroStatus?.error || null,
          };
        case "GOOGLE_DRIVE":
          return {
            authenticated: googleDriveStatus.authenticated,
            loading: googleDriveStatus.loading,
            error: googleDriveStatus.error,
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
      iteroStatus,
      googleDriveStatus,
    ]
  );

  // Fonction pour filtrer par date
  const filterByDate = useCallback(
    (commande) => {
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
    [dateFilter, customDateFrom, customDateTo]
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

    // Compter les plateformes connectées (inclure Google Drive)
    const connectedPlatformsCount = userPlatforms.filter((platform) => {
      const connectionStatus = getConnectionStatus(platform.name);
      return connectionStatus.authenticated;
    }).length;

    // Statistiques par plateforme
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
    return (
      commandes
        ?.filter((commande) => {
          const matchesSearch =
            commande.refPatient
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            commande.cabinet
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            commande.externalId?.toString().includes(searchTerm);

          const matchesPlateforme =
            selectedPlateforme === "" ||
            commande.plateforme === selectedPlateforme;
          const matchesUnread = !showOnlyUnread || !commande.vu;
          const matchesDate = filterByDate(commande);

          return (
            matchesSearch && matchesPlateforme && matchesUnread && matchesDate
          );
        })
        .sort(
          (a, b) =>
            new Date(b.dateReception || 0) - new Date(a.dateReception || 0)
        ) || []
    );
  }, [commandes, searchTerm, selectedPlateforme, showOnlyUnread, filterByDate]);

  return {
    stats,
    filteredCommandes,
    connectionStatus: {
      get: getConnectionStatus,
    },
  };
};

export default useCommandesData;
