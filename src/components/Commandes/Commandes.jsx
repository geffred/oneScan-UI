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
import { toast, ToastContainer } from "react-toastify";
import { Shield, Printer, X, CheckSquare, Square } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
  const itemsPerPage = 25;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkCertModal, setShowBulkCertModal] = useState(false);
  const [certificatsMap, setCertificatsMap] = useState({});

  const backblazeStatus = useBackblazeStatus(isAuthenticated);
  const meditlinkAuth = useMeditLinkAuth({ fetchOnMount: true });
  const threeshapeAuth = useThreeShapeAuth();
  const dexisAuth = useDexisAuth({ refreshInterval: 10000 });

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

  const { syncAllPlatforms } = useSyncPlatforms({
    mutateCommandes,
    setSyncStatus,
    setIsSyncing,
  });

  const { stats, filteredCommandes, connectionStatus } = useCommandesData({
    commandes,
    userPlatforms,
    searchTerm,
    selectedPlateforme,
    selectedStatut,
    commentFilter,
    showOnlyUnread,
    dateFilter,
    meditlinkAuth,
    threeshapeAuth,
    dexisStatus: dexisAuth,
    backblazeStatus,
  });

  // Charger l'état des certificats au montage et après chaque mutation
  const loadCertificatsStatus = useCallback(async () => {
    if (!commandes || commandes.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const statusMap = {};

      await Promise.all(
        commandes.map(async (cmd) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/certificats/commande/${cmd.id}/exists`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await res.json();
            statusMap[cmd.id] = data.exists;
          } catch (e) {
            statusMap[cmd.id] = false;
          }
        }),
      );

      setCertificatsMap(statusMap);
    } catch (e) {
      console.error("Erreur chargement certificats:", e);
    }
  }, [commandes]);

  useEffect(() => {
    loadCertificatsStatus();
  }, [loadCertificatsStatus]);

  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);

  const handleViewDetails = useCallback(
    (commande) => {
      navigate(`/dashboard/commande/${commande.externalId}`, {
        state: { commande },
      });
    },
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

      // Mise à jour optimiste locale
      mutateCommandes(
        (currentData) =>
          currentData.map((cmd) =>
            cmd.id === commande.id ? { ...cmd, vu: !commande.vu } : cmd,
          ),
        false, // Ne pas revalider immédiatement
      );
    } catch (e) {
      toast.error("Erreur mise à jour statut lecture");
    }
  };

  const handlePrintCertificat = async (commande) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = API_BASE_URL;

      const res = await fetch(
        `${baseUrl}/certificats/commande/${commande.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        },
      );

      if (!res.ok) throw new Error("Certificat inexistant");

      const cert = await res.json();
      const printUrl = `${baseUrl}/certificats/print/${cert.id}?token=${token}`;
      window.open(printUrl, "_blank");
    } catch (e) {
      console.error("Erreur d'impression:", e);
      toast.error(
        `Impossible d'imprimer : aucun certificat pour ${commande.refPatient}`,
      );
    }
  };

  const handleBulkPrint = async () => {
    if (selectedIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      toast.info("Préparation de l'impression groupée...");

      const certIds = [];
      for (const cmdId of selectedIds) {
        const res = await fetch(`${baseUrl}/certificats/commande/${cmdId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const cert = await res.json();
          certIds.push(cert.id);
        }
      }

      if (certIds.length === 0) {
        toast.error("Aucun certificat trouvé pour la sélection.");
        return;
      }

      const idsParam = certIds.join(",");
      const printUrl = `${baseUrl}/certificats/print-bulk?ids=${idsParam}&token=${token}`;

      console.log("URL d'impression appelée : ", printUrl);
      window.open(printUrl, "_blank");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la préparation de l'impression.");
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (ids) => setSelectedIds(ids);

  const handleClearSelection = () => setSelectedIds([]);

  const handleBulkCertSuccess = async (keepSelection = false) => {
    setShowBulkCertModal(false);

    // Recharger les commandes
    await mutateCommandes();

    // Recharger immédiatement l'état des certificats
    await loadCertificatsStatus();

    // Si keepSelection = true, on garde la sélection pour l'impression
    if (!keepSelection) {
      handleClearSelection();
    }
  };

  if (commandesError) return <ErrorState onRetry={() => mutateCommandes()} />;
  if (commandesLoading) return <LoadingState />;

  return (
    <div className="commandes-card">
      <ToastContainer position="top-right" autoClose={3000} />

      <CommandesHeader
        stats={stats}
        userPlatforms={userPlatforms}
        isSyncing={isSyncing}
        onSyncAll={() => syncAllPlatforms(userPlatforms, connectionStatus.get)}
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
        getConnectionStatus={connectionStatus.get}
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
      />

      <CommandesList
        commandes={filteredCommandes}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewDetails={handleViewDetails}
        onToggleVu={handleToggleVu}
        selectedIds={selectedIds}
        onSelectOne={handleSelectOne}
        onSelectAll={handleSelectAll}
        onPrintCertificat={handlePrintCertificat}
        certificatsMap={certificatsMap}
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
