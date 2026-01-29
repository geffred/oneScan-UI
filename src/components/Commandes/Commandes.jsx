/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { toast } from "react-toastify"; // Assurez-vous d'avoir react-toastify
import { AuthContext } from "../../components/Config/AuthContext";
import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";
import useDexisAuth from "../Config/useDexisAuth";

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
import { EmailService } from "../CommandeDetails/EmailService"; // Import du service Email
import "./Commandes.css";
import "./ui/UIStates.css";

// Import des utilitaires
import { getUserData, getUserPlatforms, getCommandes } from "./commandesUtils";

const Commandes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // --- NOUVEAU : État pour la sélection multiple ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const hasRestoredState = useRef(false);

  // --- États pour les statuts manuels ---
  const [iteroStatus, setIteroStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });
  const [csConnectStatus, setCsConnectStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });

  // ... (Vos useEffects de sauvegarde localStorage et reset pagination restent ici - inchangés) ...
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

  const previousFiltersRef = useRef({
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
      setSelectedIds([]); // Reset selection on filter change
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

  // ... (Logique de vérification Itero/CSConnect inchangée) ...
  const checkIteroStatus = useCallback(async () => {
    /* ...code... */
  }, [API_BASE_URL]);
  const checkCsConnectStatus = useCallback(async () => {
    /* ...code... */
  }, [API_BASE_URL]);

  // Hooks d'authentification
  const backblazeStatus = useBackblazeStatus(isAuthenticated);
  const meditlinkAuth = useMeditLinkAuth({
    autoRefresh: false,
    refreshInterval: 0,
    fetchOnMount: true,
  });
  const threeshapeAuth = useThreeShapeAuth();
  const dexisAuth = useDexisAuth({ refreshInterval: 10000 });

  // Hooks SWR
  const { data: userData, isLoading: userLoading } = useSWR(
    isAuthenticated ? "user-data" : null,
    getUserData,
    { revalidateOnFocus: false, revalidateOnReconnect: true },
  );
  const { data: userPlatforms = [], isLoading: platformsLoading } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
    { revalidateOnFocus: false, revalidateOnReconnect: true },
  );

  const {
    data: commandes = [],
    error: commandesError,
    isLoading: commandesLoading,
    mutate: mutateCommandes,
  } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/public/commandes` : null,
    getCommandes,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000,
    },
  );

  const { syncPlatformCommandes, syncAllPlatforms } = useSyncPlatforms({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
  });

  // --- Handlers Actions Unitaires ---
  const handleToggleVu = async (commandeCible) => {
    // ... (votre code existant) ...
    // Optimistic UI update
    const nouveauStatutVu = !commandeCible.vu;
    const commandesOptimistes = commandes.map((c) =>
      c.id === commandeCible.id ? { ...c, vu: nouveauStatutVu } : c,
    );
    await mutateCommandes(commandesOptimistes, false);

    try {
      const endpoint = commandeCible.vu ? "non-vu" : "vu";
      await fetch(
        `${API_BASE_URL}/public/commandes/${commandeCible.id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      mutateCommandes();
    } catch (e) {
      mutateCommandes();
    }
  };

  // --- Handlers (Navigation, Filtres, Pagination) ---
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

  // =================================================================
  // --- NOUVEAU : LOGIQUE DE SELECTION ET ACTIONS DE MASSE ---
  // =================================================================

  // 1. Sélection
  const handleSelectOne = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback((idsToSelect) => {
    setSelectedIds(idsToSelect);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 2. Suppression de masse
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} commandes ? Cette action est irréversible.`,
      )
    )
      return;

    setIsBulkProcessing(true);
    const token = localStorage.getItem("token");
    try {
      // Exécution parallèle des suppressions
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/public/commandes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );

      toast.success(`${selectedIds.length} commandes supprimées.`);
      setSelectedIds([]);
      mutateCommandes();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression de certaines commandes.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // 3. Changement de statut de masse (+ Email si EXPEDIEE)
  const handleBulkStatusChange = async (newStatus) => {
    if (
      !window.confirm(
        `Passer ${selectedIds.length} commandes au statut "${newStatus}" ?`,
      )
    )
      return;

    setIsBulkProcessing(true);
    const token = localStorage.getItem("token");
    let successCount = 0;
    let emailCount = 0;

    try {
      const updates = selectedIds.map(async (id) => {
        // A. Mise à jour du statut en base de données
        const res = await fetch(
          `${API_BASE_URL}/public/commandes/statut/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ statut: newStatus }),
          },
        );

        if (!res.ok) throw new Error(`Échec update ID ${id}`);
        const updatedCmd = await res.json();
        successCount++;

        // B. Envoi d'email automatique si EXPEDIEE
        if (newStatus === "EXPEDIEE") {
          try {
            // Il faut récupérer les infos complètes si elles manquent (ex: email cabinet)
            // Ici on suppose que 'updatedCmd' contient le nom du cabinet, mais il nous faut l'objet cabinet complet
            // Option : Récupérer le cabinet via un endpoint ou passer l'objet s'il est dispo

            // Pour simplifier, on va chercher le cabinet dans la liste 'userPlatforms' ou via une requête
            // Note: Dans votre modèle actuel, le cabinet est une String dans Commande, mais il y a cabinetId.

            if (updatedCmd.cabinetId) {
              // Récupérer les infos du cabinet pour avoir l'email
              const cabRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/cabinet/${updatedCmd.cabinetId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              if (cabRes.ok) {
                const cabinetData = await cabRes.json();
                // Envoi via EmailJS
                await EmailService.sendEmailNotification(
                  updatedCmd,
                  cabinetData,
                  "Votre commande a été expédiée.",
                );
                await EmailService.markNotificationAsSent(id);
                emailCount++;
              }
            }
          } catch (err) {
            console.error(`Erreur envoi email pour commande ${id}`, err);
          }
        }
      });

      await Promise.all(updates);

      let msg = `${successCount} commandes mises à jour.`;
      if (emailCount > 0) msg += ` ${emailCount} emails envoyés.`;
      toast.success(msg);

      setSelectedIds([]);
      mutateCommandes();
    } catch (error) {
      console.error("Erreur bulk status:", error);
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // 4. Marquer comme Lu/Non Lu en masse
  const handleBulkReadToggle = async (markAsRead) => {
    setIsBulkProcessing(true);
    const token = localStorage.getItem("token");
    const endpoint = markAsRead ? "vu" : "non-vu";

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/public/commandes/${id}/${endpoint}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      toast.success(
        `Commandes marquées comme ${markAsRead ? "lues" : "non lues"}`,
      );
      setSelectedIds([]);
      mutateCommandes();
    } catch (e) {
      toast.error("Erreur lors de l'opération");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // --- Fin Logique de Masse ---

  // ... (Code existant pour handlers, memoization, effects...) ...

  const dexisStatusObj = useMemo(
    () => ({
      authenticated: dexisAuth.isAuthenticated,
      loading: dexisAuth.isLoading,
      ...dexisAuth.authStatus,
    }),
    [dexisAuth],
  );

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else {
      checkIteroStatus();
      checkCsConnectStatus();
    }
  }, [isAuthenticated, checkIteroStatus, checkCsConnectStatus, navigate]);

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
    dexisStatus: dexisStatusObj,
    backblazeStatus,
    iteroStatus,
    csconnectStatus: csConnectStatus,
  });

  const totalPages = useMemo(
    () => Math.ceil(filteredCommandes.length / itemsPerPage),
    [filteredCommandes.length, itemsPerPage],
  );

  const handleSyncPlatform = useCallback(
    (platformName) => syncPlatformCommandes(platformName, connectionStatus.get),
    [syncPlatformCommandes, connectionStatus.get],
  );
  const handleSyncAllPlatforms = useCallback(
    () => syncAllPlatforms(userPlatforms, connectionStatus.get),
    [syncAllPlatforms, userPlatforms, connectionStatus.get],
  );

  if (commandesError)
    return (
      <div className="commandes-card">
        <ErrorState onRetry={() => mutateCommandes()} />
      </div>
    );
  if (commandesLoading)
    return (
      <div className="commandes-card">
        <LoadingState />
      </div>
    );

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
        // --- PROPS POUR LA SELECTION ET ACTIONS DE MASSE ---
        selectedIds={selectedIds}
        onSelectOne={handleSelectOne}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkReadToggle={handleBulkReadToggle}
        isBulkProcessing={isBulkProcessing}
      />
    </div>
  );
};

export default Commandes;
