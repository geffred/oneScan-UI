/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React from "react";
import { Search, Filter, CalendarDays, X } from "lucide-react";
import "./CommandesFilters.css";

const CommandesFilters = ({
  searchTerm,
  onSearchChange,
  selectedPlateforme,
  onPlateformeChange,
  dateFilter,
  onDateFilterChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  showOnlyUnread,
  onUnreadToggle,
}) => {
  return (
    <div className="commandes-filters-section">
      <div className="commandes-search-bar">
        <Search className="commandes-search-icon" size={20} />
        <input
          type="text"
          placeholder="Rechercher par patient, cabinet ou ID..."
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

        <label className="commandes-checkbox-filter">
          <input
            type="checkbox"
            checked={showOnlyUnread}
            onChange={onUnreadToggle}
            className="commandes-checkbox"
          />
          <span>Non vues seulement</span>
        </label>
      </div>
    </div>
  );
};

export default React.memo(CommandesFilters);
