import React, { useState } from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import "./commandes.css";

// Fonction fetcher pour SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

const Commandes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlateforme, setSelectedPlateforme] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Récupération des données avec SWR
  const {
    data: commandes,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/commandes", fetcher);

  // Gestion des états d'erreur et de chargement
  if (error) {
    return (
      <div className="commandes-card">
        <div className="commandes-error-state">
          <AlertCircle className="commandes-error-icon" size={48} />
          <h3 className="commandes-error-title">Erreur de chargement</h3>
          <p className="commandes-error-message">
            Impossible de récupérer les commandes. Veuillez réessayer.
          </p>
          <button
            className="commandes-btn commandes-btn-primary"
            onClick={() => mutate()}
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="commandes-card">
        <div className="commandes-loading-state">
          <div className="commandes-loading-spinner"></div>
          <p className="commandes-loading-text">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  // Calcul des statistiques
  const totalCommandes = commandes?.length || 0;
  const commandesNonVues = commandes?.filter((cmd) => !cmd.vu).length || 0;
  const commandesEchues =
    commandes?.filter((cmd) => {
      const today = new Date();
      const echeance = new Date(cmd.dateEcheance);
      return echeance < today;
    }).length || 0;

  // Filtrage des commandes
  const filteredCommandes =
    commandes?.filter((commande) => {
      const matchesSearch =
        commande.refPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.cabinet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.externalId?.toString().includes(searchTerm);

      const matchesPlateforme =
        selectedPlateforme === "" || commande.plateforme === selectedPlateforme;
      const matchesUnread = !showOnlyUnread || !commande.vu;

      return matchesSearch && matchesPlateforme && matchesUnread;
    }) || [];

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fonction pour obtenir le statut d'échéance
  const getEcheanceStatus = (dateEcheance) => {
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
  };

  // Fonction pour obtenir la couleur de la plateforme
  const getPlateformeColor = (plateforme) => {
    const colors = {
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
    };
    return colors[plateforme] || "gray";
  };

  return (
    <div className="commandes-card">
      <div className="commandes-header">
        <h2 className="commandes-card-title">Gestion des Commandes</h2>
        <button className="commandes-btn commandes-btn-primary">
          <Plus size={16} />
          Synchroniser
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="commandes-filters-section">
        <div className="commandes-search-bar">
          <Search className="commandes-search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par patient, cabinet ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="commandes-search-input"
          />
        </div>

        <div className="commandes-filters">
          <select
            value={selectedPlateforme}
            onChange={(e) => setSelectedPlateforme(e.target.value)}
            className="commandes-filter-select"
          >
            <option value="">Toutes les plateformes</option>
            <option value="MEDITLINK">MeditLink</option>
            <option value="ITERO">Itero</option>
            <option value="THREESHAPE">3Shape</option>
            <option value="DEXIS">Dexis</option>
          </select>

          <label className="commandes-checkbox-filter">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="commandes-checkbox"
            />
            <span>Non vues seulement</span>
          </label>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="commandes-list-section">
        {filteredCommandes.length === 0 ? (
          <div className="commandes-empty-state">
            <FileText className="commandes-empty-icon" size={48} />
            <h3 className="commandes-empty-title">Aucune commande trouvée</h3>
            <p className="commandes-empty-message">
              {commandes?.length === 0
                ? "Aucune commande n'a été créée pour le moment."
                : "Aucune commande ne correspond à vos filtres."}
            </p>
          </div>
        ) : (
          <div className="commandes-table">
            <div className="commandes-table-header">
              <div className="commandes-table-cell">ID</div>
              <div className="commandes-table-cell">Patient</div>
              <div className="commandes-table-cell">Cabinet</div>
              <div className="commandes-table-cell">Plateforme</div>
              <div className="commandes-table-cell">Réception</div>
              <div className="commandes-table-cell">Échéance</div>
              <div className="commandes-table-cell">Statut</div>
              <div className="commandes-table-cell">Actions</div>
            </div>

            <div className="commandes-table-body">
              {filteredCommandes.map((commande) => {
                const echeanceStatus = getEcheanceStatus(commande.dateEcheance);
                const plateformeColor = getPlateformeColor(commande.plateforme);

                return (
                  <div
                    key={commande.id}
                    className={`commandes-table-row ${
                      !commande.vu ? "commandes-row-unread" : ""
                    }`}
                  >
                    <div className="commandes-table-cell">
                      <span className="commandes-external-id">
                        #{commande.externalId}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-patient-info">
                        <span className="commandes-patient-name">
                          {commande.refPatient || "Non spécifié"}
                        </span>
                        {!commande.vu && (
                          <span className="commandes-unread-badge">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <span className="commandes-cabinet-name">
                        {commande.cabinet}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <span
                        className={`commandes-plateforme-badge commandes-plateforme-${plateformeColor}`}
                      >
                        {commande.plateforme}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-date-info">
                        <Calendar size={14} />
                        <span>{formatDate(commande.dateReception)}</span>
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-date-info">
                        <Clock size={14} />
                        <span>{formatDate(commande.dateEcheance)}</span>
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <span
                        className={`commandes-status-badge commandes-status-${echeanceStatus.class}`}
                      >
                        {echeanceStatus.label}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-actions">
                        <button
                          className="commandes-action-btn commandes-action-view"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        {commande.pdf && (
                          <button
                            className="commandes-action-btn commandes-action-download"
                            title="Télécharger PDF"
                          >
                            <Download size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination ou résumé */}
      {filteredCommandes.length > 0 && (
        <div className="commandes-footer">
          <p className="commandes-results-count">
            {filteredCommandes.length} commande
            {filteredCommandes.length > 1 ? "s" : ""} affichée
            {filteredCommandes.length > 1 ? "s" : ""}
            {filteredCommandes.length !== totalCommandes &&
              ` sur ${totalCommandes} au total`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Commandes;
