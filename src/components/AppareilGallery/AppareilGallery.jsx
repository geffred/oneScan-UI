import React, { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import {
  Settings,
  Search,
  Filter,
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
} from "lucide-react";
import "./AppareilGallery.css";

// Enums pour les filtres
const CATEGORIES = [
  { value: "", label: "Toutes les catégories" },
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
  { value: "", label: "Toutes les options" },
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

// Fonction de fetch sans authentification pour les routes publiques
const fetchPublic = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonctions API
const getAppareils = async () => {
  return fetchPublic("/api/appareils");
};

// Composant Card d'appareil
const AppareilCard = React.memo(({ appareil, onViewDetails }) => {
  const thumbnailImage =
    appareil.images && appareil.images.length > 0
      ? `/api/images/${appareil.images[0].imagePath}`
      : null;

  const categoryLabel =
    CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
    appareil.categorie;
  const optionLabel =
    OPTIONS.find((o) => o.value === appareil.options)?.label ||
    appareil.options;

  return (
    <div className="appareil-card">
      <div className="appareil-card-image">
        {thumbnailImage ? (
          <img
            src={thumbnailImage}
            alt={appareil.nom}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="appareil-card-placeholder"
          style={{ display: thumbnailImage ? "none" : "flex" }}
        >
          <Settings size={32} />
          <span>Aucune image</span>
        </div>
        <div className="appareil-card-overlay">
          <button
            onClick={() => onViewDetails(appareil)}
            className="appareil-card-view-btn"
            title="Voir les détails"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className="appareil-card-content">
        <h3 className="appareil-card-title">{appareil.nom}</h3>

        <div className="appareil-card-meta">
          <div className="appareil-card-category">
            <Tag size={14} />
            <span>{categoryLabel}</span>
          </div>
          <div className="appareil-card-option">
            <Wrench size={14} />
            <span>{optionLabel}</span>
          </div>
        </div>

        {appareil.description && (
          <p className="appareil-card-description">
            {appareil.description.length > 100
              ? `${appareil.description.substring(0, 100)}...`
              : appareil.description}
          </p>
        )}

        <div className="appareil-card-footer">
          <div className="appareil-card-images-count">
            <ImageIcon size={14} />
            <span>{appareil.images?.length || 0} image(s)</span>
          </div>
          {appareil.user && (
            <div className="appareil-card-user">
              <User size={14} />
              <span>
                {appareil.user.firstName} {appareil.user.lastName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AppareilCard.displayName = "AppareilCard";

// Modal de détails
const AppareilDetailModal = React.memo(({ appareil, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  if (!appareil) return null;

  const handleImageError = (imageId) => {
    console.error(`Erreur de chargement d'image dans le modal:`, imageId);
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId) => {
    console.log(`Image chargée dans le modal:`, imageId);
  };

  // Afficher les informations de debug
  React.useEffect(() => {
    console.log("Modal ouvert pour appareil:", appareil);
    console.log("Images de l'appareil:", appareil.images);
  }, [appareil]);

  const categoryLabel =
    CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
    appareil.categorie;
  const optionLabel =
    OPTIONS.find((o) => o.value === appareil.options)?.label ||
    appareil.options;

  const nextImage = () => {
    if (appareil.images && appareil.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % appareil.images.length);
    }
  };

  const prevImage = () => {
    if (appareil.images && appareil.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + appareil.images.length) % appareil.images.length
      );
    }
  };

  return (
    <div className="appareil-detail-overlay">
      <div className="appareil-detail-modal">
        <div className="appareil-detail-header">
          <h2>{appareil.nom}</h2>
          <button onClick={onClose} className="appareil-detail-close">
            <X size={24} />
          </button>
        </div>

        <div className="appareil-detail-content">
          <div className="appareil-detail-images">
            {appareil.images && appareil.images.length > 0 ? (
              <div className="appareil-detail-image-viewer">
                <img
                  src={`/api/images/${appareil.images[currentImageIndex].imagePath}`}
                  alt={`${appareil.nom} - Image ${currentImageIndex + 1}`}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="appareil-detail-image-placeholder"
                  style={{ display: "none" }}
                >
                  <Settings size={64} />
                  <span>Image non disponible</span>
                </div>

                {appareil.images.length > 1 && (
                  <>
                    <button
                      className="appareil-detail-nav-btn prev"
                      onClick={prevImage}
                    >
                      ‹
                    </button>
                    <button
                      className="appareil-detail-nav-btn next"
                      onClick={nextImage}
                    >
                      ›
                    </button>
                    <div className="appareil-detail-image-counter">
                      {currentImageIndex + 1} / {appareil.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="appareil-detail-no-image">
                <Settings size={64} />
                <span>Aucune image disponible</span>
              </div>
            )}

            {appareil.images && appareil.images.length > 1 && (
              <div className="appareil-detail-thumbnails">
                {appareil.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={`/api/images/${image.imagePath}`}
                    alt={`Thumbnail ${index + 1}`}
                    className={`appareil-detail-thumbnail ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="appareil-detail-info">
            <div className="appareil-detail-section">
              <h3>Informations de l'appareil</h3>
              <div className="appareil-detail-field">
                <Tag size={16} />
                <span>
                  <strong>Catégorie:</strong> {categoryLabel}
                </span>
              </div>
              <div className="appareil-detail-field">
                <Wrench size={16} />
                <span>
                  <strong>Option:</strong> {optionLabel}
                </span>
              </div>
              {appareil.description && (
                <div className="appareil-detail-field">
                  <FileText size={16} />
                  <div>
                    <strong>Description:</strong>
                    <p>{appareil.description}</p>
                  </div>
                </div>
              )}
            </div>

            {appareil.user && (
              <div className="appareil-detail-section">
                <h3>Informations du créateur</h3>
                <div className="appareil-detail-field">
                  <User size={16} />
                  <span>
                    <strong>Nom:</strong> {appareil.user.firstName}{" "}
                    {appareil.user.lastName}
                  </span>
                </div>
                {appareil.user.email && (
                  <div className="appareil-detail-field">
                    <Mail size={16} />
                    <span>
                      <strong>Email:</strong> {appareil.user.email}
                    </span>
                  </div>
                )}
                {appareil.user.phone && (
                  <div className="appareil-detail-field">
                    <Phone size={16} />
                    <span>
                      <strong>Téléphone:</strong> {appareil.user.phone}
                    </span>
                  </div>
                )}
                {appareil.user.companyType && (
                  <div className="appareil-detail-field">
                    <Building2 size={16} />
                    <span>
                      <strong>Entreprise:</strong> {appareil.user.companyType}
                    </span>
                  </div>
                )}
                {appareil.user.country && (
                  <div className="appareil-detail-field">
                    <MapPin size={16} />
                    <span>
                      <strong>Pays:</strong> {appareil.user.country}
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

// Composant principal
const AppareilGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedAppareil, setSelectedAppareil] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // SWR hook pour récupérer les appareils (maintenant public)
  const {
    data: appareils = [],
    error,
    isLoading,
  } = useSWR("appareils-gallery", getAppareils, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 60000, // Rafraîchir toutes les minutes
    errorRetryCount: 3,
    errorRetryInterval: 1000,
  });

  // Filtrage des appareils
  const filteredAppareils = useMemo(() => {
    return appareils.filter((appareil) => {
      const matchesSearch =
        !searchTerm ||
        appareil.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appareil.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || appareil.categorie === selectedCategory;
      const matchesOption =
        !selectedOption || appareil.options === selectedOption;

      return matchesSearch && matchesCategory && matchesOption;
    });
  }, [appareils, searchTerm, selectedCategory, selectedOption]);

  // Gestion des erreurs
  React.useEffect(() => {
    if (error) {
      toast.error("Erreur lors de la récupération des appareils");
    }
  }, [error]);

  // Handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handleOptionChange = useCallback((e) => {
    setSelectedOption(e.target.value);
  }, []);

  const handleViewDetails = useCallback((appareil) => {
    setSelectedAppareil(appareil);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedAppareil(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedOption("");
  }, []);

  return (
    <div className="appareil-gallery">
      <div className="appareil-gallery-header">
        <h1>Galerie des Appareils</h1>
        <p>Découvrez notre collection d'appareils dentaires</p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="appareil-gallery-controls">
        <div className="appareil-gallery-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un appareil..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <button
          className="appareil-gallery-filter-toggle"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter size={18} />
          Filtres
        </button>
      </div>

      {/* Filtres */}
      <div className={`appareil-gallery-filters ${filtersOpen ? "open" : ""}`}>
        <div className="filter-group">
          <label>Catégorie</label>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Option</label>
          <select value={selectedOption} onChange={handleOptionChange}>
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Effacer les filtres
        </button>
      </div>

      {/* Résultats */}
      <div className="appareil-gallery-results">
        <p className="results-count">
          {filteredAppareils.length} appareil(s) trouvé(s)
        </p>
      </div>

      {/* Grille d'appareils */}
      <div className="appareil-gallery-content">
        {isLoading ? (
          <div className="appareil-gallery-loading">
            <div className="loading-spinner"></div>
            <p>Chargement des appareils...</p>
          </div>
        ) : filteredAppareils.length === 0 ? (
          <div className="appareil-gallery-empty">
            <Settings size={64} />
            <h3>Aucun appareil trouvé</h3>
            <p>
              {searchTerm || selectedCategory || selectedOption
                ? "Aucun appareil ne correspond à vos critères de recherche."
                : "Aucun appareil disponible pour le moment."}
            </p>
          </div>
        ) : (
          <div className="appareil-gallery-grid">
            {filteredAppareils.map((appareil) => (
              <AppareilCard
                key={appareil.id}
                appareil={appareil}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
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
