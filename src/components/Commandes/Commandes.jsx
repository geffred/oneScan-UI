/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { toast, ToastContainer } from "react-toastify";
import { Shield, Printer, X, CheckSquare } from "lucide-react";

import { AuthContext } from "../../components/Config/AuthContext";
import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";
import useDexisAuth from "../Config/useDexisAuth";

import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import CommandesFilters from "./CommandesFilters";
import PlatformsSection from "./Platforms/PlatformsSection";
import CommandesHeader from "./CommandesHeader";
import CommandesList from "./CommandesList";
import BulkCertificatModal from "./BulkCertificatModal";

import useCommandesData from "./hooks/useCommandesData";
import useSyncPlatforms from "./hooks/useSyncPlatforms";
import useBackblazeStatus from "./hooks/useBackblazeStatus";
import { getUserIdFromToken } from "../../utils/authUtils";
import { getUserData, getUserPlatforms, getCommandes } from "./commandesUtils";

import "./Commandes.css";
import "./ui/UIStates.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Commandes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const userId = getUserIdFromToken();

  const savedState = JSON.parse(localStorage.getItem("commandesState") || "{}");

  // ── Filtres ────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(savedState.searchTerm || "");
  const [selectedPlateforme, setSelectedPlateforme] = useState(
    savedState.selectedPlateforme || "",
  );
  const [selectedStatut, setSelectedStatut] = useState(
    savedState.selectedStatut || "",
  );
  const [commentFilter, setCommentFilter] = useState(
    savedState.commentFilter || "all",
  );
  const [showOnlyUnread, setShowOnlyUnread] = useState(
    savedState.showOnlyUnread || false,
  );
  const [dateFilter, setDateFilter] = useState(savedState.dateFilter || "all");
  const [deadlineFilter, setDeadlineFilter] = useState(
    savedState.deadlineFilter || "all",
  );
  const [customDateFrom, setCustomDateFrom] = useState(
    savedState.customDateFrom || "",
  );
  const [customDateTo, setCustomDateTo] = useState(
    savedState.customDateTo || "",
  );
  const [customDeadlineFrom, setCustomDeadlineFrom] = useState(
    savedState.customDeadlineFrom || "",
  );
  const [customDeadlineTo, setCustomDeadlineTo] = useState(
    savedState.customDeadlineTo || "",
  );
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
  const itemsPerPage = 25;

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false); // ← FIX
  const [showBulkCertModal, setShowBulkCertModal] = useState(false);
  const [certificatsMap, setCertificatsMap] = useState({});

  // ── FIX : états Itero et CS Connect — absents de l'original ───────────────
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

  // ── Auth hooks ─────────────────────────────────────────────────────────────
  const backblazeStatus = useBackblazeStatus(isAuthenticated);
  const meditlinkAuth = useMeditLinkAuth({ fetchOnMount: true });
  const threeshapeAuth = useThreeShapeAuth();
  const dexisAuth = useDexisAuth({ refreshInterval: 10000 });

  // ── FIX : vérification Itero au montage (copie de Platform.jsx) ───────────
  const checkIteroStatus = useCallback(async () => {
    try {
      setIteroStatus((prev) => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/itero/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIteroStatus({
          authenticated: data.apiStatus === "Connecté",
          loading: false,
          error: null,
        });
      } else {
        setIteroStatus({
          authenticated: false,
          loading: false,
          error: "Erreur check",
        });
      }
    } catch (err) {
      setIteroStatus({
        authenticated: false,
        loading: false,
        error: err.message,
      });
    }
  }, []);

  // ── FIX : vérification CS Connect au montage (copie de Platform.jsx) ──────
  const checkCsConnectStatus = useCallback(async () => {
    try {
      setCsConnectStatus((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/csconnect/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCsConnectStatus({
          authenticated: data.connected || false,
          loading: false,
          error: null,
        });
      } else {
        setCsConnectStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      setCsConnectStatus({
        authenticated: false,
        loading: false,
        error: err.message,
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkIteroStatus();
      checkCsConnectStatus();
    }
  }, [isAuthenticated, checkIteroStatus, checkCsConnectStatus]);

  // ── SWR data ───────────────────────────────────────────────────────────────
  const { data: userData } = useSWR(
    isAuthenticated ? "user-data" : null,
    getUserData,
  );
  const { data: userPlatforms = [] } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
  );
  const {
    data: commandes = [],
    error: commandesError,
    isLoading: commandesLoading,
    mutate: mutateCommandes,
  } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/public/commandes` : null,
    getCommandes,
    { refreshInterval: 60000 },
  );

  // ── useCommandesData AVANT useSyncPlatforms ────────────────────────────────
  // FIX : iteroStatus et csconnectStatus maintenant passés correctement
  const { stats, filteredCommandes, connectionStatus } = useCommandesData({
    commandes,
    userPlatforms,
    searchTerm,
    selectedPlateforme,
    selectedStatut,
    commentFilter,
    showOnlyUnread,
    dateFilter,
    customDateFrom,
    customDateTo,
    deadlineFilter,
    customDeadlineFrom,
    customDeadlineTo,
    meditlinkAuth,
    threeshapeAuth,
    dexisStatus: dexisAuth,
    backblazeStatus,
    iteroStatus, // ← FIX : était absent
    csconnectStatus: csConnectStatus, // ← FIX : était absent
  });

  // ── useSyncPlatforms avec getConnectionStatus injecté ─────────────────────
  const { syncPlatformCommandes, syncAllPlatforms } = useSyncPlatforms({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
    getConnectionStatus: connectionStatus.get,
  });

  const handleSyncPlatform = useCallback(
    (platformName) => syncPlatformCommandes(platformName),
    [syncPlatformCommandes],
  );

  // ── Sauvegarde état filtres ────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(
      "commandesState",
      JSON.stringify({
        searchTerm,
        selectedPlateforme,
        selectedStatut,
        commentFilter,
        showOnlyUnread,
        dateFilter,
        deadlineFilter,
        customDateFrom,
        customDateTo,
        customDeadlineFrom,
        customDeadlineTo,
        currentPage,
      }),
    );
  }, [
    searchTerm,
    selectedPlateforme,
    selectedStatut,
    commentFilter,
    showOnlyUnread,
    dateFilter,
    deadlineFilter,
    customDateFrom,
    customDateTo,
    customDeadlineFrom,
    customDeadlineTo,
    currentPage,
  ]);

  // ── Certificats ───────────────────────────────────────────────────────────
  const loadCertificatsStatus = useCallback(async () => {
    if (!commandes?.length) return;
    try {
      const token = localStorage.getItem("token");
      const ids = commandes.map((c) => c.id).join(",");
      const res = await fetch(
        `${API_BASE_URL}/certificats/batch/exists?commandeIds=${ids}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error();
      setCertificatsMap(await res.json());
    } catch {
      setCertificatsMap({});
    }
  }, [commandes]);

  useEffect(() => {
    loadCertificatsStatus();
  }, [loadCertificatsStatus]);

  const forceReloadCertificats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const cmdRes = await fetch(`${API_BASE_URL}/public/commandes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cmdRes.ok) return;
      const fresh = await cmdRes.json();
      if (!fresh?.length) {
        setCertificatsMap({});
        return;
      }

      const ids = fresh.map((c) => c.id).join(",");
      const certRes = await fetch(
        `${API_BASE_URL}/certificats/batch/exists?commandeIds=${ids}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (certRes.ok) setCertificatsMap(await certRes.json());
    } catch {
      toast.error("Erreur rechargement certificats");
    }
  }, []);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);

  // ── Handlers commandes ────────────────────────────────────────────────────
  const handleViewDetails = useCallback(
    (commande) =>
      navigate(`/dashboard/commande/${commande.externalId}`, {
        state: { commande },
      }),
    [navigate],
  );

  const handleToggleVu = async (commande) => {
    try {
      const endpoint = commande.vu ? "non-vu" : "vu";
      await fetch(
        `${API_BASE_URL}/public/commandes/${commande.id}/${endpoint}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      mutateCommandes(
        (data) =>
          data.map((c) =>
            c.id === commande.id ? { ...c, vu: !commande.vu } : c,
          ),
        false,
      );
    } catch {
      toast.error("Erreur mise à jour statut lecture");
    }
  };

  const handlePrintCertificat = async (commande) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/certificats/commande/${commande.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        },
      );
      if (!res.ok) throw new Error();
      const cert = await res.json();
      window.open(
        `${API_BASE_URL}/certificats/print/${cert.id}?token=${token}`,
        "_blank",
      );
    } catch {
      toast.error(
        `Impossible d'imprimer : aucun certificat pour ${commande.refPatient}`,
      );
    }
  };

  const handleBulkPrint = async () => {
    if (!selectedIds.length) return;
    try {
      const token = localStorage.getItem("token");
      toast.info("Préparation impression groupée...");
      const certIds = [];
      for (const cmdId of selectedIds) {
        const res = await fetch(
          `${API_BASE_URL}/certificats/commande/${cmdId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) certIds.push((await res.json()).id);
      }
      if (!certIds.length) {
        toast.error("Aucun certificat trouvé.");
        return;
      }
      window.open(
        `${API_BASE_URL}/certificats/print-bulk?ids=${certIds.join(",")}&token=${token}`,
        "_blank",
      );
    } catch {
      toast.error("Erreur impression groupée.");
    }
  };

  // ── Sélection ──────────────────────────────────────────────────────────────
  const handleSelectOne = (id) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id],
    );
  const handleSelectAll = (ids) => setSelectedIds(ids);
  const handleClearSelection = () => setSelectedIds([]);

  const handleBulkCertSuccess = async (keepSelection = false) => {
    setShowBulkCertModal(false);
    await mutateCommandes();
    await forceReloadCertificats();
    toast.success("Certificats créés avec succès !");
    if (!keepSelection) handleClearSelection();
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkStatusChange = async (newStatut) => {
    if (!selectedIds.length) return;
    setIsBulkProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/public/commandes/statut/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ statut: newStatut }),
          }),
        ),
      );
      mutateCommandes(
        (data) =>
          data.map((c) =>
            selectedIds.includes(c.id) ? { ...c, statut: newStatut } : c,
          ),
        false,
      );
      toast.success(`${selectedIds.length} commande(s) → ${newStatut}`);
    } catch {
      toast.error("Erreur changement statut");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReadToggle = async (markAsRead) => {
    if (!selectedIds.length) return;
    setIsBulkProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${API_BASE_URL}/public/commandes/${id}/${markAsRead ? "vu" : "non-vu"}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );
      mutateCommandes(
        (data) =>
          data.map((c) =>
            selectedIds.includes(c.id) ? { ...c, vu: markAsRead } : c,
          ),
        false,
      );
      toast.success(
        `${selectedIds.length} commande(s) marquée(s) ${markAsRead ? "vues" : "non vues"}`,
      );
    } catch {
      toast.error("Erreur mise à jour visibilité");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Supprimer ${selectedIds.length} commande(s) ? Cette action est irréversible.`,
      )
    )
      return;
    setIsBulkProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/public/commandes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      mutateCommandes(
        (data) => data.filter((c) => !selectedIds.includes(c.id)),
        false,
      );
      handleClearSelection();
      toast.success(`${selectedIds.length} commande(s) supprimée(s)`);
    } catch {
      toast.error("Erreur suppression");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // ── Reset filtres ──────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPlateforme("");
    setSelectedStatut("");
    setCommentFilter("all");
    setShowOnlyUnread(false);
    setDateFilter("all");
    setDeadlineFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
    setCustomDeadlineFrom("");
    setCustomDeadlineTo("");
    setCurrentPage(1);
    localStorage.removeItem("commandesState");
    toast.info("Filtres réinitialisés");
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (commandesError) return <ErrorState onRetry={() => mutateCommandes()} />;
  if (commandesLoading) return <LoadingState />;

  return (
    <div className="commandes-card">
      <ToastContainer position="top-right" autoClose={3000} />

      <CommandesHeader
        stats={stats}
        userPlatforms={userPlatforms}
        isSyncing={isSyncing}
        onSyncAll={() => syncAllPlatforms(userPlatforms)}
      />

      {selectedIds.length > 0 && (
        <div className="bulk-action-float-bar">
          <div className="bulk-info">
            <CheckSquare size={20} />
            <span>{selectedIds.length} sélectionné(s)</span>
          </div>
          <div className="bulk-buttons">
            <button
              className="bulk-btn bulk-btn-cert"
              onClick={() => setShowBulkCertModal(true)}
            >
              <Shield size={16} /> Créer Certificats
            </button>
            <button
              className="bulk-btn bulk-btn-print"
              onClick={handleBulkPrint}
            >
              <Printer size={16} /> Imprimer
            </button>
            <button className="bulk-btn-cancel" onClick={handleClearSelection}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
        onSearchChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        selectedPlateforme={selectedPlateforme}
        onPlateformeChange={(e) => {
          setSelectedPlateforme(e.target.value);
          setCurrentPage(1);
        }}
        selectedStatut={selectedStatut}
        onStatutChange={(e) => {
          setSelectedStatut(e.target.value);
          setCurrentPage(1);
        }}
        commentFilter={commentFilter}
        onCommentFilterChange={(e) => {
          setCommentFilter(e.target.value);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateFilterChange={(e) => {
          setDateFilter(e.target.value);
          setCurrentPage(1);
        }}
        customDateFrom={customDateFrom}
        onCustomDateFromChange={(e) => setCustomDateFrom(e.target.value)}
        customDateTo={customDateTo}
        onCustomDateToChange={(e) => setCustomDateTo(e.target.value)}
        deadlineFilter={deadlineFilter}
        onDeadlineFilterChange={(e) => {
          setDeadlineFilter(e.target.value);
          setCurrentPage(1);
        }}
        customDeadlineFrom={customDeadlineFrom}
        onCustomDeadlineFromChange={(e) =>
          setCustomDeadlineFrom(e.target.value)
        }
        customDeadlineTo={customDeadlineTo}
        onCustomDeadlineToChange={(e) => setCustomDeadlineTo(e.target.value)}
        showOnlyUnread={showOnlyUnread}
        onUnreadToggle={(e) => {
          setShowOnlyUnread(e.target.checked);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      <CommandesList
        commandes={filteredCommandes}
        totalCommandes={commandes.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewDetails={handleViewDetails}
        onToggleVu={handleToggleVu}
        selectedIds={selectedIds}
        onSelectOne={handleSelectOne}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkReadToggle={handleBulkReadToggle}
        onBulkDelete={handleBulkDelete}
        isBulkProcessing={isBulkProcessing}
        onPrintCertificat={handlePrintCertificat}
        certificatsMap={certificatsMap}
        connectedPlatformsCount={stats.connectedPlatformsCount}
        onSyncAll={() => syncAllPlatforms(userPlatforms)}
      />

      {showBulkCertModal && (
        <BulkCertificatModal
          userId={userId}
          selectedCommandes={commandes.filter((c) =>
            selectedIds.includes(c.id),
          )}
          onClose={() => setShowBulkCertModal(false)}
          onSaveSuccess={handleBulkCertSuccess}
        />
      )}
    </div>
  );
};

export default Commandes;
