/* eslint-disable react/prop-types */
import React, { useMemo, useCallback } from "react";
import useSWR from "swr";
import {
  Package,
  Search,
  List,
  Grid,
  ShoppingCart,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { apiGet } from "../../components/Config/apiUtils";
import "./AppareilCatalogue.css";

const fetcher = (url) => apiGet(url);

const CATEGORIES = [
  { value: "APPAREILS_FIXES_FRITTES", label: "Appareils Fixes Frittés" },
  {
    value: "APPAREILS_SUR_ANCRAGES_OSSEUX_BENEFIT",
    label: "Appareils sur Ancrages Osseux Benefit",
  },
  { value: "APPAREILS_3D_IMPRIMES", label: "Appareils 3D Imprimés" },
  { value: "APPAREILS_AMOVIBLES", label: "Appareils Amovibles" },
  { value: "CONTENTIONS", label: "Contentions" },
];

const OPTIONS = [
  { value: "DISJONCTEUR_FRITTE", label: "Disjoncteur Fritté" },
  { value: "TUBES_SUR_16_ET_26", label: "Tubes sur 16 et 26" },
  { value: "BRAS_DE_DELAIRE", label: "Bras de Delaire" },
  { value: "SMART_BANDS", label: "Smart Bands" },
  { value: "VERIN_SUPERIEUR", label: "Vérin Supérieur" },
  { value: "BAGUES_STANDARD", label: "Bagues Standard" },
  {
    value: "BENEFIT_STANDARD_VERIN_STANDARD",
    label: "Benefit Standard (Vérin Standard)",
  },
  {
    value: "POWER_SCREW_BENEFIT_STANDARD",
    label: "Power Screw Benefit Standard",
  },
  { value: "AUCUN", label: "Aucune option" },
];

const AppareilCatalogue = ({ selectedAppareil, onSelectAppareil }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState("grid");
  const [filters, setFilters] = React.useState({
    categorie: "",
    option: "",
  });

  const { data: appareils = [], isLoading: loadingAppareils } = useSWR(
    "/appareils",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Optimisation du filtrage avec useMemo
  const filteredAndSearchedAppareils = useMemo(() => {
    let result = appareils;

    if (filters.categorie) {
      result = result.filter((app) => app.categorie === filters.categorie);
    }
    if (filters.option) {
      result = result.filter((app) => app.options === filters.option);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.nom.toLowerCase().includes(term) ||
          app.description?.toLowerCase().includes(term) ||
          app.categorie.toLowerCase().includes(term) ||
          app.options?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [appareils, searchTerm, filters]);

  // Fonction pour obtenir l'image de couverture (première image)
  const getCoverImage = useCallback((appareil) => {
    if (!appareil?.images || appareil.images.length === 0) {
      return null;
    }
    return appareil.images[0].imagePath;
  }, []);

  const handleSelectAppareil = useCallback(
    (appareil) => {
      onSelectAppareil(appareil);
    },
    [onSelectAppareil]
  );

  // Handlers optimisés pour les filtres
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategorieChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, categorie: e.target.value }));
  }, []);

  const handleOptionChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, option: e.target.value }));
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return (
    <aside className="catalogue-section">
      <div className="section-header">
        <h2>
          <Package size={18} />
          Catalogue des Appareils
        </h2>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => handleViewModeChange("grid")}
            title="Vue grille"
          >
            <Grid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => handleViewModeChange("list")}
            title="Vue liste"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher un appareil..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filters">
          <select value={filters.categorie} onChange={handleCategorieChange}>
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select value={filters.option} onChange={handleOptionChange}>
            <option value="">Toutes options</option>
            {OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalogue-content">
        {loadingAppareils ? (
          <div className="loading-state">
            <div className="spinner small"></div>
            <span>Chargement du catalogue...</span>
          </div>
        ) : filteredAndSearchedAppareils.length > 0 ? (
          <>
            <div className="results-count">
              {filteredAndSearchedAppareils.length} appareil(s)
            </div>
            <div className={`appareils-grid ${viewMode}`}>
              {filteredAndSearchedAppareils.map((appareil) => {
                const coverImage = getCoverImage(appareil);

                return (
                  <article
                    key={appareil.id}
                    className={`appareil-card ${
                      selectedAppareil?.id === appareil.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAppareil(appareil)}
                  >
                    {/* Image de couverture */}
                    {coverImage ? (
                      <div className="appareil-image-wrapper">
                        <img
                          src={coverImage}
                          alt={appareil.nom}
                          className="appareil-cover-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="appareil-no-image"
                          style={{ display: "none" }}
                        >
                          <ImageIcon size={40} />
                          <span>Pas d'image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="appareil-image-wrapper">
                        <div className="appareil-no-image">
                          <ImageIcon size={40} />
                          <span>Pas d'image</span>
                        </div>
                      </div>
                    )}

                    <div className="appareil-card-content">
                      <h3>{appareil.nom}</h3>
                      <dl>
                        <dt>Catégorie:</dt>
                        <dd>
                          {CATEGORIES.find(
                            (c) => c.value === appareil.categorie
                          )?.label || appareil.categorie}
                        </dd>
                        <dt>Option:</dt>
                        <dd>
                          {OPTIONS.find((o) => o.value === appareil.options)
                            ?.label || appareil.options}
                        </dd>
                        {appareil.description && (
                          <>
                            <dt>Description:</dt>
                            <dd>{appareil.description}</dd>
                          </>
                        )}
                      </dl>
                      <button
                        className="select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAppareil(appareil);
                        }}
                      >
                        <ShoppingCart size={16} />
                        Sélectionner
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <AlertCircle size={40} />
            <h3>Aucun appareil trouvé</h3>
            <p>Modifiez vos critères de recherche</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppareilCatalogue;
