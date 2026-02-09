/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React from "react";
import {
  Search,
  Filter,
  CalendarDays,
  Clock,
  X,
  CheckCircle,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import "./CommandesFilters.css";

const CommandesFilters = ({
  searchTerm,
  onSearchChange,
  selectedPlateforme,
  onPlateformeChange,
  selectedStatut,
  onStatutChange,
  commentFilter,
  onCommentFilterChange,
  dateFilter,
  onDateFilterChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  deadlineFilter,
  onDeadlineFilterChange,
  customDeadlineFrom,
  onCustomDeadlineFromChange,
  customDeadlineTo,
  onCustomDeadlineToChange,
  showOnlyUnread,
  onUnreadToggle,
  onResetFilters, // ✅ Nouvelle prop
}) => {
  return (
    <div className="commandes-filters-section">
      <div className="commandes-search-bar">
        <Search className="commandes-search-icon" size={20} />
        <input
          type="text"
          placeholder="Rechercher par patient, cabinet, ID, numéro suivi ou commentaire..."
          value={searchTerm}
          onChange={onSearchChange}
          className="commandes-search-input"
        />
        {searchTerm && (
          <button
            className="commandes-search-clear"
            onClick={() => onSearchChange({ target: { value: "" } })}
            title="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="commandes-filters">
        {/* FILTRE PLATEFORME */}
        <div className="commandes-filter-group">
          <Filter size={16} />
          <select
            value={selectedPlateforme}
            onChange={onPlateformeChange}
            className="commandes-filter-select"
          >
            <option value="">Toutes les plateformes</option>
            <option value="MEDITLINK">MeditLink</option>
            <option value="ITERO">Itero</option>
            <option value="THREESHAPE">3Shape</option>
            <option value="DEXIS">Dexis</option>
            <option value="CSCONNECT">CS Connect</option>
            <option value="MYSMILELAB">MySmileLab</option>
          </select>
        </div>

        {/* FILTRE STATUT */}
        <div className="commandes-filter-group">
          <CheckCircle size={16} />
          <select
            value={selectedStatut}
            onChange={onStatutChange}
            className="commandes-filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="EXPEDIEE">Expédiée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        {/* FILTRE COMMENTAIRE */}
        <div className="commandes-filter-group">
          <MessageSquare size={16} />
          <select
            value={commentFilter}
            onChange={onCommentFilterChange}
            className="commandes-filter-select"
          >
            <option value="all">Tous les commentaires</option>
            <option value="with">Avec commentaire</option>
            <option value="without">Sans commentaire</option>
          </select>
        </div>

        {/* FILTRE DATE RÉCEPTION */}
        <div className="commandes-filter-group">
          <CalendarDays size={16} />
          <select
            value={dateFilter}
            onChange={onDateFilterChange}
            className="commandes-filter-select"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>

        {dateFilter === "custom" && (
          <div className="commandes-date-range">
            <input
              type="date"
              value={customDateFrom}
              onChange={onCustomDateFromChange}
              className="commandes-date-input"
              placeholder="Du"
            />
            <span className="commandes-date-separator">au</span>
            <input
              type="date"
              value={customDateTo}
              onChange={onCustomDateToChange}
              className="commandes-date-input"
              placeholder="Au"
            />
          </div>
        )}

        {/* FILTRE ÉCHÉANCE */}
        <div className="commandes-filter-group">
          <Clock size={16} />
          <select
            value={deadlineFilter}
            onChange={onDeadlineFilterChange}
            className="commandes-filter-select"
          >
            <option value="all">Toutes les échéances</option>
            <option value="expired">Échues</option>
            <option value="today">Aujourd'hui</option>
            <option value="tomorrow">Demain</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>

        {deadlineFilter === "custom" && (
          <div className="commandes-date-range">
            <input
              type="date"
              value={customDeadlineFrom}
              onChange={onCustomDeadlineFromChange}
              className="commandes-date-input"
              placeholder="Échéance du"
            />
            <span className="commandes-date-separator">au</span>
            <input
              type="date"
              value={customDeadlineTo}
              onChange={onCustomDeadlineToChange}
              className="commandes-date-input"
              placeholder="Échéance au"
            />
          </div>
        )}

        {/* CHECKBOX NON VU */}
        <label className="commandes-checkbox-filter">
          <input
            type="checkbox"
            checked={showOnlyUnread}
            onChange={onUnreadToggle}
            className="commandes-checkbox"
          />
          <span>Non vues seulement</span>
        </label>

        {/* ✅ BOUTON RESET */}
        {onResetFilters && (
          <button
            className="commandes-reset-btn"
            onClick={onResetFilters}
            title="Réinitialiser tous les filtres"
          >
            <RotateCcw size={16} />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(CommandesFilters);
