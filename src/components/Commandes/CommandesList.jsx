/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { FileText, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import CommandeRow from "./CommandeRow";
import "./CommandesList.css";

const CommandesList = ({
  commandes,
  totalCommandes,
  onViewDetails,
  onToggleVu,
  onUpdateStatus,
  onSyncAll,
  connectedPlatformsCount,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 25,
}) => {
  // --- CORRECTION ET SÉCURISATION ---
  const sortedCommandes = useMemo(() => {
    // 1. Sécurité : Si 'commandes' n'est pas prêt, on renvoie un tableau vide
    // Ceci empêche le crash de l'application au chargement
    if (!commandes || !Array.isArray(commandes)) {
      return [];
    }

    // 2. Copie et Tri
    return [...commandes].sort((a, b) => {
      if (typeof a.id === "number" && typeof b.id === "number") {
        return b.id - a.id;
      }
      if (a.id < b.id) return 1;
      if (a.id > b.id) return -1;
      return 0;
    });
  }, [commandes]);
  // ----------------------

  // Sécurité pour la pagination
  const safeLength = sortedCommandes.length;
  const startIndex =
    safeLength === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, safeLength);
  const totalFilteredCommandes = safeLength;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
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
    <div className="commandes-list-section">
      {sortedCommandes.length === 0 ? (
        <div className="commandes-empty-state">
          <FileText className="commandes-empty-icon" size={48} />
          <h3 className="commandes-empty-title">Aucune commande trouvée</h3>
          <p className="commandes-empty-message">
            {totalCommandes === 0
              ? "Aucune commande n'a été créée pour le moment. Connectez vos plateformes et synchronisez pour récupérer vos commandes."
              : "Aucune commande ne correspond à vos critères de recherche."}
          </p>
          {totalCommandes === 0 && connectedPlatformsCount > 0 && (
            <button
              className="commandes-btn commandes-btn-primary"
              onClick={onSyncAll}
            >
              <RefreshCw size={16} />
              Synchroniser maintenant
            </button>
          )}
        </div>
      ) : (
        <>
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
              {sortedCommandes
                .slice(startIndex > 0 ? startIndex - 1 : 0, endIndex)
                .map((commande) => (
                  <CommandeRow
                    key={commande.id}
                    commande={commande}
                    onViewDetails={onViewDetails}
                    onToggleVu={onToggleVu}
                    onUpdateStatus={onUpdateStatus}
                  />
                ))}
            </div>
          </div>

          <div className="commandes-pagination">
            <div className="commandes-pagination-info">
              <span className="commandes-pagination-text">
                Affichage de {startIndex} à {endIndex} sur{" "}
                {totalFilteredCommandes} commande
                {totalFilteredCommandes > 1 ? "s" : ""} filtrée
                {totalFilteredCommandes > 1 ? "s" : ""}
                {totalFilteredCommandes !== totalCommandes &&
                  ` (${totalCommandes} au total)`}
              </span>
            </div>

            <div className="commandes-pagination-controls">
              <button
                className="commandes-pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Précédent
              </button>

              <div className="commandes-pagination-pages">
                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    className={`commandes-pagination-page ${
                      page === currentPage
                        ? "commandes-pagination-page-active"
                        : ""
                    }`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                {totalPages >
                  getVisiblePages()[getVisiblePages().length - 1] && (
                  <span className="commandes-pagination-ellipsis">...</span>
                )}
              </div>

              <button
                className="commandes-pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CommandesList);
