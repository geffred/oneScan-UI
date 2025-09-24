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
} from "lucide-react";
import { AuthContext } from "../Config/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Appareils.css";

// Enums
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

// ✅ URL backend depuis .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Schema de validation
const validationSchema = Yup.object({
  nom: Yup.string()
    .required("Le nom de l'appareil est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  categorie: Yup.string()
    .required("La catégorie est requise")
    .oneOf(
      CATEGORIES.map((c) => c.value),
      "Catégorie invalide"
    ),
  options: Yup.string()
    .required("Une option est requise")
    .oneOf(
      OPTIONS.map((o) => o.value),
      "Option invalide"
    ),
  description: Yup.string().max(
    500,
    "La description ne peut pas dépasser 500 caractères"
  ),
});

// Fonction de fetch sécurisée
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonctions API
const getAppareils = async () => {
  return fetchWithAuth(`${API_BASE_URL}/appareils`);
};

const getCurrentUser = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/auth/me`);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};

console.log("API_BASE_URL =", API_BASE_URL);

// Composant Upload d'images
const ImageUploadModal = React.memo(
  ({ isOpen, onClose, appareilId, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e) => {
      setSelectedFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) return;

      setIsUploading(true);
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();

        if (selectedFiles.length === 1) {
          formData.append("file", selectedFiles[0]);
          const response = await fetch(
            `${API_BASE_URL}/images/upload/${appareilId}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          if (!response.ok) throw new Error("Erreur lors de l'upload");
        } else {
          selectedFiles.forEach((file) => formData.append("files", file));
          const response = await fetch(
            `${API_BASE_URL}/images/upload-multiple/${appareilId}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          if (!response.ok) throw new Error("Erreur lors de l'upload multiple");
        }

        toast.success("Images uploadées avec succès");
        onUploadSuccess();
        onClose();
        setSelectedFiles([]);
      } catch (error) {
        toast.error(error.message || "Erreur lors de l'upload des images");
      } finally {
        setIsUploading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="appareil-modal-overlay">
        <div className="appareil-modal">
          <div className="appareil-modal-header">
            <h2>Upload d'images</h2>
            <button onClick={onClose} className="appareil-modal-close">
              <X size={24} />
            </button>
          </div>
          <div className="appareil-modal-form">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="appareil-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="appareil-cancel-btn"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? "Upload en cours..." : "Uploader"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// ✅ Composant principal
const Appareils = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingAppareil, setEditingAppareil] = useState(null);
  const [selectedAppareilForUpload, setSelectedAppareilForUpload] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: currentUser } = useSWR(
    isAuthenticated ? "currentUser" : null,
    getCurrentUser
  );
  const { data: appareils = [], mutate: mutateAppareils } = useSWR(
    isAuthenticated ? "appareils" : null,
    getAppareils
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      const url = editingAppareil
        ? `${API_BASE_URL}/appareils/${editingAppareil.id}`
        : `${API_BASE_URL}/appareils`;
      const method = editingAppareil ? "PUT" : "POST";

      const payload = { ...values, user: { id: currentUser.id } };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur ${method === "PUT" ? "modification" : "création"}`
        );
      }

      await mutateAppareils();
      setIsModalOpen(false);
      setEditingAppareil(null);
      resetForm();
      toast.success(
        `Appareil ${method === "PUT" ? "modifié" : "créé"} avec succès`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet appareil ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/appareils/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur suppression");
      mutateAppareils();
      toast.success("Appareil supprimé");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      {/* ... UI inchangé ... */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        appareilId={selectedAppareilForUpload?.id}
        onUploadSuccess={() => mutateAppareils()}
      />
    </div>
  );
};

export default Appareils;
