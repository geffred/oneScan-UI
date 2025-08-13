import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
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
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BonCommande from "../BonDeCommande/BonDeCommande";
import { useReactToPrint } from "react-to-print";
import "./commandeDetails.css";

// Fonctions de fetch pour SWR
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

// Composants optimisés avec React.memo
const LoadingState = React.memo(() => (
  <div className="commandes-loading-state">
    <div className="commandes-loading-spinner"></div>
    <p className="commandes-loading-text">Chargement des détails...</p>
  </div>
));

LoadingState.displayName = "LoadingState";

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

ErrorState.displayName = "ErrorState";

const Notification = React.memo(({ notification, onRemove }) => (
  <div
    className={`commandes-notification commandes-notification-${notification.type}`}
  >
    <span className="commandes-notification-message">
      {notification.message}
    </span>
    <button
      className="commandes-notification-close"
      onClick={() => onRemove(notification.id)}
    >
      <X size={16} />
    </button>
  </div>
));

Notification.displayName = "Notification";

const CommentSection = React.memo(({ commentaire, isLoading }) => (
  <div className="details-info-card">
    <div className="details-card-header">
      <FileText size={20} />
      <h3>Commentaire</h3>
    </div>
    <div className="details-card-content">
      <div className="details-comment-item">
        <span className="details-comment-value">
          {isLoading ? (
            <div className="comment-loading-state">
              <div className="comment-loading-spinner"></div>
              <span className="comment-loading-text">
                Chargement du commentaire...
              </span>
            </div>
          ) : !commentaire ? (
            <span className="comment-empty-state">Aucun commentaire</span>
          ) : (
            <span className="comment-content">{commentaire}</span>
          )}
        </span>
      </div>
    </div>
  </div>
));

CommentSection.displayName = "CommentSection";

const ActionCard = React.memo(
  ({ onClick, disabled, icon, title, description, isLoading }) => (
    <button
      className="details-action-card"
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

ActionCard.displayName = "ActionCard";

const CommandeDetails = () => {
  const { externalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("commandes");
  const [showBonDeCommande, setShowBonDeCommande] = useState(false);

  const bonDeCommandeRef = useRef();

  // SWR hooks pour les données
  const {
    data: commandes = [],
    error: commandesError,
    isLoading: commandesLoading,
  } = useSWR(isAuthenticated ? "commandes" : null, getCommandes, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
  });

  // Trouver la commande spécifique
  const commande = useMemo(() => {
    // Priorité aux données du state (navigation directe)
    if (location.state?.commande) {
      return location.state.commande;
    }

    // Sinon chercher dans les données SWR
    if (commandes.length > 0) {
      return (
        commandes.find((cmd) => cmd.externalId.toString() === externalId) ||
        null
      );
    }

    return null;
  }, [commandes, externalId, location.state]);

  // SWR hook pour le commentaire (conditionnel)
  const {
    data: commentaire,
    error: commentaireError,
    isLoading: commentaireLoading,
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

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  // Handlers optimisés
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

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

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
      showNotification("PDF téléchargé avec succès", "success");
    },
  });

  const handleDownload = useCallback(async () => {
    if (!commande) return;

    setIsDownloading(true);

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

        showNotification(
          `Scan 3D téléchargé avec succès pour la commande #${commande.externalId}`,
          "success"
        );

        try {
          if ("showDirectoryPicker" in window) {
            await window.showDirectoryPicker();
          }
        } catch (explorerError) {
          console.log("Ouverture automatique de l'explorateur non supportée");
        }
      } else {
        showNotification(
          `Erreur lors du téléchargement de la commande #${commande.externalId}`,
          "error"
        );
      }
    } catch (error) {
      showNotification("Erreur de connexion lors du téléchargement", "error");
      console.error("Erreur:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [commande, showNotification]);

  const handleGenerateOrder = useCallback(async () => {
    if (!commande) return;

    setIsGenerating(true);
    showNotification("Génération du bon de commande en cours...", "info");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowBonDeCommande(true);
      showNotification(
        `Bon de commande généré avec succès pour la commande #${commande.externalId}`,
        "success"
      );
    } catch (error) {
      showNotification(
        "Erreur lors de la génération du bon de commande",
        "error"
      );
      console.error("Erreur:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [commande, showNotification]);

  // Fonctions utilitaires mémorisées
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

  // Calculs mémorisés
  const echeanceStatus = useMemo(
    () => (commande ? getEcheanceStatus(commande.dateEcheance) : null),
    [commande, getEcheanceStatus]
  );

  const plateformeColor = useMemo(
    () => (commande ? getPlateformeColor(commande.plateforme) : null),
    [commande, getPlateformeColor]
  );

  // Redirection si non authentifié
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Layout wrapper pour éviter la duplication
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

  // États de chargement et d'erreur
  if (commandesLoading) {
    return (
      <LayoutWrapper>
        <LoadingState />
      </LayoutWrapper>
    );
  }

  if (commandesError || !commande) {
    return (
      <LayoutWrapper>
        <ErrorState
          error={commandesError?.message || "Commande non trouvée"}
          onBack={handleBack}
        />
      </LayoutWrapper>
    );
  }

  // Commentaire final (priorité aux données SWR, puis aux données de la commande)
  const finalCommentaire = commentaire || commande.commentaire;

  return (
    <LayoutWrapper>
      <div className="details-main-container">
        {/* Notifications */}
        <div className="commandes-notifications">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>

        {/* En-tête */}
        <div className="details-header-section">
          <button
            className="details-btn details-btn-secondary"
            onClick={handleBack}
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <div className="details-header-actions">
            <button
              className="details-btn details-btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="details-loading-spinner details-btn-spinner"></div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Télécharger le scan 3D
                </>
              )}
            </button>
          </div>
        </div>

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

          {/* Statut */}
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

          {/* Commentaire */}
          <CommentSection
            commentaire={finalCommentaire}
            isLoading={commentaireLoading}
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
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="details-actions-section">
          <div className="details-actions-grid">
            <ActionCard
              onClick={handleGenerateOrder}
              disabled={isGenerating}
              icon={<Sparkles size={24} />}
              title="Générer le bon de commande"
              description="Créer un bon de commande personnalisé avec l'assistance IA"
              isLoading={isGenerating}
            />

            <ActionCard
              onClick={handleDownload}
              disabled={isDownloading}
              icon={<Download size={24} />}
              title="Télécharger le scan 3D"
              description="Récupérer le fichier ZIP contenant le scan 3D de cette commande"
              isLoading={isDownloading}
            />
          </div>
        </div>
      </div>

      {/* Modal Bon de Commande */}
      {showBonDeCommande && (
        <BonCommande
          commande={commande}
          onClose={() => setShowBonDeCommande(false)}
        />
      )}
    </LayoutWrapper>
  );
};

export default CommandeDetails;
