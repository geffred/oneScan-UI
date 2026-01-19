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
import useDexisAuth from "../Config/useDexisAuth"; // IMPORT DU HOOK DEXIS

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
import useBackblazeStatus from "./hooks/useBackblazeStatus";
import "./Commandes.css";
import "./ui/UIStates.css";

// Import des utilitaires
import { getUserData, getUserPlatforms, getCommandes } from "./commandesUtils";

const Commandes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // --- États avec restauration depuis le localStorage ---
  const savedState = JSON.parse(localStorage.getItem("commandesState") || "{}");

  const [searchTerm, setSearchTerm] = useState(savedState.searchTerm || "");
  const [selectedPlateforme, setSelectedPlateforme] = useState(
    savedState.selectedPlateforme || "",
  );
  const [showOnlyUnread, setShowOnlyUnread] = useState(
    savedState.showOnlyUnread || false,
  );
  const [dateFilter, setDateFilter] = useState(savedState.dateFilter || "all");
  const [customDateFrom, setCustomDateFrom] = useState(
    savedState.customDateFrom || "",
  );
  const [customDateTo, setCustomDateTo] = useState(
    savedState.customDateTo || "",
  );
  const [deadlineFilter, setDeadlineFilter] = useState(
    savedState.deadlineFilter || "all",
  );
  const [customDeadlineFrom, setCustomDeadlineFrom] = useState(
    savedState.customDeadlineFrom || "",
  );
  const [customDeadlineTo, setCustomDeadlineTo] = useState(
    savedState.customDeadlineTo || "",
  );
  const [syncStatus, setSyncStatus] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
  const [itemsPerPage] = useState(25);

  const hasRestoredState = React.useRef(false);

  // --- Sauvegarde automatique dans le localStorage ---
  useEffect(() => {
    const stateToSave = {
      searchTerm,
      selectedPlateforme,
      showOnlyUnread,
      dateFilter,
      customDateFrom,
      customDateTo,
      deadlineFilter,
      customDeadlineFrom,
      customDeadlineTo,
      currentPage,
    };
    localStorage.setItem("commandesState", JSON.stringify(stateToSave));
  }, [
    searchTerm,
    selectedPlateforme,
    showOnlyUnread,
    dateFilter,
    customDateFrom,
    customDateTo,
    deadlineFilter,
    customDeadlineFrom,
    customDeadlineTo,
    currentPage,
  ]);

  // --- Reset pagination ---
  const previousFiltersRef = React.useRef({
    searchTerm,
    selectedPlateforme,
    showOnlyUnread,
    dateFilter,
    customDateFrom,
    customDateTo,
    deadlineFilter,
    customDeadlineFrom,
    customDeadlineTo,
  });

  useEffect(() => {
    if (!hasRestoredState.current) {
      hasRestoredState.current = true;
      previousFiltersRef.current = {
        searchTerm,
        selectedPlateforme,
        showOnlyUnread,
        dateFilter,
        customDateFrom,
        customDateTo,
        deadlineFilter,
        customDeadlineFrom,
        customDeadlineTo,
      };
      return;
    }

    const prev = previousFiltersRef.current;
    const filtersChanged =
      prev.searchTerm !== searchTerm ||
      prev.selectedPlateforme !== selectedPlateforme ||
      prev.showOnlyUnread !== showOnlyUnread ||
      prev.dateFilter !== dateFilter ||
      prev.customDateFrom !== customDateFrom ||
      prev.customDateTo !== customDateTo ||
      prev.deadlineFilter !== deadlineFilter ||
      prev.customDeadlineFrom !== customDeadlineFrom ||
      prev.customDeadlineTo !== customDeadlineTo;

    if (filtersChanged) {
      setCurrentPage(1);
      previousFiltersRef.current = {
        searchTerm,
        selectedPlateforme,
        showOnlyUnread,
        dateFilter,
        customDateFrom,
        customDateTo,
        deadlineFilter,
        customDeadlineFrom,
        customDeadlineTo,
      };
    }
  }, [
    searchTerm,
    selectedPlateforme,
    showOnlyUnread,
    dateFilter,
    customDateFrom,
    customDateTo,
    deadlineFilter,
    customDeadlineFrom,
    customDeadlineTo,
  ]);

  // Hooks d'authentification
  const backblazeStatus = useBackblazeStatus(isAuthenticated);

  const meditlinkAuth = useMeditLinkAuth({
    autoRefresh: false,
    refreshInterval: 0,
    fetchOnMount: true,
  });

  const threeshapeAuth = useThreeShapeAuth();

  // Hook Dexis
  const dexisAuth = useDexisAuth({
    refreshInterval: 10000, // check régulier
  });

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
    },
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
      refreshInterval: 60000,
      errorRetryCount: 3,
    },
  );

  const {
    syncMeditLinkCommandes,
    syncOtherPlatform,
    syncPlatformCommandes,
    syncAllPlatforms,
  } = useSyncPlatforms({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
  });

  // --- TOGGLE VU/NON-VU OPTIMISÉ (Optimistic UI) ---
  const handleToggleVu = async (commandeCible) => {
    const nouveauStatutVu = !commandeCible.vu;

    const commandesOptimistes = commandes.map((c) =>
      c.id === commandeCible.id ? { ...c, vu: nouveauStatutVu } : c,
    );

    await mutateCommandes(commandesOptimistes, false);

    try {
      const endpoint = commandeCible.vu ? "non-vu" : "vu";
      const url = `${import.meta.env.VITE_API_BASE_URL}/public/commandes/${
        commandeCible.id
      }/${endpoint}`;
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      mutateCommandes();
    } catch (error) {
      console.error("Erreur API:", error);
      mutateCommandes();
      alert("Impossible de modifier le statut. Veuillez réessayer.");
    }
  };

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
      deadlineFilter: (e) => {
        setDeadlineFilter(e.target.value);
        setCurrentPage(1);
      },
      customDeadlineFrom: (e) => {
        setCustomDeadlineFrom(e.target.value);
        setCurrentPage(1);
      },
      customDeadlineTo: (e) => {
        setCustomDeadlineTo(e.target.value);
        setCurrentPage(1);
      },
      viewDetails: (commande) =>
        navigate(`/dashboard/commande/${commande.externalId}`, {
          state: { commande },
        }),
      pageChange: (page) => setCurrentPage(page),
    }),
    [navigate],
  );

  // Construction de l'objet dexisStatus pour le hook
  const dexisStatusObj = useMemo(
    () => ({
      authenticated: dexisAuth.isAuthenticated,
      loading: dexisAuth.isLoading,
      ...dexisAuth.authStatus,
    }),
    [dexisAuth],
  );

  const { stats, filteredCommandes, connectionStatus } = useCommandesData({
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
    dexisStatus: dexisStatusObj, // Passé ici
    backblazeStatus,
  });

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCommandes.length / itemsPerPage);
  }, [filteredCommandes.length, itemsPerPage]);

  const handleSyncPlatform = useCallback(
    (platformName) => {
      syncPlatformCommandes(platformName, connectionStatus.get);
    },
    [syncPlatformCommandes, connectionStatus.get],
  );

  const handleSyncAllPlatforms = useCallback(() => {
    syncAllPlatforms(userPlatforms, connectionStatus.get);
  }, [syncAllPlatforms, userPlatforms, connectionStatus.get]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (commandesError) {
    return (
      <div className="commandes-card">
        <ErrorState onRetry={() => mutateCommandes()} />
      </div>
    );
  }

  if (commandesLoading) {
    return (
      <div className="commandes-card">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="commandes-card">
      <CommandesHeader
        stats={stats}
        userPlatforms={userPlatforms}
        isSyncing={isSyncing}
        onSyncAll={handleSyncAllPlatforms}
      />

      <PlatformsSection
        userPlatforms={userPlatforms}
        syncStatus={syncStatus}
        onSyncPlatform={handleSyncPlatform}
        getConnectionStatus={connectionStatus.get}
        connectedPlatformsCount={stats.connectedPlatformsCount}
        totalPlatformsCount={stats.totalPlatformsCount}
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
        deadlineFilter={deadlineFilter}
        onDeadlineFilterChange={handlers.deadlineFilter}
        customDeadlineFrom={customDeadlineFrom}
        onCustomDeadlineFromChange={handlers.customDeadlineFrom}
        customDeadlineTo={customDeadlineTo}
        onCustomDeadlineToChange={handlers.customDeadlineTo}
        showOnlyUnread={showOnlyUnread}
        onUnreadToggle={handlers.unread}
      />

      <CommandesList
        commandes={filteredCommandes}
        totalCommandes={stats.totalCommandes}
        onViewDetails={handlers.viewDetails}
        onToggleVu={handleToggleVu}
        onSyncAll={handleSyncAllPlatforms}
        connectedPlatformsCount={stats.connectedPlatformsCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlers.pageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default Commandes;
