/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback } from "react";
import {
  Package,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import "./CommandesCabinet.css";

/**
 * Composant d'affichage et de gestion des commandes cabinet
 * Features: Filtres, pagination, états de chargement
 */
const CommandesCabinet = ({
  commandes = [],
  loading = false,
  error = null,
}) => {
  // ==================== ÉTAT ====================
  const [currentPage, setCurrentPage] = useState(1);
  const [filtreDate, setFiltreDate] = useState("TOUS");
  const [filtreReference, setFiltreReference] = useState("");

  // Configuration
  const COMMANDES_PAR_PAGE = 5;

  // ==================== FONCTIONS DE FILTRAGE ====================
  const filtrerParDate = useCallback((commandes, filtre) => {
    const maintenant = new Date();

    switch (filtre) {
      case "AUJOURD_HUI": {
        const aujourdHui = new Date();
        aujourdHui.setHours(0, 0, 0, 0);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          dateReception.setHours(0, 0, 0, 0);
          return dateReception.getTime() === aujourdHui.getTime();
        });
      }

      case "CETTE_SEMAINE": {
        const debutSemaine = new Date(maintenant);
        debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
        debutSemaine.setHours(0, 0, 0, 0);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutSemaine;
        });
      }

      case "CE_MOIS": {
        const debutMois = new Date(
          maintenant.getFullYear(),
          maintenant.getMonth(),
          1,
        );
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutMois;
        });
      }

      case "CETTE_ANNEE": {
        const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutAnnee;
        });
      }

      default:
        return commandes;
    }
  }, []);

  const filtrerParReference = useCallback((commandes, recherche) => {
    if (!recherche.trim()) return commandes;
    return commandes.filter((commande) =>
      commande.refPatient.toLowerCase().includes(recherche.toLowerCase()),
    );
  }, []);

  // ==================== FILTRES COMBINÉS ====================
  const commandesFiltrees = useMemo(() => {
    let resultat = [...commandes];
    resultat = filtrerParDate(resultat, filtreDate);
    resultat = filtrerParReference(resultat, filtreReference);
    return resultat;
  }, [
    commandes,
    filtreDate,
    filtreReference,
    filtrerParDate,
    filtrerParReference,
  ]);

  // ==================== PAGINATION ====================
  const indexDerniereCommande = currentPage * COMMANDES_PAR_PAGE;
  const indexPremiereCommande = indexDerniereCommande - COMMANDES_PAR_PAGE;
  const commandesCourantes = commandesFiltrees.slice(
    indexPremiereCommande,
    indexDerniereCommande,
  );
  const totalPages = Math.ceil(commandesFiltrees.length / COMMANDES_PAR_PAGE);

  // Handlers de pagination
  const allerPageSuivante = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const allerPagePrecedente = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const allerPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Réinitialiser pagination lors du changement de filtres
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filtreDate, filtreReference]);

  // ==================== UTILITAIRES DE STATUT ====================
  const getStatutIcon = useCallback((statut) => {
    const iconMap = {
      EN_ATTENTE: <Clock size={12} />,
      EN_COURS: <AlertCircle size={12} />,
      TERMINEE: <CheckCircle size={12} />,
      EXPEDIEE: <Truck size={12} />,
      ANNULEE: <XCircle size={12} />,
    };
    return iconMap[statut] || <Clock size={12} />;
  }, []);

  const getStatutText = useCallback((statut) => {
    const textMap = {
      EN_ATTENTE: "En attente",
      EN_COURS: "En cours",
      TERMINEE: "Terminée",
      EXPEDIEE: "Expédiée",
      ANNULEE: "Annulée",
    };
    return textMap[statut] || statut;
  }, []);

  const getStatutClass = useCallback((statut) => {
    const classMap = {
      EN_ATTENTE: "en-attente",
      EN_COURS: "en-cours",
      TERMINEE: "termine",
      EXPEDIEE: "livre",
      ANNULEE: "annule",
    };
    return classMap[statut] || "en-attente";
  }, []);

  // ==================== COMPOSANT CARTE ====================
  const CommandeCard = useCallback(
    ({ commande }) => (
      <div className="commandes-cabinet-card">
        {/* En-tête */}
        <div className="commandes-cabinet-header">
          <div className="commandes-cabinet-info">
            <h3 className="commandes-cabinet-ref" title={commande.refPatient}>
              {commande.refPatient}
            </h3>
            <p className="commandes-cabinet-plateforme">
              {commande.plateforme}
            </p>
          </div>
          <div
            className={`commandes-cabinet-statut ${getStatutClass(commande.statut)}`}
          >
            {getStatutIcon(commande.statut)}
            {getStatutText(commande.statut)}
          </div>
        </div>

        {/* Détails */}
        <div className="commandes-cabinet-details">
          <div className="commandes-cabinet-detail" title="Date de réception">
            <Calendar size={12} />
            <span>
              {new Date(commande.dateReception).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          {commande.dateEcheance && (
            <div className="commandes-cabinet-detail" title="Date d'échéance">
              <Clock size={12} />
              <span>
                {new Date(commande.dateEcheance).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {commande.typeAppareil && (
            <div className="commandes-cabinet-detail" title="Type d'appareil">
              <Package size={12} />
              <span>{commande.typeAppareil}</span>
            </div>
          )}
          {commande.numeroSuivi && (
            <div className="commandes-cabinet-detail" title="Numéro de suivi">
              <Truck size={12} />
              <span>{commande.numeroSuivi}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {commande.details && (
          <div className="commandes-cabinet-description">
            <p>{commande.details}</p>
          </div>
        )}

        {/* Commentaire */}
        {commande.commentaire && (
          <div className="commandes-cabinet-commentaire">
            <p>
              <strong>Note:</strong> {commande.commentaire}
            </p>
          </div>
        )}
      </div>
    ),
    [getStatutClass, getStatutIcon, getStatutText],
  );

  // ==================== RENDER ====================
  return (
    <div className="commandes-cabinet-section">
      {/* Section Filtres */}
      <div className="commandes-cabinet-filtres">
        <div className="commandes-cabinet-filtre-groupe">
          {/* Filtre par date */}
          <div className="commandes-cabinet-filtre-item">
            <label htmlFor="filtre-date">
              <Filter size={14} />
              Période
            </label>
            <select
              id="filtre-date"
              value={filtreDate}
              onChange={(e) => setFiltreDate(e.target.value)}
              className="commandes-cabinet-select"
            >
              <option value="TOUS">Toutes les dates</option>
              <option value="AUJOURD_HUI">Aujourd'hui</option>
              <option value="CETTE_SEMAINE">Cette semaine</option>
              <option value="CE_MOIS">Ce mois</option>
              <option value="CETTE_ANNEE">Cette année</option>
            </select>
          </div>

          {/* Filtre par référence */}
          <div className="commandes-cabinet-filtre-item">
            <label htmlFor="filtre-reference">
              <Search size={14} />
              Recherche
            </label>
            <input
              id="filtre-reference"
              type="text"
              placeholder="Ref. patient..."
              value={filtreReference}
              onChange={(e) => setFiltreReference(e.target.value)}
              className="commandes-cabinet-search"
            />
          </div>
        </div>

        {/* Résultats */}
        <div className="commandes-cabinet-resultats">
          {commandesFiltrees.length} commande
          {commandesFiltrees.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Gestion des états */}
      {loading ? (
        <div className="commandes-cabinet-loading">
          <div className="commandes-cabinet-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      ) : error ? (
        <div className="commandes-cabinet-empty">
          <Package size={40} />
          <h3>Erreur de chargement</h3>
          <p>Une erreur est survenue lors du chargement des commandes.</p>
        </div>
      ) : commandesFiltrees.length === 0 ? (
        <div className="commandes-cabinet-empty">
          <Package size={40} />
          <h3>Aucune commande</h3>
          <p>Aucune commande ne correspond à vos critères.</p>
        </div>
      ) : (
        <>
          {/* Grille des commandes */}
          <div className="commandes-cabinet-grid">
            {commandesCourantes.map((commande) => (
              <CommandeCard key={commande.id} commande={commande} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="commandes-cabinet-pagination">
              <button
                onClick={allerPagePrecedente}
                disabled={currentPage === 1}
                className="commandes-cabinet-pagination-btn"
                aria-label="Page précédente"
              >
                <ChevronLeft size={14} />
                Préc.
              </button>

              <div className="commandes-cabinet-pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => allerPage(page)}
                      className={`commandes-cabinet-pagination-page ${
                        currentPage === page ? "active" : ""
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={allerPageSuivante}
                disabled={currentPage === totalPages}
                className="commandes-cabinet-pagination-btn"
                aria-label="Page suivante"
              >
                Suiv.
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommandesCabinet;
