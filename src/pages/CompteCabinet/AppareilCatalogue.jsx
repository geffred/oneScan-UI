/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({ categorie: "", option: "" });

  const { data: appareils = [], isLoading } = useSWR("/appareils", fetcher, {
    revalidateOnFocus: false,
  });

  const filtered = useMemo(() => {
    let r = appareils;
    if (filters.categorie)
      r = r.filter((a) => a.categorie === filters.categorie);
    if (filters.option) r = r.filter((a) => a.options === filters.option);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      r = r.filter(
        (a) =>
          a.nom.toLowerCase().includes(t) ||
          a.description?.toLowerCase().includes(t) ||
          a.categorie.toLowerCase().includes(t) ||
          a.options?.toLowerCase().includes(t),
      );
    }
    return r;
  }, [appareils, searchTerm, filters]);

  const getCoverImage = useCallback(
    (a) => (a?.images?.length > 0 ? a.images[0].imagePath : null),
    [],
  );

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
            onClick={() => setViewMode("grid")}
            title="Vue grille"
          >
            <Grid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select
            value={filters.categorie}
            onChange={(e) =>
              setFilters((p) => ({ ...p, categorie: e.target.value }))
            }
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={filters.option}
            onChange={(e) =>
              setFilters((p) => ({ ...p, option: e.target.value }))
            }
          >
            <option value="">Toutes options</option>
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalogue-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner small" />
            <span>Chargement du catalogue...</span>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="results-count">{filtered.length} appareil(s)</div>
            <div className={`appareils-grid ${viewMode}`}>
              {filtered.map((appareil) => {
                const cover = getCoverImage(appareil);
                const isSelected = selectedAppareil?.id === appareil.id;
                return (
                  <article
                    key={appareil.id}
                    className={`appareil-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelectAppareil(appareil)}
                  >
                    <div className="appareil-image-wrapper">
                      {cover ? (
                        <>
                          <img
                            src={cover}
                            alt={appareil.nom}
                            className="appareil-cover-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                          <div
                            className="appareil-no-image"
                            style={{ display: "none" }}
                          >
                            <ImageIcon size={40} />
                            <span>Pas d'image</span>
                          </div>
                        </>
                      ) : (
                        <div className="appareil-no-image">
                          <ImageIcon size={40} />
                          <span>Pas d'image</span>
                        </div>
                      )}
                    </div>
                    <div className="appareil-card-content">
                      <h3>{appareil.nom}</h3>
                      <dl>
                        <dt>Catégorie:</dt>
                        <dd>
                          {CATEGORIES.find(
                            (c) => c.value === appareil.categorie,
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
                          onSelectAppareil(appareil);
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
