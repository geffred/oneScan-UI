/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useContext, useMemo, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { toast } from "react-toastify";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  FileText,
  Tag,
  Upload,
  Image,
  Eye,
  Wrench,
  TriangleAlert,
} from "lucide-react";
import { AuthContext } from "../Config/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Appareils.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://mysmilelab-api-production.up.railway.app/api";

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

const GROUPED_OPTIONS = [
  {
    label: "Disjoncteurs",
    options: [
      { value: "DISJONCTEUR_FRITTE", label: "Disjoncteur Fritté" },
      { value: "DISJONCTEUR_NON_FRITTE", label: "Disjoncteur Non Fritté" },
      { value: "DISJONCTEUR_MIXTE", label: "Disjoncteur Mixte" },
    ],
  },
  {
    label: "Tubes",
    options: [
      { value: "TUBES_SUR_16_ET_26", label: "Tubes sur 16 et 26" },
      { value: "TUBE_SUR_36_ET_46", label: "Tube sur 36 et 46" },
      { value: "AVEC_TUBE_SUR_LES_6", label: "Avec tube sur les 6" },
      { value: "SANS_TUBE_SUR_LES_6", label: "Sans tube sur les 6" },
      { value: "SANS_LES_TUBES_SUR_LES_6", label: "Sans les tubes sur les 6" },
      { value: "TUBES_26_ET_26", label: "Tubes 26 et 26" },
      {
        value: "TUBES_16_ET_26_PASTILLE_DE_NANCE",
        label: "Tubes 16 et 26 + Pastille de Nance",
      },
      { value: "TUBE_16_ET_16", label: "Tube 16 et 16" },
    ],
  },
  {
    label: "Bras",
    options: [
      { value: "BRAS_DE_DELAIRE", label: "Bras de Delaire" },
      { value: "TUBE_ET_BRAS_DE_DELAIRE", label: "Tube et Bras de Delaire" },
      {
        value: "BRAS_CREATION_ESPACE_33_ET_43",
        label: "Bras création espace 33 et 43",
      },
      { value: "BRAS_ANTERIEUR", label: "Bras Antérieur" },
      { value: "BRAS_DE_BANACH", label: "Bras de Banach" },
      { value: "BRAS_DE_TRACTION_CANINE", label: "Bras de traction canine" },
      {
        value: "INGRESSION_VIA_BRAS_EN_ACIER",
        label: "Ingression via bras en acier",
      },
    ],
  },
  {
    label: "Taquets & Smart Bands",
    options: [
      { value: "TAQUETS_SUR_LES_6", label: "Taquets sur les 6" },
      { value: "TAQUET", label: "Taquet" },
      { value: "TAQUET_VESTIBULAIRE", label: "Taquet Vestibulaire" },
      { value: "SMART_BANDS", label: "Smart Bands" },
    ],
  },
  {
    label: "Vérins",
    options: [
      { value: "VERIN_SUPERIEUR", label: "Vérin Supérieur" },
      { value: "VERIN_INFERIEUR", label: "Vérin Inférieur" },
    ],
  },
  {
    label: "Accessoires (Plaquettes, Pastilles)",
    options: [
      { value: "PLAQUETTES_SUR_14_ET_24", label: "Plaquettes sur 14 et 24" },
      { value: "PASTILLE_DE_NANCE", label: "Pastille de Nance" },
    ],
  },
  {
    label: "Bagues",
    options: [
      { value: "BAGUES_STANDARD", label: "Bagues Standard" },
      { value: "BAGUES_DIRECT", label: "Bagues Direct" },
      { value: "BAGUES", label: "Bagues" },
    ],
  },
  {
    label: "Tubes Standards/Directs",
    options: [
      {
        value: "TUBE_DE_16_ET_26_STANDARD",
        label: "Tube de 16 et 26 Standard",
      },
      { value: "TUBES_16_ET_26_DIRECT", label: "Tubes 16 et 26 Direct" },
      { value: "BRAS_DE_DELAIRE_STANDARD", label: "Bras de Delaire Standard" },
      { value: "BRAS_DE_DELAIRE_DIRECT", label: "Bras de Delaire Direct" },
      {
        value: "TUBE_ET_BRAS_DE_DELAIRE_STANDARD",
        label: "Tube et Bras de Delaire Standard",
      },
      {
        value: "TUBE_ET_BRAS_DE_DELAIRE_DIRECT",
        label: "Tube et Bras de Delaire Direct",
      },
      {
        value: "TAQUET_VESTIBULAIRE_STANDARD",
        label: "Taquet Vestibulaire Standard",
      },
      {
        value: "TAQUET_VESTIBULAIRE_DIRECT",
        label: "Taquet Vestibulaire Direct",
      },
    ],
  },
  {
    label: "Système Benefit & Vis",
    options: [
      {
        value: "BENEFIT_STANDARD_VERIN_STANDARD",
        label: "Benefit Standard (Vérin Standard)",
      },
      {
        value: "BENEFIT_DIRECT_VERIN_DIRECT",
        label: "Benefit Direct (Vérin Direct)",
      },
      {
        value: "BENEFIT_DIRECT_VERIN_STANDARD",
        label: "Benefit Direct (Vérin Standard)",
      },
      { value: "ATP_BENEFIT", label: "ATP Benefit" },
      { value: "ATP_BANACH_BENEFIT", label: "ATP Banach Benefit" },
      { value: "PENDULUM_BENEFIT", label: "Pendulum Benefit" },
      { value: "AUTRE_VIS_STANDARD", label: "Autre Vis Standard" },
      {
        value: "POWER_SCREW_BENEFIT_STANDARD",
        label: "Power Screw Benefit Standard",
      },
      {
        value: "POWER_SCREW_BENEFIT_DIRECT",
        label: "Power Screw Benefit Direct",
      },
      {
        value: "POWER_SCREW_ET_AUTRES_VIS",
        label: "Power Screw et autres vis",
      },
    ],
  },
  {
    label: "Mouvements & Autres",
    options: [
      { value: "REDRESSEMENT_MOLAIRE", label: "Redressement Molaire" },
      { value: "ANCRAGE_INCISIF", label: "Ancrage Incisif" },
      {
        value: "INGRESSION_VIA_DES_POWER_CHAINS",
        label: "Ingression via des Power Chains",
      },
      { value: "RECUL_SUR_LEAF_EXPANDER", label: "Recul sur Leaf Expander" },
      {
        value: "RECUL_SUR_LEAF_SELF_EXPANDER",
        label: "Recul sur Leaf Self Expander",
      },
      { value: "ARNOUDIZER", label: "Arnoudizer" },
      { value: "AUCUN", label: "Aucune option" },
    ],
  },
];

const FLATTENED_OPTIONS = GROUPED_OPTIONS.reduce(
  (acc, group) => [...acc, ...group.options],
  [],
);

// Hors composant → pas de recréation à chaque render
const validationSchema = Yup.object({
  nom: Yup.string()
    .required("Le nom de l'appareil est requis")
    .max(100, "Max 100 caractères"),
  categorie: Yup.string()
    .required("La catégorie est requise")
    .oneOf(
      CATEGORIES.map((c) => c.value),
      "Catégorie invalide",
    ),
  options: Yup.string()
    .required("Une option est requise")
    .oneOf(
      FLATTENED_OPTIONS.map((o) => o.value),
      "Option invalide",
    ),
  description: Yup.string().max(500, "Max 500 caractères"),
});

const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  return response.json();
};

const getAppareils = () => fetchWithAuth(`${API_BASE_URL}/appareils`);
const getImagesByAppareil = (id) =>
  fetchWithAuth(`${API_BASE_URL}/images/appareil/${id}`);
const getCurrentUser = () => fetchWithAuth(`${API_BASE_URL}/auth/me`);

// --- Modal de confirmation ---
const ConfirmModal = ({ config, onConfirm, onCancel }) => {
  if (!config) return null;
  return (
    <div className="appareil-modal-overlay">
      <div className="appareil-confirm-modal">
        <div className="appareil-confirm-icon">
          <TriangleAlert size={28} />
        </div>
        <h3>{config.title}</h3>
        <p>{config.message}</p>
        <div className="appareil-confirm-actions">
          <button onClick={onCancel} className="appareil-cancel-btn">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`appareil-confirm-btn ${config.danger ? "danger" : ""}`}
          >
            {config.confirmLabel || "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Ligne tableau ---
const AppareilRow = React.memo(
  ({ appareil, onEdit, onDelete, onViewImages }) => (
    <div className="appareil-table-row">
      <div className="appareil-table-cell" data-label="Nom de l'Appareil">
        <div className="appareil-name-info">
          <Settings size={18} className="appareil-icon" />
          <span className="appareil-name">{appareil.nom}</span>
        </div>
      </div>
      <div className="appareil-table-cell" data-label="Catégorie">
        <div className="appareil-category-info">
          <Tag size={16} className="appareil-info-icon" />
          <span>
            {CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
              appareil.categorie}
          </span>
        </div>
      </div>
      <div className="appareil-table-cell" data-label="Option">
        <div className="appareil-option-info">
          <Wrench size={16} className="appareil-info-icon" />
          <span>
            {FLATTENED_OPTIONS.find((o) => o.value === appareil.options)
              ?.label || appareil.options}
          </span>
        </div>
      </div>
      <div className="appareil-table-cell" data-label="Description">
        <div className="appareil-description-info">
          <FileText size={16} className="appareil-info-icon" />
          <span>{appareil.description || "Aucune description"}</span>
        </div>
      </div>
      <div className="appareil-table-cell" data-label="Images">
        <div className="appareil-images-info">
          <Image size={16} className="appareil-info-icon" />
          <span>{appareil.images?.length || 0} image(s)</span>
        </div>
      </div>
      <div className="appareil-table-cell actions">
        <div className="appareil-actions">
          <button
            onClick={() => onViewImages(appareil)}
            className="appareil-view-btn"
            title="Gérer les images"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(appareil)}
            className="appareil-edit-btn"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(appareil)}
            className="appareil-delete-btn"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  ),
);
AppareilRow.displayName = "AppareilRow";

const EmptyState = React.memo(({ searchTerm }) => (
  <div className="appareil-empty-state">
    <Settings size={48} />
    <h3>Aucun appareil trouvé</h3>
    <p>
      {searchTerm
        ? "Aucun appareil ne correspond à votre recherche."
        : "Commencez par ajouter votre premier appareil."}
    </p>
  </div>
));
EmptyState.displayName = "EmptyState";

// --- Modal gestion images ---
const ImageManagementModal = React.memo(
  ({ isOpen, onClose, appareil, onImagesUpdate }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const loadImages = useCallback(async () => {
      if (!appareil?.id) return;
      setIsLoadingImages(true);
      try {
        const data = await getImagesByAppareil(appareil.id);
        setImages(data);
      } catch {
        toast.error("Erreur lors du chargement des images");
      } finally {
        setIsLoadingImages(false);
      }
    }, [appareil?.id]);

    React.useEffect(() => {
      if (isOpen && appareil?.id) loadImages();
    }, [isOpen, appareil?.id, loadImages]);

    const handleUpload = async () => {
      if (selectedFiles.length === 0) {
        toast.warning("Sélectionnez au moins une image");
        return;
      }
      setIsUploading(true);
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        const isSingle = selectedFiles.length === 1;
        const endpoint = isSingle
          ? `${API_BASE_URL}/images/upload/${appareil.id}`
          : `${API_BASE_URL}/images/upload-multiple/${appareil.id}`;

        selectedFiles.forEach((file) =>
          formData.append(isSingle ? "file" : "files", file),
        );

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok)
          throw new Error((await response.text()) || "Erreur upload");

        toast.success(
          isSingle
            ? "Image uploadée avec succès"
            : `${selectedFiles.length} images uploadées`,
        );
        setSelectedFiles([]);
        await loadImages();
        onImagesUpdate();
      } catch (err) {
        toast.error(err.message || "Erreur lors de l'upload");
      } finally {
        setIsUploading(false);
      }
    };

    const handleDeleteImage = (image) => {
      setConfirmConfig({
        title: "Supprimer l'image",
        message:
          "Voulez-vous vraiment supprimer cette image de Cloudinary ? Cette action est définitive.",
        confirmLabel: "Supprimer",
        danger: true,
        onConfirm: () => executeDeleteImage(image.id),
      });
    };

    const executeDeleteImage = async (imageId) => {
      setConfirmConfig(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error((await response.text()) || "Erreur suppression");
        toast.success("Image supprimée avec succès");
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        onImagesUpdate();
      } catch (err) {
        toast.error(err.message || "Erreur lors de la suppression");
      }
    };

    if (!isOpen) return null;

    return (
      <>
        <div className="appareil-modal-overlay">
          <div className="appareil-modal" style={{ maxWidth: "800px" }}>
            <div className="appareil-modal-header">
              <h2>Gestion des images — {appareil?.nom}</h2>
              <button onClick={onClose} className="appareil-modal-close">
                <X size={24} />
              </button>
            </div>
            <div className="appareil-modal-form">
              <div className="appareil-upload-section">
                <h3>Ajouter des images</h3>
                <div className="appareil-upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFiles(Array.from(e.target.files))
                    }
                    className="appareil-file-input"
                  />
                  <Upload size={32} />
                  <p>Sélectionnez une ou plusieurs images</p>
                </div>
                {selectedFiles.length > 0 && (
                  <>
                    <div className="appareil-selected-files">
                      <h4>Fichiers sélectionnés :</h4>
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="appareil-selected-file">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </div>
                      ))}
                    </div>
                    <div className="appareil-upload-actions">
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="appareil-save-btn"
                      >
                        {isUploading ? "Upload en cours..." : "Uploader"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="appareil-existing-images-section">
                <h3>Images existantes ({images.length})</h3>
                {isLoadingImages ? (
                  <div className="appareil-images-loading">
                    <div className="appareil-loading-spinner" />
                    <p>Chargement...</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="appareil-no-images">
                    <Image size={48} />
                    <p>Aucune image</p>
                  </div>
                ) : (
                  <div className="appareil-images-grid">
                    {images.map((image) => (
                      <div key={image.id} className="appareil-image-item">
                        <div className="appareil-image-container">
                          <img
                            src={image.imagePath}
                            alt={`Image de ${appareil?.nom}`}
                            className="appareil-image-preview"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3C/svg%3E";
                            }}
                          />
                          <button
                            onClick={() => handleDeleteImage(image)}
                            className="appareil-image-delete-btn"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="appareil-image-info">
                          <span
                            className="appareil-image-name"
                            title={image.imagePath}
                          >
                            {image.imagePath.split("/").pop().substring(0, 30)}
                            ...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="appareil-modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="appareil-cancel-btn"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          config={confirmConfig}
          onConfirm={confirmConfig?.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      </>
    );
  },
);
ImageManagementModal.displayName = "ImageManagementModal";

// --- Composant principal ---
const Appareils = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingAppareil, setEditingAppareil] = useState(null);
  const [selectedAppareilForImages, setSelectedAppareilForImages] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmConfig, setConfirmConfig] = useState(null);

  const {
    data: currentUser,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "currentUser" : null, getCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });

  const {
    data: appareils = [],
    error: appareilsError,
    isLoading: appareilsLoading,
    mutate: mutateAppareils,
  } = useSWR(isAuthenticated ? "appareils" : null, getAppareils, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    errorRetryCount: 3,
  });

  const filteredAppareils = useMemo(() => {
    if (!searchTerm) return appareils;
    const term = searchTerm.toLowerCase();
    return appareils.filter(
      (a) =>
        a.nom.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term) ||
        CATEGORIES.find((c) => c.value === a.categorie)
          ?.label.toLowerCase()
          .includes(term) ||
        FLATTENED_OPTIONS.find((o) => o.value === a.options)
          ?.label.toLowerCase()
          .includes(term),
    );
  }, [appareils, searchTerm]);

  React.useEffect(() => {
    if (appareilsError)
      toast.error("Erreur lors de la récupération des appareils");
    if (userError)
      toast.error("Erreur lors de la récupération de l'utilisateur");
  }, [appareilsError, userError]);

  React.useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        if (!currentUser?.id)
          throw new Error("Informations utilisateur non disponibles");
        const token = localStorage.getItem("token");
        const url = editingAppareil
          ? `${API_BASE_URL}/appareils/${editingAppareil.id}`
          : `${API_BASE_URL}/appareils`;
        const method = editingAppareil ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, user: { id: currentUser.id } }),
        });
        if (!response.ok)
          throw new Error((await response.text()) || "Erreur enregistrement");
        const data = await response.json();

        if (editingAppareil) {
          mutateAppareils(
            appareils.map((a) => (a.id === data.id ? data : a)),
            false,
          );
          toast.success("Appareil modifié avec succès");
        } else {
          mutateAppareils([...appareils, data], false);
          toast.success("Appareil créé avec succès");
        }
        setIsModalOpen(false);
        setEditingAppareil(null);
        resetForm();
        mutateAppareils();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [editingAppareil, appareils, mutateAppareils, currentUser],
  );

  const handleDelete = useCallback((appareil) => {
    setConfirmConfig({
      title: "Supprimer l'appareil",
      message: `Voulez-vous vraiment supprimer "${appareil.nom}" ? Cette action est définitive.`,
      confirmLabel: "Supprimer",
      danger: true,
      onConfirm: () => executeDelete(appareil.id),
    });
  }, []);

  const executeDelete = useCallback(
    async (id) => {
      setConfirmConfig(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/appareils/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erreur lors de la suppression");
        mutateAppareils(
          appareils.filter((a) => a.id !== id),
          false,
        );
        toast.success("Appareil supprimé avec succès");
        mutateAppareils();
      } catch (err) {
        toast.error(err.message);
        mutateAppareils();
      }
    },
    [appareils, mutateAppareils],
  );

  const openCreateModal = useCallback(() => {
    if (userLoading) {
      toast.warning("Chargement en cours...");
      return;
    }
    if (!currentUser?.id) {
      toast.error("Impossible de récupérer l'utilisateur. Reconnectez-vous.");
      return;
    }
    setEditingAppareil(null);
    setIsModalOpen(true);
  }, [currentUser, userLoading]);

  const handleEdit = useCallback((appareil) => {
    setEditingAppareil(appareil);
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAppareil(null);
  }, []);
  const handleManageImages = useCallback((appareil) => {
    setSelectedAppareilForImages(appareil);
    setIsImageModalOpen(true);
  }, []);
  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
    setSelectedAppareilForImages(null);
  }, []);
  const handleImagesUpdate = useCallback(
    () => mutateAppareils(),
    [mutateAppareils],
  );

  if (!isAuthenticated) return null;

  const isLoading = userLoading || appareilsLoading;

  return (
    <div className="appareil-main-wrapper">
      <div className="appareil-content-container">
        <div className="appareil-management-card">
          <div className="appareil-management-header">
            <h1 className="appareil-management-title">
              <div className="appareil-management-icon">
                <Settings size={24} />
              </div>
              Gestion des Appareils
              {currentUser && (
                <span className="appareil-user-info">
                  — {currentUser.firstName} {currentUser.lastName}
                </span>
              )}
            </h1>
            <button
              onClick={openCreateModal}
              className="appareil-create-btn"
              disabled={userLoading}
            >
              <Plus size={18} />
              {userLoading ? "Chargement..." : "Ajouter un appareil"}
            </button>
          </div>

          <div className="appareil-search-section">
            <div className="appareil-search-wrapper">
              <Search className="appareil-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un appareil..."
                className="appareil-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="appareil-list-container">
            {isLoading ? (
              <div className="appareil-list-loading">
                <div className="appareil-loading-spinner" />
                <p>Chargement des appareils...</p>
              </div>
            ) : filteredAppareils.length === 0 ? (
              <EmptyState searchTerm={searchTerm} />
            ) : (
              <div className="appareil-table-container">
                <div className="appareil-table-header">
                  <div className="appareil-table-cell header">Nom</div>
                  <div className="appareil-table-cell header">Catégorie</div>
                  <div className="appareil-table-cell header">Option</div>
                  <div className="appareil-table-cell header">Description</div>
                  <div className="appareil-table-cell header">Images</div>
                  <div className="appareil-table-cell header actions">
                    Actions
                  </div>
                </div>
                <div className="appareil-table-body">
                  {filteredAppareils.map((appareil) => (
                    <AppareilRow
                      key={appareil.id}
                      appareil={appareil}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewImages={handleManageImages}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="appareil-modal-overlay">
          <div className="appareil-modal">
            <div className="appareil-modal-header">
              <h2>
                {editingAppareil
                  ? "Modifier l'appareil"
                  : "Ajouter un appareil"}
              </h2>
              <button onClick={closeModal} className="appareil-modal-close">
                <X size={24} />
              </button>
            </div>
            <Formik
              initialValues={{
                nom: editingAppareil?.nom || "",
                categorie: editingAppareil?.categorie || "",
                options: editingAppareil?.options || "",
                description: editingAppareil?.description || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="appareil-modal-form">
                  <div className="appareil-form-fields">
                    <div className="appareil-input-group">
                      <label className="appareil-field-label">Nom *</label>
                      <div className="appareil-input-wrapper">
                        <Settings className="appareil-input-icon" />
                        <Field
                          name="nom"
                          type="text"
                          className="appareil-text-input"
                          placeholder="Nom de l'appareil"
                        />
                      </div>
                      <ErrorMessage
                        name="nom"
                        component="div"
                        className="appareil-error-message"
                      />
                    </div>

                    <div className="appareil-input-group">
                      <label className="appareil-field-label">
                        Catégorie *
                      </label>
                      <div className="appareil-input-wrapper">
                        <Tag className="appareil-input-icon" />
                        <Field
                          as="select"
                          name="categorie"
                          className="appareil-select-input"
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="categorie"
                        component="div"
                        className="appareil-error-message"
                      />
                    </div>

                    <div className="appareil-input-group">
                      <label className="appareil-field-label">Option *</label>
                      <div className="appareil-input-wrapper">
                        <Wrench className="appareil-input-icon" />
                        <Field
                          as="select"
                          name="options"
                          className="appareil-select-input"
                        >
                          <option value="">Sélectionnez une option</option>
                          {GROUPED_OPTIONS.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="options"
                        component="div"
                        className="appareil-error-message"
                      />
                    </div>

                    <div className="appareil-input-group">
                      <label className="appareil-field-label">
                        Description
                      </label>
                      <div className="appareil-input-wrapper">
                        <FileText className="appareil-input-icon" />
                        <Field
                          as="textarea"
                          name="description"
                          className="appareil-textarea-input"
                          placeholder="Description"
                          rows={3}
                        />
                      </div>
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="appareil-error-message"
                      />
                    </div>
                  </div>

                  <div className="appareil-modal-actions">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="appareil-cancel-btn"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !currentUser?.id}
                      className="appareil-save-btn"
                    >
                      {isSubmitting ? (
                        <div className="appareil-loading-container">
                          <div className="appareil-loading-spinner" />
                          {editingAppareil ? "Modification..." : "Création..."}
                        </div>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingAppareil ? "Modifier" : "Créer"}
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      <ImageManagementModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        appareil={selectedAppareilForImages}
        onImagesUpdate={handleImagesUpdate}
      />

      <ConfirmModal
        config={confirmConfig}
        onConfirm={confirmConfig?.onConfirm}
        onCancel={() => setConfirmConfig(null)}
      />
    </div>
  );
};

export default Appareils;
