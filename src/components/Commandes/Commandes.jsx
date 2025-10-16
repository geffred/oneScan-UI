/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { AuthContext } from "../../components/Config/AuthContext";
import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";

// Import des composants
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import CommandesFilters from "./CommandesFilters";
import PlatformsSection from "./Platforms/PlatformsSection";
import CommandesHeader from "./CommandesHeader";
import CommandesList from "./CommandesList";

// Import des hooks personnalisés
import useCommandesData from "./hooks/useCommandesData";
import useSyncPlatforms from "./hooks/useSyncPlatforms";
import useAutoSync from "./hooks/useAutoSync";
import useGoogleDriveStatus from "./hooks/useGoogleDriveStatus";
import "./Commandes.css";
import "./ui/UIStates.css";

// Import des utilitaires
import { getUserData, getUserPlatforms, getCommandes } from "./commandesUtils";

const Commandes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // États
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlateforme, setSelectedPlateforme] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [syncStatus, setSyncStatus] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Hooks d'authentification
  const googleDriveStatus = useGoogleDriveStatus(isAuthenticated);

  const meditlinkAuth = useMeditLinkAuth({
    autoRefresh: false,
    refreshInterval: 0,
    fetchOnMount: true,
  });

  const threeshapeAuth = useThreeShapeAuth();

  // Hooks SWR pour les données
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "user-data" : null, getUserData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
  });

  const {
    data: userPlatforms = [],
    error: platformsError,
    isLoading: platformsLoading,
  } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  const {
    data: commandes = [],
    error: commandesError,
    isLoading: commandesLoading,
    mutate: mutateCommandes,
  } = useSWR(
    isAuthenticated
      ? `${import.meta.env.VITE_API_BASE_URL}/public/commandes`
      : null,
    getCommandes,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Rafraîchissement automatique toutes les 30s
      errorRetryCount: 3,
    }
  );

  // Hooks de synchronisation
  const {
    syncMeditLinkCommandes,
    syncOtherPlatform,
    syncPlatformCommandes,
    syncAllPlatforms: syncAllManual,
  } = useSyncPlatforms({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
  });

  // Hook de synchronisation automatique
  const {
    startAutoSync,
    stopAutoSync,
    manualSync,
    isAutoSyncActive,
    syncInterval,
    changeSyncInterval,
  } = useAutoSync({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
  });

  // Démarrer la synchronisation automatique au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "🔐 Utilisateur authentifié, démarrage synchronisation automatique"
      );
      startAutoSync(1); // Synchroniser toutes les 1 minute par défaut
    } else {
      console.log("🔒 Utilisateur non authentifié, arrêt synchronisation");
      stopAutoSync();
    }

    return () => {
      console.log("🧹 Nettoyage composant Commandes");
      stopAutoSync();
    };
  }, [isAuthenticated, startAutoSync, stopAutoSync]);

  // Raccourcis pour les handlers
  const handlers = useMemo(
    () => ({
      search: (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      },
      plateforme: (e) => {
        setSelectedPlateforme(e.target.value);
        setCurrentPage(1);
      },
      dateFilter: (e) => {
        setDateFilter(e.target.value);
        setCurrentPage(1);
      },
      unread: (e) => {
        setShowOnlyUnread(e.target.checked);
        setCurrentPage(1);
      },
      customDateFrom: (e) => {
        setCustomDateFrom(e.target.value);
        setCurrentPage(1);
      },
      customDateTo: (e) => {
        setCustomDateTo(e.target.value);
        setCurrentPage(1);
      },
      viewDetails: (commande) =>
        navigate(`/dashboard/commande/${commande.externalId}`, {
          state: { commande },
        }),
      pageChange: (page) => setCurrentPage(page),
      manualSync: () => {
        manualSync();
      },
      toggleAutoSync: () => {
        if (isAutoSyncActive) {
          stopAutoSync();
        } else {
          startAutoSync();
        }
      },
      changeSyncInterval: (newInterval) => {
        changeSyncInterval(newInterval);
      },
    }),
    [
      navigate,
      manualSync,
      startAutoSync,
      stopAutoSync,
      isAutoSyncActive,
      changeSyncInterval,
    ]
  );

  // Calculs mémorisés
  const { stats, filteredCommandes, connectionStatus } = useCommandesData({
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
  });

  // Calcul de la pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCommandes.length / itemsPerPage);
  }, [filteredCommandes.length, itemsPerPage]);

  // Reset à la première page quand les données changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCommandes.length]);

  // Handler pour synchroniser une plateforme spécifique
  const handleSyncPlatform = useCallback(
    (platformName) => {
      syncPlatformCommandes(platformName, connectionStatus.get);
    },
    [syncPlatformCommandes, connectionStatus.get]
  );

  // Handler pour synchroniser toutes les plateformes (manuel)
  const handleSyncAllPlatforms = useCallback(() => {
    syncAllManual(userPlatforms, connectionStatus.get);
  }, [syncAllManual, userPlatforms, connectionStatus.get]);

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Affichage du statut de synchronisation automatique dans la console
  useEffect(() => {
    if (isAutoSyncActive) {
      console.log(
        `🔄 Synchronisation automatique active - Intervalle: ${syncInterval} minutes`
      );
    }
  }, [isAutoSyncActive, syncInterval]);

  // Gestion des erreurs
  if (userLoading || platformsLoading || commandesLoading) {
    return (
      <div className="commandes-card">
        <LoadingState />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="commandes-card">
        <ErrorState
          message="Erreur lors du chargement des données utilisateur"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (platformsError) {
    return (
      <div className="commandes-card">
        <ErrorState
          message="Erreur lors du chargement des plateformes"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (commandesError) {
    return (
      <div className="commandes-card">
        <ErrorState
          message="Erreur lors du chargement des commandes"
          onRetry={() => mutateCommandes()}
        />
      </div>
    );
  }

  return (
    <div className="commandes-card">
      <CommandesHeader
        stats={stats}
        userPlatforms={userPlatforms}
        isSyncing={isSyncing}
        isAutoSyncActive={isAutoSyncActive}
        syncInterval={syncInterval}
        onSyncAll={handleSyncAllPlatforms}
        onManualSync={handlers.manualSync}
        onToggleAutoSync={handlers.toggleAutoSync}
        onChangeSyncInterval={handlers.changeSyncInterval}
      />

      <PlatformsSection
        userPlatforms={userPlatforms}
        syncStatus={syncStatus}
        onSyncPlatform={handleSyncPlatform}
        getConnectionStatus={connectionStatus.get}
        connectedPlatformsCount={stats.connectedPlatformsCount}
        totalPlatformsCount={stats.totalPlatformsCount}
        isAutoSyncActive={isAutoSyncActive}
        syncInterval={syncInterval}
      />

      <CommandesFilters
        searchTerm={searchTerm}
        onSearchChange={handlers.search}
        selectedPlateforme={selectedPlateforme}
        onPlateformeChange={handlers.plateforme}
        dateFilter={dateFilter}
        onDateFilterChange={handlers.dateFilter}
        customDateFrom={customDateFrom}
        onCustomDateFromChange={handlers.customDateFrom}
        customDateTo={customDateTo}
        onCustomDateToChange={handlers.customDateTo}
        showOnlyUnread={showOnlyUnread}
        onUnreadToggle={handlers.unread}
        platforms={userPlatforms}
      />

      <CommandesList
        commandes={filteredCommandes}
        totalCommandes={stats.totalCommandes}
        onViewDetails={handlers.viewDetails}
        onSyncAll={handleSyncAllPlatforms}
        connectedPlatformsCount={stats.connectedPlatformsCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlers.pageChange}
        itemsPerPage={itemsPerPage}
        isAutoSyncActive={isAutoSyncActive}
        syncInterval={syncInterval}
        isSyncing={isSyncing}
      />

      {/* Indicateur de synchronisation automatique */}
      {isAutoSyncActive && (
        <div className="auto-sync-indicator">
          <div className="auto-sync-pulse"></div>
          <span>
            Synchronisation automatique active - Prochaine synchro dans ~
            {syncInterval} minute(s)
          </span>
        </div>
      )}
    </div>
  );
};

export default Commandes;
