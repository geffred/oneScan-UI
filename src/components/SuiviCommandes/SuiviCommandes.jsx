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
  Building2,
  ArrowRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SuiviCommandes.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- CONFIGURATION ---
const ETAPES_SUIVI = [
  {
    status: "EN_ATTENTE",
    label: "Réception & Analyse",
    description: "Votre commande est arrivée au laboratoire.",
    detail:
      "Nous vérifions les fichiers numériques et les spécifications techniques avant de lancer la production.",
    icon: Clock,
  },
  {
    status: "EN_COURS",
    label: "Fabrication",
    description: "Production de l'appareil en cours.",
    detail:
      "Impression 3D, usinage ou montage manuel selon les spécificités de votre commande.",
    icon: Settings,
  },
  {
    status: "TERMINEE",
    label: "Contrôle Qualité",
    description: "Vérification finale avant emballage.",
    detail:
      "Nos experts s'assurent que la prothèse correspond parfaitement aux exigences cliniques.",
    icon: CheckCircle2,
  },
  {
    status: "EXPEDIEE",
    label: "Expédition",
    description: "En route vers votre cabinet.",
    detail: "Remis au transporteur. Vous recevrez le colis sous 24h à 48h.",
    icon: Truck,
  },
];

const fetchCommandeByNumeroSuivi = async (numeroSuivi) => {
  // Simulation d'appel API pour l'exemple si l'URL n'est pas définie
  if (!API_BASE_URL) {
    // A SUPPRIMER EN PROD : Simulation de délai
    await new Promise((r) => setTimeout(r, 800));
    // Mock data pour test
    if (numeroSuivi === "123456") {
      return {
        externalId: "CMD-8829",
        cabinet: "Cabinet Dr. Martin",
        dateReception: new Date().toISOString(),
        dateEcheance: new Date(Date.now() + 86400000 * 5).toISOString(),
        typeAppareil: "Gouttière de contention",
        statut: "EN_COURS",
        numeroSuivi: "TRACK-9922",
      };
    }
    throw new Error("Aucune commande trouvée (Test: essayez 123456)");
  }

  const response = await fetch(
    `${API_BASE_URL}/public/commandes/suivi/${numeroSuivi}`
  );
  if (!response.ok) {
    if (response.status === 404) throw new Error("Numéro de suivi inconnu.");
    throw new Error("Impossible d'accéder aux informations.");
  }
  return response.json();
};

// --- SOUS-COMPOSANTS ---

const TimelineItem = ({ step, index, currentStepIndex }) => {
  const isCompleted = index < currentStepIndex;
  const isActive = index === currentStepIndex;
  const isPending = index > currentStepIndex;
  const Icon = step.icon;

  let statusClass = "sc-pending";
  if (isActive) statusClass = "sc-active";
  if (isCompleted) statusClass = "sc-completed";

  return (
    <div className={`sc-timeline-item ${statusClass}`}>
      {/* Connecteur Ligne */}
      {index < ETAPES_SUIVI.length - 1 && (
        <div
          className={`sc-connector ${index < currentStepIndex ? "filled" : ""}`}
        ></div>
      )}

      <div className="sc-icon-wrapper">
        <Icon size={20} />
      </div>

      <div className="sc-content-wrapper">
        <div className="sc-step-header">
          <h4>{step.label}</h4>
          {isActive && <span className="sc-badge-live">En cours</span>}
          {isCompleted && <span className="sc-badge-done">Terminé</span>}
        </div>
        <p className="sc-step-desc">{step.description}</p>
        {(isActive || isCompleted) && (
          <p className="sc-step-detail">{step.detail}</p>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="sc-info-card">
    <div className="sc-info-icon">
      <Icon size={18} />
    </div>
    <div className="sc-info-text">
      <span className="sc-label">{label}</span>
      <span className="sc-value">{value || "Non spécifié"}</span>
    </div>
  </div>
);

// --- COMPOSANT PRINCIPAL ---

const SuiviCommandes = () => {
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const [commande, setCommande] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!numeroSuivi.trim()) {
        toast.warning("Veuillez saisir un numéro.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setCommande(null);

      try {
        const data = await fetchCommandeByNumeroSuivi(numeroSuivi.trim());
        setCommande(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [numeroSuivi]
  );

  const resetSearch = () => {
    setCommande(null);
    setNumeroSuivi("");
    setError(null);
  };

  const currentStepIndex = commande
    ? ETAPES_SUIVI.findIndex(
        (e) => e.status === (commande.statut || commande.status)
      )
    : -1;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="sc-page">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="sc-container">
        {/* HEADER */}
        <div className="sc-header">
          <h1 className="sc-title">Suivi de commande</h1>
          <p className="sc-subtitle">
            Consultez l'avancement de vos prothèses en temps réel grâce à votre
            numéro de suivi unique.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className={`sc-search-wrapper ${commande ? "compact" : ""}`}>
          <form onSubmit={handleSearch} className="sc-search-box">
            <Search className="sc-search-icon" size={20} />
            <input
              type="text"
              className="sc-input"
              placeholder="Ex: CMD-8829 ou Track ID..."
              value={numeroSuivi}
              onChange={(e) => setNumeroSuivi(e.target.value)}
              disabled={isLoading || commande}
            />
            {commande ? (
              <button
                type="button"
                className="sc-btn-reset"
                onClick={resetSearch}
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="sc-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="sc-spinner" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            )}
          </form>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="sc-loading-state">
            <div className="sc-spinner-large"></div>
            <p>Recherche des informations...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !isLoading && (
          <div className="sc-error-state">
            <AlertCircle size={40} />
            <h3>Commande introuvable</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="sc-btn-retry">
              Réessayer
            </button>
          </div>
        )}

        {/* RESULTS */}
        {commande && !isLoading && (
          <div className="sc-results animate-in">
            {/* GRID INFO */}
            <div className="sc-details-grid">
              <div className="sc-main-info">
                <h2>Commande #{commande.externalId}</h2>
                <span className={`sc-status-pill ${commande.statut}`}>
                  {commande.statut?.replace("_", " ")}
                </span>
              </div>

              <div className="sc-cards-row">
                <InfoCard
                  icon={Building2}
                  label="Cabinet"
                  value={commande.cabinet}
                />
                <InfoCard
                  icon={Package}
                  label="Appareil"
                  value={commande.typeAppareil}
                />
                <InfoCard
                  icon={Calendar}
                  label="Réception"
                  value={formatDate(commande.dateReception)}
                />
                <InfoCard
                  icon={Clock}
                  label="Livraison Est."
                  value={formatDate(commande.dateEcheance)}
                />
              </div>
            </div>

            {/* TIMELINE */}
            <div className="sc-timeline-container">
              <h3>Progression</h3>
              <div className="sc-timeline">
                {ETAPES_SUIVI.map((step, idx) => (
                  <TimelineItem
                    key={step.status}
                    step={step}
                    index={idx}
                    currentStepIndex={currentStepIndex}
                  />
                ))}
              </div>

              {commande.statut === "ANNULEE" && (
                <div className="sc-alert-cancelled">
                  <AlertCircle size={20} />
                  <span>
                    Cette commande a été annulée. Veuillez contacter le support.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuiviCommandes;
