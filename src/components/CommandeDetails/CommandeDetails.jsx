import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { toast } from "react-toastify";
import { AuthContext } from "../../components/Config/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BonCommande from "../BonDeCommande/BonDeCommande";
import { useReactToPrint } from "react-to-print";
import { AlertCircle, ArrowLeft } from "lucide-react";

// Imports des nouveaux composants
import CommandeHeader from "./CommandeHeader";
import CommandeInfoGrid from "./CommandeInfoGrid";
import CommandeActions from "./CommandeActions";
import { EmailService } from "./EmailService";
import { ToastContainer } from "react-toastify";

import "./CommandeDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// API Services
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const getCommandes = async () => {
  return fetchWithAuth(`${API_BASE_URL}/public/commandes`);
};

const getCommandeByExternalId = async (externalId) => {
  if (!externalId) throw new Error("ExternalId manquant");
  return fetchWithAuth(`${API_BASE_URL}/public/commandes/${externalId}`);
};

const getCabinets = async () => {
  return fetchWithAuth(`${API_BASE_URL}/cabinet`);
};

const getCommentaire = async (plateforme, externalId) => {
  if (!plateforme || !externalId) return null;

  try {
    const endpoint = `${API_BASE_URL}/public/commandes/${externalId}`;
    const data = await fetchWithAuth(endpoint);
    return data.commentaire || data.comments || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du commentaire:", error);
    return null;
  }
};

const markAsRead = async (commandeId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/public/commandes/${commandeId}/vu`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response;
};

const updateCabinetId = async (commandeId, cabinetId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/public/commandes/cabinet/${commandeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cabinetId),
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const analyseCommentaireDeepSeek = async (commentaire, commandeId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(`${API_BASE_URL}/deepseek`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commentaire: commentaire,
      commandeId: commandeId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const updateCommandeStatus = async (commandeId, status) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/public/commandes/statut/${commandeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(status),
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Composants d'état
const LoadingState = React.memo(() => (
  <div className="commandes-loading-state">
    <div className="commandes-loading-spinner"></div>
    <p className="commandes-loading-text">Chargement des détails...</p>
  </div>
));

const ErrorState = React.memo(({ error, onBack }) => (
  <div className="commandes-error-state">
    <AlertCircle className="commandes-error-icon" size={48} />
    <h3 className="commandes-error-title">Erreur</h3>
    <p className="commandes-error-message">{error || "Commande non trouvée"}</p>
    <button className="commandes-btn commandes-btn-primary" onClick={onBack}>
      <ArrowLeft size={16} />
      Retour
    </button>
  </div>
));

const CommandeDetails = () => {
  const { externalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [actionStates, setActionStates] = useState({
    download: false,
    generate: false,
    sendEmail: false,
    updateStatus: false,
    downloadUpper: false,
    downloadLower: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("commandes");
  const [showBonDeCommande, setShowBonDeCommande] = useState(false);
  const [showCabinetSearch, setShowCabinetSearch] = useState(false);

  const bonDeCommandeRef = useRef();

  // SWR Hooks
  const {
    data: commande,
    error: commandeError,
    isLoading: commandeLoading,
    mutate: mutateCommande,
  } = useSWR(
    isAuthenticated && externalId ? `commande-${externalId}` : null,
    () => getCommandeByExternalId(externalId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      fallbackData:
        location.state?.commande?.externalId.toString() === externalId
          ? location.state.commande
          : undefined,
    }
  );

  const { mutate: mutateCommandes } = useSWR(
    isAuthenticated ? "commandes" : null,
    getCommandes,
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
    }
  );

  const {
    data: commentaire,
    error: commentaireError,
    isLoading: commentaireLoading,
    mutate: mutateCommentaire,
  } = useSWR(
    commande && !commande.commentaire
      ? `commentaire-${commande.plateforme}-${commande.externalId}`
      : null,
    () => getCommentaire(commande.plateforme, commande.externalId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
    }
  );

  const {
    data: cabinets = [],
    error: cabinetsError,
    isLoading: cabinetsLoading,
  } = useSWR(isAuthenticated ? "cabinets" : null, getCabinets, {
    revalidateOnFocus: false,
  });

  // Callbacks et handlers
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleComponentChange = useCallback(
    (newComponent) => {
      setActiveComponent(newComponent);
      navigate(`/dashboard/${newComponent}`);
    },
    [navigate]
  );

  const handleBack = useCallback(() => {
    navigate("/dashboard/commandes");
  }, [navigate]);

  const handleDownloadPDF = useReactToPrint({
    content: () => bonDeCommandeRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    documentTitle: `Bon_de_commande_${commande?.externalId || "unknown"}`,
    onAfterPrint: () => {
      toast.success("PDF téléchargé avec succès");
    },
  });

  const handleDownload = useCallback(async () => {
    if (!commande) return;

    setActionStates((prev) => ({ ...prev, download: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/${commande.plateforme.toLowerCase()}/download/${
          commande.externalId
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `scan-3D-${commande.externalId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(
          `Scan 3D téléchargé avec succès pour la commande #${commande.externalId}`
        );
      } else {
        toast.error(
          `Erreur lors du téléchargement de la commande #${commande.externalId}`
        );
      }
    } catch (error) {
      toast.error("Erreur de connexion lors du téléchargement");
      console.error("Erreur:", error);
    } finally {
      setActionStates((prev) => ({ ...prev, download: false }));
    }
  }, [commande]);

  const handleGenerateOrder = useCallback(async () => {
    if (!commande) return;

    setActionStates((prev) => ({ ...prev, generate: true }));
    toast.info("Analyse du commentaire en cours...", {
      style: {
        backgroundColor: "#007AFF",
        color: "#fff",
        progressStyle: { background: "#2196F3" },
      },
    });

    try {
      const finalCommentaire = commentaire || commande.commentaire || "";

      if (!finalCommentaire.trim()) {
        toast.warning("Aucun commentaire disponible pour l'analyse");
        return;
      }

      const analysisResult = await analyseCommentaireDeepSeek(
        finalCommentaire,
        commande.id
      );

      toast.success("Analyse terminée ! Bon de commande généré avec succès.");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await mutateCommande();
      await mutateCommandes();

      // Forcer le rechargement des fichiers
      setActionStates((prev) => ({ ...prev, reloadFiles: Date.now() }));

      toast.success(
        `Bon de commande généré avec succès pour la commande #${commande.externalId}`
      );
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast.error(
        "Erreur lors de l'analyse du commentaire ou de la génération du bon de commande"
      );
    } finally {
      setActionStates((prev) => ({ ...prev, generate: false }));
    }
  }, [commande, commentaire, mutateCommande, mutateCommandes]);

  const handleOpenBonCommande = useCallback(() => {
    setShowBonDeCommande(true);
  }, []);

  const handleSendEmailNotification = useCallback(async () => {
    if (!commande || !commande.cabinetId) {
      toast.warning("Aucun cabinet associé à cette commande");
      return;
    }

    const cabinet = cabinets.find((c) => c.id === commande.cabinetId);
    if (!cabinet || !cabinet.email) {
      toast.warning("Email du cabinet introuvable");
      return;
    }

    setActionStates((prev) => ({ ...prev, sendEmail: true }));
    toast.info("Envoi de la notification en cours...");

    try {
      const finalCommentaire = commentaire || commande.commentaire;

      await EmailService.sendEmailNotification(
        commande,
        cabinet,
        finalCommentaire
      );
      await EmailService.markNotificationAsSent(commande.id);

      mutateCommande({ ...commande, notification: true }, false);
      mutateCommandes();

      toast.success(
        `Notification envoyée avec succès à ${cabinet.nom} (${cabinet.email})`
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error(
        `Erreur lors de l'envoi de la notification: ${error.message}`
      );
    } finally {
      setActionStates((prev) => ({ ...prev, sendEmail: false }));
    }
  }, [commande, cabinets, commentaire, mutateCommande, mutateCommandes]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!commande) return;

      setActionStates((prev) => ({ ...prev, updateStatus: true }));
      toast.info("Mise à jour du statut en cours...");

      try {
        await updateCommandeStatus(commande.id, newStatus);

        await mutateCommande();
        await mutateCommandes();

        const statusLabels = {
          EN_ATTENTE: "En attente",
          EN_COURS: "En cours",
          TERMINEE: "Terminée",
          EXPEDIEE: "Expédiée",
          ANNULEE: "Annulée",
        };

        toast.success(
          `Statut mis à jour vers "${statusLabels[newStatus]}" avec succès`
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        toast.error("Erreur lors de la mise à jour du statut");
      } finally {
        setActionStates((prev) => ({ ...prev, updateStatus: false }));
      }
    },
    [commande, mutateCommande, mutateCommandes]
  );

  const handleAssociateCabinet = useCallback(
    async (cabinetId) => {
      if (!commande) return;

      try {
        const updatedCommande = await updateCabinetId(commande.id, cabinetId);

        mutateCommande(updatedCommande, false);
        mutateCommandes();
        setShowCabinetSearch(false);

        toast.success("Cabinet associé avec succès");
      } catch (error) {
        console.error("Erreur lors de l'association du cabinet:", error);
        toast.error("Erreur lors de l'association du cabinet");
      }
    },
    [commande, mutateCommande, mutateCommandes]
  );

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getEcheanceStatus = useCallback((dateEcheance) => {
    if (!dateEcheance)
      return { status: "unknown", label: "Non spécifiée", class: "gray" };

    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", label: "Échue", class: "red" };
    if (diffDays <= 3)
      return {
        status: "urgent",
        label: `${diffDays}j restant`,
        class: "yellow",
      };
    return { status: "normal", label: `${diffDays}j restant`, class: "green" };
  }, []);

  const getPlateformeColor = useCallback((plateforme) => {
    const colors = {
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
    };
    return colors[plateforme] || "gray";
  }, []);

  // Computed values
  const echeanceStatus = useMemo(
    () => (commande ? getEcheanceStatus(commande.dateEcheance) : null),
    [commande, getEcheanceStatus]
  );

  const plateformeColor = useMemo(
    () => (commande ? getPlateformeColor(commande.plateforme) : null),
    [commande, getPlateformeColor]
  );

  const isCommentLoading =
    commentaireLoading ||
    (commande && !commande.commentaire && commentaire === undefined);

  const canDownloadBonCommande = useMemo(() => {
    return commande && commande.typeAppareil && commande.typeAppareil !== null;
  }, [commande]);

  const canSendEmail = useMemo(() => {
    return (
      commande &&
      commande.cabinetId &&
      commande.cabinetId !== null &&
      !commande.notification
    );
  }, [commande]);

  const finalCommentaire = commentaire || commande.commentaire;

  // Effects
  useEffect(() => {
    if (commande && !commande.vu) {
      const markCommandAsRead = async () => {
        try {
          await markAsRead(commande.id);
          mutateCommande({ ...commande, vu: true }, false);
          mutateCommandes();
        } catch (error) {
          console.error("Erreur lors du marquage comme lu:", error);
        }
      };

      markCommandAsRead();
    }
  }, [commande, mutateCommande, mutateCommandes]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Layout wrapper
  const LayoutWrapper = ({ children }) => (
    <div className="dashboardpage-app-container">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="dashboardpage-main-layout">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeComponent={activeComponent}
          setActiveComponent={handleComponentChange}
        />
        <div className="dashboardpage-main-content">
          <main className="dashboardpage-content-area">{children}</main>
          <footer className="dashboardpage-footer">
            <div className="dashboardpage-footer-content">
              <p className="dashboardpage-footer-text">
                &copy; Mysmilelab
                <label>Tous les droits sont réservés.</label>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );

  // Render conditions
  if (commandeLoading) {
    return (
      <LayoutWrapper>
        <LoadingState />
      </LayoutWrapper>
    );
  }

  if (commandeError || !commande) {
    return (
      <LayoutWrapper>
        <ErrorState
          error={commandeError?.message || "Commande non trouvée"}
          onBack={handleBack}
        />
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="details-main-container">
        <CommandeHeader
          commande={commande}
          cabinets={cabinets}
          cabinetsLoading={cabinetsLoading}
          showCabinetSearch={showCabinetSearch}
          setShowCabinetSearch={setShowCabinetSearch}
          handleBack={handleBack}
          handleAssociateCabinet={handleAssociateCabinet}
        />

        <CommandeInfoGrid
          reloadTrigger={actionStates.reloadFiles}
          commande={commande}
          echeanceStatus={echeanceStatus}
          plateformeColor={plateformeColor}
          formatDate={formatDate}
          handleStatusChange={handleStatusChange}
          actionStates={actionStates}
          isCommentLoading={isCommentLoading}
          finalCommentaire={finalCommentaire}
          mutateCommande={mutateCommande}
          mutateCommandes={mutateCommandes}
          mutateCommentaire={mutateCommentaire}
          showNotification={(message, type) => {
            if (type === "success") toast.success(message);
            else if (type === "error") toast.error(message);
            else if (type === "warning") toast.warning(message);
            else toast.info(message);
          }}
        />

        <CommandeActions
          commande={commande}
          actionStates={actionStates}
          isCommentLoading={isCommentLoading}
          canDownloadBonCommande={canDownloadBonCommande}
          canSendEmail={canSendEmail}
          handleGenerateOrder={handleGenerateOrder}
          handleOpenBonCommande={handleOpenBonCommande}
          handleSendEmailNotification={handleSendEmailNotification}
          handleDownload={handleDownload}
        />
      </div>

      {/* Modal Bon de Commande */}
      {showBonDeCommande && (
        <BonCommande
          commande={commande}
          onClose={() => setShowBonDeCommande(false)}
          cabinet={
            commande.cabinetId
              ? cabinets.find((c) => c.id === commande.cabinetId)
              : null
          }
          ref={bonDeCommandeRef}
          onPrint={handleDownloadPDF}
        />
      )}
    </LayoutWrapper>
  );
};

export default CommandeDetails;
