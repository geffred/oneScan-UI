import React, { useState, useCallback } from "react";
import {
  Search,
  Package,
  Clock,
  Settings,
  CheckCircle2,
  Truck,
  X,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";
import "./SuiviCommandes.css";
import { ToastContainer } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction pour récupérer les détails d'une commande par numéro de suivi
const fetchCommandeByNumeroSuivi = async (numeroSuivi) => {
  // Cette route est publique, pas besoin de token
  const response = await fetch(
    `${API_BASE_URL}/public/commandes/suivi/${numeroSuivi}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Aucune commande trouvée avec ce numéro de suivi");
    }
    if (response.status === 401) {
      throw new Error("Accès non autorisé à cette commande");
    }
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Configuration des étapes de suivi avec descriptions détaillées
const ETAPES_SUIVI = [
  {
    status: "EN_ATTENTE",
    label: "En attente",
    description: "Réception et analyse de votre commande",
    detail:
      "Votre commande a été reçue et est en cours de validation. Nos équipes vérifient les spécifications techniques et préparent le processus de fabrication.",
    icon: Clock,
    color: "#3b82f6",
  },
  {
    status: "EN_COURS",
    label: "En cours de fabrication",
    description: "Conception et fabrication de l'appareil",
    detail:
      "Votre appareil dentaire est actuellement en cours de fabrication dans nos ateliers spécialisés. Nos techniciens suivent rigoureusement les spécifications de votre commande.",
    icon: Settings,
    color: "#3b82f6",
  },
  {
    status: "TERMINEE",
    label: "Fabrication terminée",
    description: "Contrôle qualité et finalisation",
    detail:
      "La fabrication de votre appareil est terminée. Nos équipes procèdent aux derniers contrôles qualité avant conditionnement et expédition.",
    icon: CheckCircle2,
    color: "#3b82f6",
  },
  {
    status: "EXPEDIEE",
    label: "Expédiée",
    description: "Commande expédiée vers votre cabinet",
    detail:
      "Votre commande a été expédiée et est en route vers votre cabinet dentaire. Vous recevrez bientôt un avis de livraison.",
    icon: Truck,
    color: "#3b82f6",
  },
];

const StatusIndicator = ({
  status,
  currentStatus,
  index,
  isActive,
  isPassed,
}) => {
  const etape = ETAPES_SUIVI.find((e) => e.status === status);
  if (!etape) return null;

  const IconComponent = etape.icon;

  return (
    <div
      className={`suivi-step ${isActive ? "active" : ""} ${
        isPassed ? "completed" : ""
      }`}
    >
      <div className="suivi-step-connector">
        {index > 0 && (
          <div className={`suivi-connector ${isPassed ? "completed" : ""}`} />
        )}
      </div>

      <div className="suivi-step-icon-container">
        <div
          className={`suivi-step-icon ${isActive ? "active" : ""} ${
            isPassed ? "completed" : ""
          }`}
          style={{
            backgroundColor: isActive || isPassed ? etape.color : "#ffffffff",
            borderColor: etape.color,
          }}
        >
          <IconComponent
            size={20}
            color={isActive || isPassed ? "white" : "#9ca3af"}
          />
        </div>
      </div>

      <div className="suivi-step-content">
        <h3
          className={`suivi-step-title ${isActive ? "active" : ""} ${
            isPassed ? "completed" : ""
          }`}
        >
          {etape.label}
        </h3>
        <p className="suivi-step-description">{etape.description}</p>
        <p className="suivi-step-detail">{etape.detail}</p>
        {isActive && (
          <div className="suivi-step-current-badge">
            <div className="suivi-pulse" />
            Étape en cours
          </div>
        )}
      </div>
    </div>
  );
};

const CommandeInfo = ({ commande }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="suivi-commande-info">
      <div className="suivi-info-header">
        <Package size={24} className="suivi-info-icon" />
        <h3>Informations de la commande</h3>
      </div>

      <div className="suivi-info-grid">
        <div className="suivi-info-item">
          <div className="suivi-info-label">
            <MapPin size={16} />
            Numéro de commande
          </div>
          <div className="suivi-info-value">#{commande.externalId}</div>
        </div>

        <div className="suivi-info-item">
          <div className="suivi-info-label">
            <Building size={16} />
            Cabinet
          </div>
          <div className="suivi-info-value">{commande.cabinet}</div>
        </div>

        <div className="suivi-info-item">
          <div className="suivi-info-label">
            <Calendar size={16} />
            Date de réception
          </div>
          <div className="suivi-info-value">
            {formatDate(commande.dateReception)}
          </div>
        </div>

        <div className="suivi-info-item">
          <div className="suivi-info-label">
            <Calendar size={16} />
            Date d'échéance
          </div>
          <div className="suivi-info-value">
            {formatDate(commande.dateEcheance)}
          </div>
        </div>

        {commande.typeAppareil && (
          <div className="suivi-info-item">
            <div className="suivi-info-label">
              <Settings size={16} />
              Type d'appareil
            </div>
            <div className="suivi-info-value">{commande.typeAppareil}</div>
          </div>
        )}

        {commande.numeroSuivi && (
          <div className="suivi-info-item">
            <div className="suivi-info-label">
              <Truck size={16} />
              Numéro de suivi
            </div>
            <div className="suivi-info-value">{commande.numeroSuivi}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="suivi-loading-state">
    <div className="suivi-loading-spinner" />
    <p>Recherche de votre commande...</p>
  </div>
);

const ErrorState = ({ error, onReset }) => (
  <div className="suivi-error-state">
    <AlertCircle size={48} className="suivi-error-icon" />
    <h3>Commande non trouvée</h3>
    <p>{error}</p>
    <button className="suivi-btn suivi-btn-primary" onClick={onReset}>
      Nouvelle recherche
    </button>
  </div>
);

function SuiviCommandes() {
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const [commande, setCommande] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!numeroSuivi.trim()) {
      toast.warning("Veuillez saisir un numéro de suivi");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCommande(null);

    try {
      const commandeData = await fetchCommandeByNumeroSuivi(numeroSuivi.trim());
      setCommande(commandeData);
      toast.success("Commande trouvée avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [numeroSuivi]);

  const handleReset = useCallback(() => {
    setNumeroSuivi("");
    setCommande(null);
    setError(null);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Déterminer l'étape actuelle et les étapes passées
  const getCurrentStepIndex = (status) => {
    return ETAPES_SUIVI.findIndex((etape) => etape.status === status);
  };

  const currentStepIndex = commande
    ? getCurrentStepIndex(commande.statut || commande.status)
    : -1;

  return (
    <div className="suivi-commandes-container">
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
      <div className="suivi-header">
        <div className="suivi-header-content">
          <h1 className="suivi-title">Suivi de commande</h1>
          <p className="suivi-subtitle">
            Suivez l'état d'avancement de votre commande d'appareil dentaire en
            temps réel
          </p>
        </div>
      </div>

      <div className="suivi-search-section">
        <div className="suivi-search-container">
          <div className="suivi-search-header">
            <h2>Rechercher votre commande</h2>
            <p>
              Saisissez votre numéro de suivi pour connaître l'état de votre
              commande
            </p>
          </div>

          <div className="suivi-search-form">
            <div className="suivi-search-input-wrapper">
              <Search className="suivi-search-icon" size={20} />
              <input
                type="text"
                className="suivi-search-input"
                placeholder="Entrez votre numéro de suivi (ex: 623456)"
                value={numeroSuivi}
                onChange={(e) => setNumeroSuivi(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <button
              className="suivi-btn suivi-btn-primary"
              onClick={handleSearch}
              disabled={isLoading || !numeroSuivi.trim()}
            >
              {isLoading ? (
                <>
                  <div className="suivi-btn-spinner" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Rechercher
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isLoading && <LoadingState />}

      {error && !isLoading && (
        <ErrorState error={error} onReset={handleReset} />
      )}

      {commande && !isLoading && !error && (
        <div className="suivi-results-section">
          <div className="suivi-results-header">
            <div className="suivi-results-title">
              <CheckCircle2 size={24} className="suivi-success-icon" />
              <h2>Commande trouvée</h2>
            </div>
            <button
              className="suivi-btn suivi-btn-secondary"
              onClick={handleReset}
            >
              <X size={16} />
              Nouvelle recherche
            </button>
          </div>

          <CommandeInfo commande={commande} />

          <div className="suivi-timeline-section">
            <div className="suivi-timeline-header">
              <h3>Suivi de fabrication</h3>
              <p>Suivez l'avancement de votre commande étape par étape</p>
            </div>

            <div className="suivi-timeline">
              {ETAPES_SUIVI.map((etape, index) => {
                const isActive = index === currentStepIndex;
                const isPassed = index < currentStepIndex;

                return (
                  <StatusIndicator
                    key={etape.status}
                    status={etape.status}
                    currentStatus={commande.statut || commande.status}
                    index={index}
                    isActive={isActive}
                    isPassed={isPassed}
                  />
                );
              })}
            </div>

            {commande.statut === "ANNULEE" && (
              <div className="suivi-cancelled-notice">
                <X size={20} />
                <div>
                  <h4>Commande annulée</h4>
                  <p>
                    Cette commande a été annulée. Contactez votre cabinet pour
                    plus d'informations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SuiviCommandes;
