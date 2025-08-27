import React from "react";
import { ArrowLeft, Building } from "lucide-react";
import CabinetSearch from "./CabinetSearch";

const CommandeHeader = ({
  commande,
  cabinets,
  cabinetsLoading,
  showCabinetSearch,
  setShowCabinetSearch,
  handleBack,
  handleAssociateCabinet,
}) => {
  return (
    <>
      {/* En-tête */}
      <div className="details-header-section">
        <div className="details-back-and-associate">
          <button
            className="details-btn details-btn-secondary"
            onClick={handleBack}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        <div className="details-header-actions">
          <button
            className="details-btn details-btn-primary"
            onClick={() => setShowCabinetSearch(!showCabinetSearch)}
          >
            <Building size={16} />
            {commande.cabinetId ? "Changer de cabinet" : "Associer un cabinet"}
          </button>
        </div>
      </div>

      {/* Cabinet associé */}
      {commande.cabinetId && (
        <div className="associated-cabinet-display">
          <Building size={16} />
          <span>
            Cabinet associé:{" "}
            {cabinets.find((c) => c.id === commande.cabinetId)?.nom ||
              `ID: ${commande.cabinetId}`}
          </span>
        </div>
      )}

      {/* Barre de recherche des cabinets */}
      {showCabinetSearch && (
        <CabinetSearch
          cabinets={cabinets}
          isLoading={cabinetsLoading}
          onAssociate={handleAssociateCabinet}
          onClose={() => setShowCabinetSearch(false)}
        />
      )}

      <div className="details-title-wrapper">
        <h2 className="details-card-title">
          Commande [ {commande.externalId} ]
        </h2>
      </div>
    </>
  );
};

export default CommandeHeader;
