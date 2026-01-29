/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import {
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from "lucide-react";
import CommandeRow from "./CommandeRow";
import "./CommandesList.css";

const CommandesList = ({
  commandes,
  totalCommandes,
  onViewDetails,
  onToggleVu,
  onSyncAll,
  connectedPlatformsCount,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 25,
  // Props de sélection
  selectedIds,
  onSelectOne,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkReadToggle,
  isBulkProcessing,
}) => {
  const sortedCommandes = useMemo(() => {
    return [...commandes].sort((a, b) => {
      if (typeof a.id === "number" && typeof b.id === "number")
        return b.id - a.id;
      if (a.id < b.id) return 1;
      if (a.id > b.id) return -1;
      return 0;
    });
  }, [commandes]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedCommandes.length);
  const currentPageCommandes = sortedCommandes.slice(startIndex, endIndex);

  // Gestion de la sélection globale de la page courante
  const allCurrentPageSelected =
    currentPageCommandes.length > 0 &&
    currentPageCommandes.every((cmd) => selectedIds.includes(cmd.id));

  const handleToggleSelectAllPage = () => {
    if (allCurrentPageSelected) {
      // Désélectionner ceux de la page courante
      const idsToDeselect = currentPageCommandes.map((c) => c.id);
      const newSelection = selectedIds.filter(
        (id) => !idsToDeselect.includes(id),
      );
      onSelectAll(newSelection);
    } else {
      // Sélectionner ceux de la page courante
      const idsToSelect = currentPageCommandes.map((c) => c.id);
      // Fusionner sans doublons
      const newSelection = [...new Set([...selectedIds, ...idsToSelect])];
      onSelectAll(newSelection);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="cmd-list-section">
      {/* BARRE D'ACTIONS DE MASSE */}
      {selectedIds.length > 0 && (
        <div className="cmd-list-bulk-bar">
          <div className="cmd-list-bulk-info">
            <span className="cmd-list-bulk-count">
              {selectedIds.length} sélectionné(s)
            </span>
            <button className="cmd-list-bulk-clear" onClick={onClearSelection}>
              Annuler
            </button>
          </div>
          <div className="cmd-list-bulk-controls">
            <select
              className="cmd-list-bulk-select"
              onChange={(e) => {
                if (e.target.value) onBulkStatusChange(e.target.value);
                e.target.value = ""; // Reset select
              }}
              disabled={isBulkProcessing}
            >
              <option value="">Changer le statut...</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="EXPEDIEE">Expédiée (Email)</option>
              <option value="ANNULEE">Annulée</option>
            </select>

            <button
              className="cmd-list-bulk-btn"
              onClick={() => onBulkReadToggle(true)}
              disabled={isBulkProcessing}
              title="Marquer comme lu"
            >
              <Eye size={18} />
            </button>
            <button
              className="cmd-list-bulk-btn"
              onClick={() => onBulkReadToggle(false)}
              disabled={isBulkProcessing}
              title="Marquer comme non lu"
            >
              <EyeOff size={18} />
            </button>
            <div className="cmd-list-bulk-divider"></div>
            <button
              className="cmd-list-bulk-btn cmd-list-bulk-btn-delete"
              onClick={onBulkDelete}
              disabled={isBulkProcessing}
              title="Supprimer"
            >
              <Trash2 size={18} /> {isBulkProcessing ? "..." : ""}
            </button>
          </div>
        </div>
      )}

      {commandes.length === 0 ? (
        <div className="cmd-list-empty">
          <FileText className="cmd-list-empty-icon" size={48} />
          <h3 className="cmd-list-empty-title">Aucune commande trouvée</h3>
          <p className="cmd-list-empty-msg">
            {totalCommandes === 0
              ? "Aucune commande n'a été créée pour le moment. Connectez vos plateformes et synchronisez."
              : "Aucune commande ne correspond à vos critères de recherche."}
          </p>
          {totalCommandes === 0 && connectedPlatformsCount > 0 && (
            <button
              className="cmd-list-btn cmd-list-btn-primary"
              onClick={onSyncAll}
            >
              <RefreshCw size={16} /> Synchroniser maintenant
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="cmd-list-table">
            <div className="cmd-list-header">
              {/* Checkbox Header */}
              <div
                className="cmd-list-header-cell cmd-list-checkbox-cell"
                onClick={handleToggleSelectAllPage}
              >
                {allCurrentPageSelected ? (
                  <CheckSquare size={18} className="cmd-list-icon-primary" />
                ) : (
                  <Square size={18} className="cmd-list-icon-gray" />
                )}
              </div>
              <div className="cmd-list-header-cell">ID</div>
              <div className="cmd-list-header-cell">Patient</div>
              <div className="cmd-list-header-cell">Cabinet</div>
              <div className="cmd-list-header-cell">Plateforme</div>
              <div className="cmd-list-header-cell">Réception</div>
              <div className="cmd-list-header-cell">Échéance</div>
              <div className="cmd-list-header-cell">Statut</div>
              <div className="cmd-list-header-cell">Actions</div>
            </div>

            <div className="cmd-list-body">
              {currentPageCommandes.map((commande) => (
                <CommandeRow
                  key={commande.id}
                  commande={commande}
                  onViewDetails={onViewDetails}
                  onToggleVu={onToggleVu}
                  // Props de sélection
                  isSelected={selectedIds.includes(commande.id)}
                  onSelect={() => onSelectOne(commande.id)}
                />
              ))}
            </div>
          </div>

          <div className="cmd-list-pagination">
            <div className="cmd-list-pagination-info">
              <span className="cmd-list-pagination-text">
                Affichage de {startIndex + 1} à {endIndex} sur{" "}
                {commandes.length} commande
                {commandes.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="cmd-list-pagination-controls">
              <button
                className="cmd-list-pagination-btn"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <div className="cmd-list-pagination-pages">
                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    className={`cmd-list-pagination-page ${
                      page === currentPage
                        ? "cmd-list-pagination-page-active"
                        : ""
                    }`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="cmd-list-pagination-btn"
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CommandesList);
