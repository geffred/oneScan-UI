/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import {
  Settings,
  Search,
  Eye,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Tag,
  Wrench,
  Image as ImageIcon,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import "./AppareilGallery.css";

const CATEGORIES = [
  { value: "", label: "Toutes les catégories" },
  { value: "APPAREILS_FIXES_FRITTES", label: "Appareils Fixes Frittés" },
  {
    value: "APPAREILS_SUR_ANCRAGES_OSSEUX_BENEFIT",
    label: "Ancrages Osseux Benefit",
  },
  { value: "APPAREILS_3D_IMPRIMES", label: "Appareils 3D Imprimés" },
  { value: "APPAREILS_AMOVIBLES", label: "Appareils Amovibles" },
  { value: "CONTENTIONS", label: "Contentions" },
];

const OPTIONS = [
  { value: "", label: "Toutes les options" },
  { value: "DISJONCTEUR_FRITTE", label: "Disjoncteur Fritté" },
  { value: "TUBES_SUR_16_ET_26", label: "Tubes sur 16 et 26" },
  { value: "BRAS_DE_DELAIRE", label: "Bras de Delaire" },
  { value: "SMART_BANDS", label: "Smart Bands" },
  { value: "VERIN_SUPERIEUR", label: "Vérin Supérieur" },
  { value: "BAGUES_STANDARD", label: "Bagues Standard" },
  { value: "BENEFIT_STANDARD_VERIN_STANDARD", label: "Benefit Standard" },
  {
    value: "POWER_SCREW_BENEFIT_STANDARD",
    label: "Power Screw Benefit Standard",
  },
  { value: "AUCUN", label: "Aucune option" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchPublic = async (url) => {
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok)
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  return response.json();
};

const getAppareils = () => fetchPublic("/appareils");

// --- Card ---
const AppareilCard = React.memo(({ appareil, onViewDetails }) => {
  const thumbnailImage =
    appareil.images?.length > 0 ? appareil.images[0].imagePath : null;
  const categoryLabel =
    CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
    appareil.categorie;
  const optionLabel =
    OPTIONS.find((o) => o.value === appareil.options)?.label ||
    appareil.options;

  return (
    <div className="ag-card">
      <div className="ag-card-image">
        {thumbnailImage ? (
          <img
            src={thumbnailImage}
            alt={appareil.nom}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="ag-card-placeholder"
          style={{ display: thumbnailImage ? "none" : "flex" }}
        >
          <Settings size={32} />
          <span>Aucune image</span>
        </div>
        <div className="ag-card-overlay">
          <button
            onClick={() => onViewDetails(appareil)}
            className="ag-card-view-btn"
            title="Voir les détails"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className="ag-card-body">
        <h3 className="ag-card-title">{appareil.nom}</h3>
        <div className="ag-card-meta">
          <span className="ag-card-tag">
            <Tag size={13} />
            {categoryLabel}
          </span>
          <span className="ag-card-tag">
            <Wrench size={13} />
            {optionLabel}
          </span>
        </div>
        {appareil.description && (
          <p className="ag-card-desc">
            {appareil.description.length > 90
              ? `${appareil.description.substring(0, 90)}...`
              : appareil.description}
          </p>
        )}
        <div className="ag-card-footer">
          <span className="ag-card-stat">
            <ImageIcon size={13} />
            {appareil.images?.length || 0} image(s)
          </span>
          {appareil.user && (
            <span className="ag-card-author">
              <User size={13} />
              {appareil.user.firstName} {appareil.user.lastName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
AppareilCard.displayName = "AppareilCard";

// --- Image Viewer ---
const ImageViewer = React.memo(
  ({ images, currentImageIndex, onNext, onPrev, onThumbnailClick }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    const currentImage = images[currentImageIndex];

    const handleZoomIn = useCallback(
      () => setZoomLevel((p) => Math.min(p + 0.3, 3)),
      [],
    );
    const handleZoomOut = useCallback(() => {
      setZoomLevel((p) => {
        const next = Math.max(p - 0.3, 1);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }, []);
    const handleResetZoom = useCallback(() => {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }, []);

    const handleMouseDown = useCallback(
      (e) => {
        if (zoomLevel > 1) {
          setIsDragging(true);
          setStartPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
          });
          e.preventDefault();
        }
      },
      [zoomLevel, position],
    );

    const handleMouseMove = useCallback(
      (e) => {
        if (isDragging && zoomLevel > 1) {
          setPosition({
            x: e.clientX - startPosition.x,
            y: e.clientY - startPosition.y,
          });
        }
      },
      [isDragging, zoomLevel, startPosition],
    );

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    const handleWheel = useCallback(
      (e) => {
        e.preventDefault();
        e.deltaY < 0 ? handleZoomIn() : handleZoomOut();
      },
      [handleZoomIn, handleZoomOut],
    );

    React.useEffect(() => {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }, [currentImageIndex]);

    return (
      <div className="ag-viewer">
        <div className="ag-viewer-main">
          {currentImage ? (
            <div
              className="ag-zoom-container"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              <img
                src={currentImage.imagePath}
                alt={`${currentImageIndex + 1}`}
                loading="eager"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="ag-img-placeholder" style={{ display: "none" }}>
                <Settings size={64} />
                <span>Image non disponible</span>
              </div>
            </div>
          ) : (
            <div className="ag-no-image">
              <Settings size={64} />
              <span>Aucune image</span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <button className="ag-nav-btn prev" onClick={onPrev}>
                ‹
              </button>
              <button className="ag-nav-btn next" onClick={onNext}>
                ›
              </button>
              <div className="ag-counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {currentImage && (
            <div className="ag-zoom-controls">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="ag-zoom-btn"
                title="Zoom arrière"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleResetZoom}
                className="ag-zoom-btn"
                title="Réinitialiser"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="ag-zoom-btn"
                title="Zoom avant"
              >
                <ZoomIn size={16} />
              </button>
              <span className="ag-zoom-level">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="ag-thumbnails">
            {images.map((image, index) => (
              <img
                key={image.id}
                src={image.imagePath}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                className={`ag-thumbnail ${index === currentImageIndex ? "active" : ""}`}
                onClick={() => onThumbnailClick(index)}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
ImageViewer.displayName = "ImageViewer";

// --- Detail Modal ---
const AppareilDetailModal = React.memo(({ appareil, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categoryLabel =
    CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
    appareil.categorie;
  const optionLabel =
    OPTIONS.find((o) => o.value === appareil.options)?.label ||
    appareil.options;

  const nextImage = useCallback(() => {
    if (appareil.images?.length > 1)
      setCurrentImageIndex((p) => (p + 1) % appareil.images.length);
  }, [appareil.images]);

  const prevImage = useCallback(() => {
    if (appareil.images?.length > 1)
      setCurrentImageIndex(
        (p) => (p - 1 + appareil.images.length) % appareil.images.length,
      );
  }, [appareil.images]);

  const handleThumbnailClick = useCallback((i) => setCurrentImageIndex(i), []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    },
    [onClose, prevImage, nextImage],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  if (!appareil) return null;

  return (
    <div className="ag-detail-overlay" onClick={onClose}>
      <div className="ag-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ag-detail-header">
          <h2>{appareil.nom}</h2>
          <button onClick={onClose} className="ag-detail-close">
            <X size={24} />
          </button>
        </div>

        <div className="ag-detail-body">
          <ImageViewer
            images={appareil.images || []}
            currentImageIndex={currentImageIndex}
            onNext={nextImage}
            onPrev={prevImage}
            onThumbnailClick={handleThumbnailClick}
          />

          <div className="ag-detail-info">
            <div className="ag-info-section">
              <h3>Informations</h3>
              <div className="ag-info-field">
                <Tag size={15} />
                <span>
                  <strong>Catégorie :</strong> {categoryLabel}
                </span>
              </div>
              <div className="ag-info-field">
                <Wrench size={15} />
                <span>
                  <strong>Option :</strong> {optionLabel}
                </span>
              </div>
              {appareil.description && (
                <div className="ag-info-field">
                  <FileText size={15} />
                  <div>
                    <strong>Description :</strong>
                    <p>{appareil.description}</p>
                  </div>
                </div>
              )}
            </div>

            {appareil.user && (
              <div className="ag-info-section">
                <h3>Créateur</h3>
                <div className="ag-info-field">
                  <User size={15} />
                  <span>
                    <strong>Nom :</strong> {appareil.user.firstName}{" "}
                    {appareil.user.lastName}
                  </span>
                </div>
                {appareil.user.email && (
                  <div className="ag-info-field">
                    <Mail size={15} />
                    <span>
                      <strong>Email :</strong> {appareil.user.email}
                    </span>
                  </div>
                )}
                {appareil.user.phone && (
                  <div className="ag-info-field">
                    <Phone size={15} />
                    <span>
                      <strong>Tél :</strong> {appareil.user.phone}
                    </span>
                  </div>
                )}
                {appareil.user.companyType && (
                  <div className="ag-info-field">
                    <Building2 size={15} />
                    <span>
                      <strong>Entreprise :</strong> {appareil.user.companyType}
                    </span>
                  </div>
                )}
                {appareil.user.country && (
                  <div className="ag-info-field">
                    <MapPin size={15} />
                    <span>
                      <strong>Pays :</strong> {appareil.user.country}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
AppareilDetailModal.displayName = "AppareilDetailModal";

// --- Sidebar Filters ---
const FilterSidebar = React.memo(
  ({
    searchTerm,
    selectedCategory,
    selectedOption,
    onSearch,
    onCategory,
    onOption,
    onClear,
    total,
    filtered,
  }) => (
    <aside className="ag-sidebar">
      <div className="ag-sidebar-header">
        <SlidersHorizontal size={18} />
        <span>Filtres</span>
      </div>

      <div className="ag-filter-block">
        <label className="ag-filter-label">Recherche</label>
        <div className="ag-search-wrapper">
          <Search size={16} className="ag-search-icon" />
          <input
            type="text"
            placeholder="Nom, description..."
            value={searchTerm}
            onChange={onSearch}
            className="ag-search-input"
          />
          {searchTerm && (
            <button
              className="ag-search-clear"
              onClick={() => onSearch({ target: { value: "" } })}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="ag-filter-block">
        <label className="ag-filter-label">Catégorie</label>
        <select
          value={selectedCategory}
          onChange={onCategory}
          className="ag-filter-select"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ag-filter-block">
        <label className="ag-filter-label">Option</label>
        <select
          value={selectedOption}
          onChange={onOption}
          className="ag-filter-select"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {(searchTerm || selectedCategory || selectedOption) && (
        <button className="ag-clear-btn" onClick={onClear}>
          <X size={14} /> Effacer les filtres
        </button>
      )}

      <div className="ag-results-badge">
        <span className="ag-results-num">{filtered}</span>
        <span className="ag-results-label">/ {total} appareil(s)</span>
      </div>
    </aside>
  ),
);
FilterSidebar.displayName = "FilterSidebar";

// --- Main Component ---
const AppareilGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedAppareil, setSelectedAppareil] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    data: appareils = [],
    error,
    isLoading,
  } = useSWR("appareils-gallery", getAppareils, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 60000,
  });

  const filteredAppareils = useMemo(() => {
    return appareils.filter((a) => {
      const term = searchTerm.toLowerCase();
      return (
        (!searchTerm ||
          a.nom.toLowerCase().includes(term) ||
          a.description?.toLowerCase().includes(term)) &&
        (!selectedCategory || a.categorie === selectedCategory) &&
        (!selectedOption || a.options === selectedOption)
      );
    });
  }, [appareils, searchTerm, selectedCategory, selectedOption]);

  React.useEffect(() => {
    if (error) toast.error("Erreur lors de la récupération des appareils");
  }, [error]);

  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleCategory = useCallback(
    (e) => setSelectedCategory(e.target.value),
    [],
  );
  const handleOption = useCallback(
    (e) => setSelectedOption(e.target.value),
    [],
  );
  const handleViewDetails = useCallback(
    (appareil) => setSelectedAppareil(appareil),
    [],
  );
  const handleCloseDetails = useCallback(() => setSelectedAppareil(null), []);
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedOption("");
  }, []);

  return (
    <div className="ag-root">
      {/* Mobile filter toggle */}
      <button
        className="ag-mobile-filter-toggle"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        <SlidersHorizontal size={18} /> Filtres
        {(searchTerm || selectedCategory || selectedOption) && (
          <span className="ag-filter-dot" />
        )}
      </button>

      <div className={`ag-layout ${mobileSidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar */}
        <div
          className={`ag-sidebar-wrapper ${mobileSidebarOpen ? "open" : ""}`}
        >
          <FilterSidebar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedOption={selectedOption}
            onSearch={handleSearch}
            onCategory={handleCategory}
            onOption={handleOption}
            onClear={clearFilters}
            total={appareils.length}
            filtered={filteredAppareils.length}
          />
        </div>

        {/* Main content */}
        <main className="ag-main">
          <div className="ag-main-header">
            <div>
              <h1 className="ag-title">Galerie des Appareils</h1>
              <p className="ag-subtitle">Collection d'appareils dentaires</p>
            </div>
          </div>

          {isLoading ? (
            <div className="ag-loading">
              <div className="ag-spinner" />
              <p>Chargement...</p>
            </div>
          ) : filteredAppareils.length === 0 ? (
            <div className="ag-empty">
              <Settings size={56} />
              <h3>Aucun appareil trouvé</h3>
              <p>
                {searchTerm || selectedCategory || selectedOption
                  ? "Modifiez vos filtres."
                  : "Aucun appareil disponible."}
              </p>
            </div>
          ) : (
            <div className="ag-grid">
              {filteredAppareils.map((appareil) => (
                <AppareilCard
                  key={appareil.id}
                  appareil={appareil}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="ag-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {selectedAppareil && (
        <AppareilDetailModal
          appareil={selectedAppareil}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default AppareilGallery;
