import React, { useState, useRef, useEffect } from "react";
import { Search, X, Plus, Building } from "lucide-react";

const CabinetSearch = ({ cabinets = [], isLoading, onAssociate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  // Focus sur l'input quand le composant est monté
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredCabinets = searchTerm
    ? cabinets.filter(
        (cabinet) =>
          cabinet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cabinet.adresseDeLivraison &&
            cabinet.adresseDeLivraison
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : cabinets;

  return (
    <div className="cabinet-search-container">
      <div className="cabinet-search-header">
        <h3>Rechercher un cabinet</h3>
        <button
          className="details-btn details-btn-secondary details-btn-sm"
          onClick={onClose}
        >
          <X size={16} />
          Fermer
        </button>
      </div>
      <div className="cabinet-search-input-wrapper">
        <Search size={16} className="cabinet-search-input-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Rechercher un cabinet par nom ou adresse..."
          className="cabinet-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="cabinet-search-results">
        {isLoading ? (
          <div className="cabinet-search-loading">
            <div className="cabinet-loading-spinner"></div>
            Chargement des cabinets...
          </div>
        ) : filteredCabinets.length === 0 ? (
          <div className="cabinet-search-empty">
            {searchTerm
              ? "Aucun cabinet ne correspond à votre recherche"
              : "Aucun cabinet disponible"}
          </div>
        ) : (
          filteredCabinets.map((cabinet) => (
            <div key={cabinet.id} className="cabinet-search-item">
              <div className="cabinet-search-info">
                <Building size={16} className="cabinet-search-icon" />
                <div>
                  <h4>{cabinet.nom}</h4>
                  <p>
                    {cabinet.adresseDeLivraison || "Adresse non renseignée"}
                  </p>
                </div>
              </div>
              <button
                className="details-btn details-btn-primary details-btn-sm"
                onClick={() => onAssociate(cabinet.id)}
              >
                <Plus size={14} />
                Associer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CabinetSearch;
