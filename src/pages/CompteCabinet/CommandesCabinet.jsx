import React from "react";
import {
  Package,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import "./CommandesCabinet.css";

const CommandesCabinet = ({ commandes, loading, error }) => {
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
      ) : commandes.length === 0 ? (
        <div className="commandes-cabinet-empty">
          <Package size={48} className="text-gray-400" />
          <h3>Aucune commande trouvée</h3>
          <p>
            Vos commandes apparaîtront ici une fois créées par le laboratoire.
          </p>
        </div>
      ) : (
        <div className="commandes-cabinet-grid">
          {commandes.map((commande) => (
            <CommandeCard key={commande.id} commande={commande} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandesCabinet;
