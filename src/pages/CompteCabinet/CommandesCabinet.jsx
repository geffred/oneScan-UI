import React, { useState, useMemo } from "react";
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

const CommandesCabinet = ({ commandes, loading, error }) => {
  // États pour les filtres et la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filtreDate, setFiltreDate] = useState("TOUS");
  const [filtreReference, setFiltreReference] = useState("");
  const commandesParPage = 5;

  // Fonction pour filtrer les commandes par date
  const filtrerParDate = (commandes, filtre) => {
    const maintenant = new Date();

    switch (filtre) {
      case "AUJOURD_HUI":
        const aujourdHui = new Date();
        aujourdHui.setHours(0, 0, 0, 0);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          dateReception.setHours(0, 0, 0, 0);
          return dateReception.getTime() === aujourdHui.getTime();
        });

      case "CETTE_SEMAINE":
        const debutSemaine = new Date(maintenant);
        debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
        debutSemaine.setHours(0, 0, 0, 0);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutSemaine;
        });

      case "CE_MOIS":
        const debutMois = new Date(
          maintenant.getFullYear(),
          maintenant.getMonth(),
          1
        );
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutMois;
        });

      case "CETTE_ANNEE":
        const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
        return commandes.filter((commande) => {
          const dateReception = new Date(commande.dateReception);
          return dateReception >= debutAnnee;
        });

      default:
        return commandes;
    }
  };

  // Fonction pour filtrer par référence patient
  const filtrerParReference = (commandes, recherche) => {
    if (!recherche.trim()) return commandes;
    return commandes.filter((commande) =>
      commande.refPatient.toLowerCase().includes(recherche.toLowerCase())
    );
  };

  // Application des filtres
  const commandesFiltrees = useMemo(() => {
    let resultat = [...commandes];

    // Appliquer le filtre de date
    resultat = filtrerParDate(resultat, filtreDate);

    // Appliquer le filtre de référence
    resultat = filtrerParReference(resultat, filtreReference);

    return resultat;
  }, [commandes, filtreDate, filtreReference]);

  // Calcul de la pagination
  const indexDerniereCommande = currentPage * commandesParPage;
  const indexPremiereCommande = indexDerniereCommande - commandesParPage;
  const commandesCourantes = commandesFiltrees.slice(
    indexPremiereCommande,
    indexDerniereCommande
  );
  const totalPages = Math.ceil(commandesFiltrees.length / commandesParPage);

  // Gestion du changement de page
  const allerPageSuivante = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const allerPagePrecedente = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const allerPage = (page) => {
    setCurrentPage(page);
  };

  // Réinitialiser la pagination quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filtreDate, filtreReference]);

  // Fonctions utilitaires pour les statuts
  const getStatutIcon = (statut) => {
    const iconMap = {
      EN_ATTENTE: <Clock size={16} />,
      EN_COURS: <AlertCircle size={16} />,
      TERMINEE: <CheckCircle size={16} />,
      EXPEDIEE: <Truck size={16} />,
      ANNULEE: <XCircle size={16} />,
    };
    return iconMap[statut] || <Clock size={16} />;
  };

  const getStatutText = (statut) => {
    const textMap = {
      EN_ATTENTE: "En attente",
      EN_COURS: "En cours",
      TERMINEE: "Terminée",
      EXPEDIEE: "Expédiée",
      ANNULEE: "Annulée",
    };
    return textMap[statut] || statut;
  };

  const getStatutClass = (statut) => {
    const classMap = {
      EN_ATTENTE: "en-attente",
      EN_COURS: "en-cours",
      TERMINEE: "termine",
      EXPEDIEE: "livre",
      ANNULEE: "annule",
    };
    return classMap[statut] || "en-attente";
  };

  // Composant pour l'affichage d'une commande
  const CommandeCard = ({ commande }) => (
    <div className="commandes-cabinet-card">
      <div className="commandes-cabinet-header">
        <div className="commandes-cabinet-info">
          <h3 className="commandes-cabinet-ref">{commande.refPatient}</h3>
          <p className="commandes-cabinet-plateforme">{commande.plateforme}</p>
        </div>
        <div
          className={`commandes-cabinet-statut ${getStatutClass(
            commande.statut
          )}`}
        >
          {getStatutIcon(commande.statut)}
          {getStatutText(commande.statut)}
        </div>
      </div>

      <div className="commandes-cabinet-details">
        <div className="commandes-cabinet-detail">
          <Calendar size={14} />
          <span>
            Réception:{" "}
            {new Date(commande.dateReception).toLocaleDateString("fr-FR")}
          </span>
        </div>
        {commande.dateEcheance && (
          <div className="commandes-cabinet-detail">
            <Clock size={14} />
            <span>
              Échéance:{" "}
              {new Date(commande.dateEcheance).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
        {commande.typeAppareil && (
          <div className="commandes-cabinet-detail">
            <Package size={14} />
            <span>Type: {commande.typeAppareil}</span>
          </div>
        )}
        {commande.numeroSuivi && (
          <div className="commandes-cabinet-detail">
            <Truck size={14} />
            <span>Suivi: {commande.numeroSuivi}</span>
          </div>
        )}
      </div>

      {commande.details && (
        <div className="commandes-cabinet-description">
          <p>{commande.details}</p>
        </div>
      )}

      {commande.commentaire && (
        <div className="commandes-cabinet-commentaire">
          <p>
            <strong>Commentaire:</strong> {commande.commentaire}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="commandes-cabinet-section">
      <div className="commandes-cabinet-header-section">
        <h2 className="commandes-cabinet-title">
          <Package size={20} />
          Mes Commandes
        </h2>
        <p className="commandes-cabinet-subtitle">
          Suivez l'état de vos commandes en temps réel
        </p>
      </div>

      {/* Filtres */}
      <div className="commandes-cabinet-filtres">
        <div className="commandes-cabinet-filtre-groupe">
          <div className="commandes-cabinet-filtre-item">
            <Filter size={16} />
            <label>Filtrer par date:</label>
            <select
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

          <div className="commandes-cabinet-filtre-item">
            <Search size={16} />
            <label>Rechercher par référence:</label>
            <input
              type="text"
              placeholder="Référence patient..."
              value={filtreReference}
              onChange={(e) => setFiltreReference(e.target.value)}
              className="commandes-cabinet-search"
            />
          </div>
        </div>

        {/* Résultats du filtre */}
        <div className="commandes-cabinet-resultats">
          <span>
            {commandesFiltrees.length} commande
            {commandesFiltrees.length > 1 ? "s" : ""} trouvée
            {commandesFiltrees.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Gestion des états de chargement et d'erreur */}
      {loading ? (
        <div className="commandes-cabinet-loading">
          <div className="commandes-cabinet-spinner"></div>
          <p>Chargement de vos commandes...</p>
        </div>
      ) : error ? (
        <div className="commandes-cabinet-empty">
          <Package size={48} className="text-gray-400" />
          <h3>Erreur de chargement</h3>
          <p>Une erreur est survenue lors du chargement des commandes.</p>
        </div>
      ) : commandesFiltrees.length === 0 ? (
        <div className="commandes-cabinet-empty">
          <Package size={48} className="text-gray-400" />
          <h3>Aucune commande trouvée</h3>
          <p>Aucune commande ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <>
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
              >
                <ChevronLeft size={16} />
                Précédent
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
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={allerPageSuivante}
                disabled={currentPage === totalPages}
                className="commandes-cabinet-pagination-btn"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommandesCabinet;
