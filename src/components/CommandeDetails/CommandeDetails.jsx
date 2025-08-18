import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  User,
  Building,
  Server,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  Mail,
  Edit,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../../components/Config/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BonCommande from "../BonDeCommande/BonDeCommande";
import { useReactToPrint } from "react-to-print";
import "./commandeDetails.css";
import CabinetSearch from "./CabinetSearch";
import CommentSection from "./CommentSection";

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
  return fetchWithAuth("/api/public/commandes");
};

const getCommandeByExternalId = async (externalId) => {
  if (!externalId) throw new Error("ExternalId manquant");
  return fetchWithAuth(`/api/public/commandes/${externalId}`);
};

const getCabinets = async () => {
  return fetchWithAuth("/api/cabinet");
};

const getCommentaire = async (plateforme, externalId) => {
  if (!plateforme || !externalId) return null;

  try {
    const endpoint = `/api/${plateforme.toLowerCase()}/commentaire/${externalId}`;
    const data = await fetchWithAuth(endpoint);
    return data.commentaire || data.comments || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du commentaire:", error);
    return null;
  }
};

const updateCabinetId = async (commandeId, cabinetId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(`/api/public/commandes/cabinet/${commandeId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cabinetId),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const analyseCommentaireDeepSeek = async (commentaire, commandeId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch("/deepseek", {
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

// Fonction mise à jour pour utiliser la route correcte du contrôleur Java
const updateCommandeStatus = async (commandeId, status) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  // Utilisation de la route POST /api/public/commandes/statut/{id} comme définie dans le contrôleur
  const response = await fetch(`/api/public/commandes/statut/${commandeId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Le contrôleur attend un objet StatutCommande, pas juste une chaîne
    body: JSON.stringify(status),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const sendEmailNotification = async (commandeId, cabinetEmail) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `/api/public/commandes/notification/${commandeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cabinetEmail }),
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

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

const ActionCard = React.memo(
  ({ onClick, disabled, icon, title, description, isLoading }) => (
    <button
      className={`details-action-card ${
        disabled ? "details-action-card-disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <div
        className={`details-action-icon ${
          title.includes("commande") ? "details-action-icon-ai" : ""
        }`}
      >
        {isLoading ? <div className="details-download-spinner"></div> : icon}
      </div>
      <div className="details-action-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  )
);

const StatusDropdown = React.memo(
  ({ currentStatus, onStatusChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mapping des statuts pour correspondre à l'enum StatutCommande du backend
    const statusOptions = [
      { value: "EN_ATTENTE", label: "En attente" },
      { value: "EN_COURS", label: "En cours" },
      { value: "TERMINEE", label: "Terminée" },
      { value: "EXPEDIEE", label: "Expédiée" },
      { value: "ANNULEE", label: "Annulée" },
    ];

    const handleStatusSelect = (status) => {
      onStatusChange(status);
      setIsOpen(false);
    };

    const getCurrentStatusLabel = () => {
      const status = statusOptions.find((s) => s.value === currentStatus);
      return status ? status.label : "Statut inconnu";
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest(".status-dropdown")) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="status-dropdown">
        <button
          className="status-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Edit size={16} />
          {getCurrentStatusLabel()}
          <ChevronDown
            size={16}
            className={`status-dropdown-chevron ${isOpen ? "open" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="status-dropdown-menu">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`status-dropdown-item ${
                  currentStatus === status.value ? "active" : ""
                }`}
                onClick={() => handleStatusSelect(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

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
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("commandes");
  const [showBonDeCommande, setShowBonDeCommande] = useState(false);
  const [showCabinetSearch, setShowCabinetSearch] = useState(false);

  const bonDeCommandeRef = useRef();

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
        `/api/${commande.plateforme.toLowerCase()}/download/${
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
        backgroundColor: "#007AFF", // bleu custom
        color: "#fff", // texte blanc
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
      await sendEmailNotification(commande.id, cabinet.email);
      toast.success(`Notification envoyée avec succès à ${cabinet.nom}`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    } finally {
      setActionStates((prev) => ({ ...prev, sendEmail: false }));
    }
  }, [commande, cabinets]);

  // Fonction mise à jour pour gérer le changement de statut
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!commande) return;

      setActionStates((prev) => ({ ...prev, updateStatus: true }));
      toast.info("Mise à jour du statut en cours...");

      try {
        // Appel de la fonction updateCommandeStatus mise à jour
        await updateCommandeStatus(commande.id, newStatus);

        // Rafraîchissement des données
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
    return commande && commande.cabinetId && commande.cabinetId !== null;
  }, [commande]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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
                &copy; IA Lab
                <label>Tous les droits sont réservés.</label>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );

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

  const finalCommentaire = commentaire || commande.commentaire;

  return (
    <LayoutWrapper>
      <div className="details-main-container">
        {/* En-tête */}
        <div className="details-header-section">
          <div className="details-back-and-associate">
            <button
              className="details-btn details-btn-secondary"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Retour
            </button>
          </div>

          <div className="details-header-actions">
            <button
              className="details-btn details-btn-primary"
              onClick={() => setShowCabinetSearch(!showCabinetSearch)}
            >
              <Building size={16} />
              {commande.cabinetId
                ? "Changer de cabinet"
                : "Associer un cabinet"}
            </button>
          </div>
        </div>

        {/* Cabinet associé */}
        {commande.cabinetId && (
          <div className="associated-cabinet-display">
            <Building size={16} />
            <span>
              Cabinet associé:{" "}
              {cabinets.find((c) => c.id === commande.cabinetId)?.nom ||
                `ID: ${commande.cabinetId}`}
            </span>
          </div>
        )}

        {/* Barre de recherche des cabinets */}
        {showCabinetSearch && (
          <CabinetSearch
            cabinets={cabinets}
            isLoading={cabinetsLoading}
            onAssociate={handleAssociateCabinet}
            onClose={() => setShowCabinetSearch(false)}
          />
        )}

        <div className="details-title-wrapper">
          <h2 className="details-card-title">
            Commande [ {commande.externalId} ]
          </h2>
        </div>

        {/* Informations principales */}
        <div className="details-info-grid">
          {/* Informations patient */}
          <div className="details-info-card">
            <div className="details-card-header">
              <User size={20} />
              <h3>Informations Patient</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">Référence Patient :</span>
                <span className="details-item-value">
                  {commande.refPatient || "Non spécifiée"}
                </span>
              </div>
            </div>
          </div>

          {/* Informations cabinet */}
          <div className="details-info-card">
            <div className="details-card-header">
              <Building size={20} />
              <h3>Cabinet</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">Nom du cabinet :</span>
                <span className="details-item-value">{commande.cabinet}</span>
              </div>
            </div>
          </div>

          {/* Plateforme */}
          <div className="details-info-card">
            <div className="details-card-header">
              <Server size={20} />
              <h3>Plateforme</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">Source :</span>
                <span
                  className={`details-platform-badge commandes-plateforme-${plateformeColor}`}
                >
                  {commande.plateforme}
                </span>
              </div>
            </div>
          </div>

          {/* Dates importantes */}
          <div className="details-info-card">
            <div className="details-card-header">
              <Calendar size={20} />
              <h3>Dates</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">Date de réception :</span>
                <span className="details-item-value">
                  {formatDate(commande.dateReception)}
                </span>
              </div>
              <div className="details-item">
                <span className="details-item-label">Date d'échéance :</span>
                <span className="details-item-value">
                  {formatDate(commande.dateEcheance)}
                </span>
              </div>
            </div>
          </div>

          {/* Statut avec dropdown */}
          <div className="details-info-card">
            <div className="details-card-header">
              <Clock size={20} />
              <h3>Statut</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">
                  État de la commande :
                </span>
                <span
                  className={`details-status-badge commandes-status-${echeanceStatus.class}`}
                >
                  {echeanceStatus.label}
                </span>
              </div>
              <div className="details-item">
                <span className="details-item-label">
                  Statut de traitement :
                </span>
                <StatusDropdown
                  currentStatus={
                    commande.status || commande.statut || "EN_ATTENTE"
                  }
                  onStatusChange={handleStatusChange}
                  isLoading={actionStates.updateStatus}
                />
              </div>
              <div className="details-item">
                <span className="details-item-label">Lecture :</span>
                <span className="details-item-value">
                  {commande.vu ? (
                    <span className="details-read-status">
                      <CheckCircle size={16} className="details-read-icon" />
                      Lue
                    </span>
                  ) : (
                    <span className="details-unread-status">
                      <AlertCircle size={16} className="details-unread-icon" />
                      Non lue
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Commentaire avec édition */}
          <CommentSection
            commentaire={finalCommentaire}
            isLoading={isCommentLoading}
            commande={commande}
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

          {/* Informations techniques */}
          <div className="details-info-card">
            <div className="details-card-header">
              <FileText size={20} />
              <h3>Informations Techniques</h3>
            </div>
            <div className="details-card-content">
              <div className="details-item">
                <span className="details-item-label">ID externe :</span>
                <span className="details-external-id">
                  #{commande.externalId}
                </span>
              </div>
              <div className="details-item">
                <span className="details-item-label">ID interne :</span>
                <span className="details-item-value">{commande.id}</span>
              </div>
              {commande.typeAppareil && (
                <div className="details-item">
                  <span className="details-item-label">Type d'appareil :</span>
                  <span className="details-item-value">
                    {commande.typeAppareil}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="details-actions-section">
          <div className="details-actions-grid">
            <ActionCard
              onClick={handleGenerateOrder}
              disabled={actionStates.generate || isCommentLoading}
              icon={<Sparkles size={24} />}
              title="Générer le bon de commande"
              description={
                isCommentLoading
                  ? "Attente du chargement du commentaire..."
                  : "Analyser le commentaire et créer un bon de commande personnalisé avec l'assistance IA"
              }
              isLoading={actionStates.generate}
            />

            <ActionCard
              onClick={handleOpenBonCommande}
              disabled={!canDownloadBonCommande}
              icon={<FileText size={24} />}
              title="Télécharger le bon de commande"
              description={
                canDownloadBonCommande
                  ? "Ouvrir et télécharger le bon de commande généré"
                  : "Le type d'appareil doit être défini pour télécharger le bon de commande"
              }
              isLoading={false}
            />

            <ActionCard
              onClick={handleSendEmailNotification}
              disabled={actionStates.sendEmail || !canSendEmail}
              icon={<Mail size={24} />}
              title="Envoyer notification par email"
              description={
                !canSendEmail
                  ? "Associez d'abord un cabinet pour envoyer une notification"
                  : "Envoyer une notification par email au cabinet associé"
              }
              isLoading={actionStates.sendEmail}
            />

            <ActionCard
              onClick={handleDownload}
              disabled={actionStates.download}
              icon={<Download size={24} />}
              title="Télécharger le scan 3D"
              description="Récupérer le fichier ZIP contenant le scan 3D de cette commande"
              isLoading={actionStates.download}
            />
          </div>
        </div>
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
