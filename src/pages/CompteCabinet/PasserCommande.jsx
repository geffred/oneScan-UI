import React, { useState, useCallback, useContext, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { toast } from "react-toastify";
import JSZip from "jszip";
import {
  Upload,
  FileText,
  User,
  Package,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Tag,
  Wrench,
  Trash2,
  Archive,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiGet } from "../../components/Config/apiUtils";
import { AuthContext } from "../../components/Config/AuthContext";
import "./PasserCommande.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetcher pour SWR
const fetcher = (url) => apiGet(url);

// Catégories et options d'appareils
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

// Schema de validation
const validationSchema = Yup.object({
  refPatient: Yup.string()
    .required("La référence patient est requise")
    .max(100, "Maximum 100 caractères"),
  categorie: Yup.string().required("La catégorie est requise"),
  option: Yup.string().required("L'option est requise"),
  commentaire: Yup.string().max(1000, "Maximum 1000 caractères"),
  dateEcheance: Yup.date()
    .min(new Date(), "La date d'échéance doit être dans le futur")
    .required("La date d'échéance est requise"),
});

const PasserCommande = ({ onCommandeCreated, onError, onSuccess }) => {
  const { userData } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAppareilsList, setShowAppareilsList] = useState(true);
  const [filters, setFilters] = useState({
    categorie: "",
    option: "",
    disponibilite: "all",
  });

  // Récupérer les appareils
  const { data: appareils = [], isLoading: loadingAppareils } = useSWR(
    "/appareils",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Filtrer les appareils par catégorie et option
  const filteredAppareils = useMemo(() => {
    return appareils.filter((app) => {
      const matchCategorie =
        !selectedCategorie || app.categorie === selectedCategorie;
      const matchOption = !selectedOption || app.options === selectedOption;
      return matchCategorie && matchOption;
    });
  }, [appareils, selectedCategorie, selectedOption]);

  // Filtrer et rechercher les appareils pour la liste
  const filteredAndSearchedAppareils = useMemo(() => {
    let result = appareils;

    // Appliquer les filtres
    if (filters.categorie) {
      result = result.filter((app) => app.categorie === filters.categorie);
    }
    if (filters.option) {
      result = result.filter((app) => app.options === filters.option);
    }
    if (filters.disponibilite === "available") {
      result = result.filter((app) => app.disponible);
    } else if (filters.disponibilite === "unavailable") {
      result = result.filter((app) => !app.disponible);
    }

    // Appliquer la recherche
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

  // Compresser les fichiers en ZIP
  const compressFilesToZip = async (files) => {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipFileName = `commande_${timestamp}.zip`;

    files.forEach((file) => {
      zip.file(file.name, file);
    });

    const zipContent = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    return new File([zipContent], zipFileName, {
      type: "application/zip",
      lastModified: new Date().getTime(),
    });
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const isValidExtension = ["stl", "zip", "obj", "3mf", "ply"].includes(
        extension
      );
      const isValidSize = file.size <= 500 * 1024 * 1024;

      return isValidExtension && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.warning(
        "Seuls les fichiers .stl, .zip, .obj, .3mf, .ply (max 500MB) sont acceptés"
      );
    }

    setSelectedFiles(validFiles);
  }, []);

  // Upload des fichiers compressés sur Google Drive
  const handleUploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Veuillez sélectionner au moins un fichier");
      return;
    }

    if (!userData?.nom) {
      toast.error("Informations du cabinet manquantes");
      return;
    }

    setIsUploading(true);
    setIsCompressing(true);
    setUploadProgress(0);

    try {
      let filesToUpload = selectedFiles;
      const stlFiles = selectedFiles.filter(
        (file) =>
          file.name.toLowerCase().endsWith(".stl") ||
          file.name.toLowerCase().endsWith(".obj") ||
          file.name.toLowerCase().endsWith(".3mf") ||
          file.name.toLowerCase().endsWith(".ply")
      );

      const zipFiles = selectedFiles.filter((file) =>
        file.name.toLowerCase().endsWith(".zip")
      );

      if (stlFiles.length > 1 || (stlFiles.length > 0 && zipFiles.length > 0)) {
        const zipFile = await compressFilesToZip(selectedFiles);
        filesToUpload = [zipFile];
        toast.info("Compression des fichiers en cours...");
      } else if (stlFiles.length === 1 && zipFiles.length === 0) {
        const zipFile = await compressFilesToZip(selectedFiles);
        filesToUpload = [zipFile];
        toast.info("Compression du fichier en cours...");
      }

      setIsCompressing(false);
      setUploadProgress(10);

      const token = localStorage.getItem("token");
      const newFiles = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setCurrentUploadFile(file.name);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("cabinetName", userData.nom);
        formData.append("commandeRef", `cmd_${Date.now()}`);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            const globalProgress = 10 + (progress * 90) / filesToUpload.length;
            setUploadProgress(Math.min(globalProgress, 99));
          }
        });

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  resolve(result);
                } catch (error) {
                  reject(new Error("Erreur lors du parsing de la réponse"));
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(
                    new Error(errorData.error || "Erreur lors de l'upload")
                  );
                } catch {
                  reject(new Error("Erreur lors de l'upload"));
                }
              }
            }
          };

          xhr.open("POST", `${API_BASE_URL}/files/upload-command`);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.send(formData);
        });

        const result = await uploadPromise;

        newFiles.push({
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileViewUrl: result.fileViewUrl,
          fileId: result.fileId,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
          isCompressed: filesToUpload.length < selectedFiles.length,
        });

        setUploadProgress(10 + ((i + 1) * 90) / filesToUpload.length);
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setSelectedFiles([]);
      setUploadProgress(100);
      setCurrentUploadFile("");

      if (filesToUpload.length < selectedFiles.length) {
        toast.success(
          `${selectedFiles.length} fichier(s) compressés et uploadés avec succès sur Google Drive`
        );
      } else {
        toast.success(
          `${newFiles.length} fichier(s) uploadé(s) avec succès sur Google Drive`
        );
      }

      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error("Erreur upload:", error);
      const errorMessage =
        error.message ||
        "Erreur lors de l'upload des fichiers sur Google Drive";
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
      setUploadProgress(0);
      setCurrentUploadFile("");
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
    }
  }, [selectedFiles, userData, onError]);

  // Supprimer un fichier uploadé
  const handleRemoveFile = useCallback(async (index, fileId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("Fichier supprimé avec succès de Google Drive");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression du fichier");
    }
  }, []);

  // Visualiser un fichier dans Google Drive
  const handleViewFile = useCallback((fileViewUrl, fileId) => {
    if (fileViewUrl) {
      window.open(fileViewUrl, "_blank");
    } else if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
    }
  }, []);

  // Soumettre la commande
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (uploadedFiles.length === 0) {
      toast.error("Veuillez uploader au moins un fichier");
      setSubmitting(false);
      return;
    }

    if (!userData?.id) {
      toast.error("Informations du cabinet manquantes");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Trouver l'appareil sélectionné
      const selectedAppareil = appareils.find(
        (app) =>
          app.categorie === values.categorie && app.options === values.option
      );

      const commandeData = {
        cabinetId: userData.id,
        cabinetName: userData.nom,
        refPatient: values.refPatient.trim(),
        typeAppareil: selectedAppareil
          ? selectedAppareil.nom
          : `${values.categorie} - ${values.option}`,
        commentaire: values.commentaire?.trim() || "",
        details: selectedAppareil?.description || "",
        fichierUrls: uploadedFiles.map((f) => f.fileUrl),
        fichierPublicIds: uploadedFiles.map((f) => f.fileId),
        adresseDeLivraison: userData.adresseDeLivraison || "",
        adresseDeFacturation: userData.adresseDeFacturation || "",
        dateEcheance: values.dateEcheance, // Ajout de la date d'échéance
      };

      // Créer la commande
      const response = await fetch(`${API_BASE_URL}/public/commandes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commandeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la commande"
        );
      }

      const result = await response.json();

      if (result.success) {
        // Envoyer l'email de notification
        await sendEmailNotification(result.commande, userData);

        toast.success("Commande créée avec succès !");
        if (onSuccess) onSuccess("Commande créée avec succès");
        if (onCommandeCreated) onCommandeCreated(result.commande);

        // Réinitialiser le formulaire
        resetForm();
        setUploadedFiles([]);
        setSelectedFiles([]);
        setSelectedCategorie("");
        setSelectedOption("");
      } else {
        throw new Error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création commande:", error);
      const errorMessage =
        error.message || "Erreur lors de la création de la commande";
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour envoyer l'email de notification
  const sendEmailNotification = async (commande, cabinet) => {
    try {
      const token = localStorage.getItem("token");

      const emailData = {
        to: "laboratoire@mysmilelab.be", // Email du laboratoire
        subject: `Nouvelle commande - ${commande.refPatient}`,
        template: "commande_notification",
        data: {
          commandeId: commande.externalId || commande.id,
          refPatient: commande.refPatient,
          cabinetName: cabinet.nom,
          cabinetEmail: cabinet.email,
          typeAppareil: commande.typeAppareil,
          dateEcheance: commande.dateEcheance,
          commentaire: commande.commentaire,
          adresseLivraison: commande.adresseDeLivraison,
          dateCreation: new Date().toLocaleDateString("fr-FR"),
          nombreFichiers: uploadedFiles.length,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/api/email/send-commande-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(emailData),
        }
      );

      if (response.ok) {
        toast.success("Email de notification envoyé au laboratoire");
      } else {
        console.warn(
          "Échec de l'envoi de l'email, mais la commande a été créée"
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      // Ne pas bloquer la création de la commande en cas d'erreur d'email
    }
  };

  // Réinitialiser la sélection
  const handleResetSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Formater la date pour l'input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculer la date minimum (demain)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  if (!userData) {
    return (
      <div className="passer-commande-loading">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-bar-fill indeterminate"></div>
          </div>
        </div>
        <p>Chargement des informations du cabinet...</p>
      </div>
    );
  }

  return (
    <div className="passer-commande-container">
      <div className="passer-commande-header">
        <h1>
          <Package size={32} />
          Passer une Nouvelle Commande
        </h1>
        <p>
          Remplissez le formulaire et uploadez vos fichiers 3D (automatiquement
          compressés et stockés sur Google Drive)
        </p>
      </div>

      <div className="commande-content">
        <div className="commande-left-panel">
          {/* Liste des appareils disponibles */}
          <div className="appareils-list-section">
            <div className="section-header">
              <h2>
                <Package size={20} />
                Appareils Disponibles
              </h2>
              <button
                className="toggle-list-btn"
                onClick={() => setShowAppareilsList(!showAppareilsList)}
              >
                {showAppareilsList ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {showAppareilsList && (
              <>
                <div className="search-filter-container">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher un appareil..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="filter-section">
                    <div className="filter-group">
                      <label>
                        <Filter size={14} />
                        Catégorie
                      </label>
                      <select
                        value={filters.categorie}
                        onChange={(e) =>
                          setFilters({ ...filters, categorie: e.target.value })
                        }
                        className="filter-select"
                      >
                        <option value="">Toutes</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>
                        <Filter size={14} />
                        Option
                      </label>
                      <select
                        value={filters.option}
                        onChange={(e) =>
                          setFilters({ ...filters, option: e.target.value })
                        }
                        className="filter-select"
                      >
                        <option value="">Toutes</option>
                        {OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>
                        <Filter size={14} />
                        Disponibilité
                      </label>
                      <select
                        value={filters.disponibilite}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            disponibilite: e.target.value,
                          })
                        }
                        className="filter-select"
                      >
                        <option value="all">Tous</option>
                        <option value="available">Disponibles</option>
                        <option value="unavailable">Indisponibles</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="appareils-grid-container">
                  {loadingAppareils ? (
                    <div className="loading-appareils">
                      <div className="progress-bar-container small">
                        <div className="progress-bar">
                          <div className="progress-bar-fill indeterminate"></div>
                        </div>
                      </div>
                      <span>Chargement des appareils...</span>
                    </div>
                  ) : filteredAndSearchedAppareils.length > 0 ? (
                    <div className="appareils-grid">
                      {filteredAndSearchedAppareils.map((appareil) => (
                        <div
                          key={appareil.id}
                          className={`appareil-card ${
                            !appareil.disponible ? "unavailable" : ""
                          }`}
                          onClick={() => {
                            if (appareil.disponible) {
                              setSelectedCategorie(appareil.categorie);
                              setSelectedOption(appareil.options);
                            }
                          }}
                        >
                          <div className="appareil-card-header">
                            <h3>{appareil.nom}</h3>
                            <span
                              className={`disponibility-badge ${
                                appareil.disponible
                                  ? "available"
                                  : "unavailable"
                              }`}
                            >
                              {appareil.disponible
                                ? "Disponible"
                                : "Indisponible"}
                            </span>
                          </div>
                          <div className="appareil-card-body">
                            <div className="appareil-info">
                              <div className="info-row">
                                <strong>Catégorie:</strong>
                                <span>
                                  {CATEGORIES.find(
                                    (c) => c.value === appareil.categorie
                                  )?.label || appareil.categorie}
                                </span>
                              </div>
                              <div className="info-row">
                                <strong>Option:</strong>
                                <span>
                                  {OPTIONS.find(
                                    (o) => o.value === appareil.options
                                  )?.label || appareil.options}
                                </span>
                              </div>
                              {appareil.description && (
                                <div className="info-row description">
                                  <strong>Description:</strong>
                                  <p>{appareil.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="appareil-card-footer">
                            <button
                              className="select-appareil-btn"
                              disabled={!appareil.disponible}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (appareil.disponible) {
                                  setSelectedCategorie(appareil.categorie);
                                  setSelectedOption(appareil.options);
                                }
                              }}
                            >
                              Sélectionner
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-appareil">
                      <AlertCircle size={24} />
                      <p>Aucun appareil trouvé avec ces critères</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="commande-right-panel">
          <Formik
            initialValues={{
              refPatient: "",
              categorie: "",
              option: "",
              commentaire: "",
              dateEcheance: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue, resetForm }) => (
              <Form className="passer-commande-form">
                {/* Section 1: Informations Patient */}
                <div className="form-section">
                  <h2>
                    <User size={20} />
                    Informations Patient
                  </h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="refPatient">Référence Patient *</label>
                      <Field
                        id="refPatient"
                        name="refPatient"
                        type="text"
                        placeholder="Ex: PAT-2024-001"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="refPatient"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateEcheance">
                        <Calendar size={16} />
                        Date d'échéance souhaitée *
                      </label>
                      <Field
                        id="dateEcheance"
                        name="dateEcheance"
                        type="date"
                        min={getMinDate()}
                        className="form-input"
                      />
                      <small className="date-hint">
                        Date minimum:{" "}
                        {getMinDate().split("-").reverse().join("/")}
                      </small>
                      <ErrorMessage
                        name="dateEcheance"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Sélection Appareil */}
                <div className="form-section">
                  <h2>
                    <Package size={20} />
                    Sélection de l'Appareil
                  </h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="categorie">
                        <Tag size={16} />
                        Catégorie *
                      </label>
                      <Field
                        as="select"
                        id="categorie"
                        name="categorie"
                        className="form-select"
                        value={selectedCategorie}
                        onChange={(e) => {
                          setFieldValue("categorie", e.target.value);
                          setSelectedCategorie(e.target.value);
                          setFieldValue("option", "");
                          setSelectedOption("");
                        }}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="categorie"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="option">
                        <Wrench size={16} />
                        Option *
                      </label>
                      <Field
                        as="select"
                        id="option"
                        name="option"
                        className="form-select"
                        disabled={!selectedCategorie}
                        value={selectedOption}
                        onChange={(e) => {
                          setFieldValue("option", e.target.value);
                          setSelectedOption(e.target.value);
                        }}
                      >
                        <option value="">Sélectionnez une option</option>
                        {OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="option"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>

                  {/* Affichage des appareils correspondants */}
                  {selectedCategorie && selectedOption && (
                    <div className="appareils-disponibles">
                      <h3>Appareils correspondants :</h3>
                      {loadingAppareils ? (
                        <div className="loading-appareils">
                          <div className="progress-bar-container small">
                            <div className="progress-bar">
                              <div className="progress-bar-fill indeterminate"></div>
                            </div>
                          </div>
                          <span>Chargement des appareils...</span>
                        </div>
                      ) : filteredAppareils.length > 0 ? (
                        <div className="appareils-list">
                          {filteredAppareils.map((app) => (
                            <div key={app.id} className="appareil-item">
                              <CheckCircle size={16} className="check-icon" />
                              <div className="appareil-info">
                                <strong>{app.nom}</strong>
                                {app.description && (
                                  <p className="appareil-description">
                                    {app.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-appareil">
                          <AlertCircle size={16} />
                          <p>Aucun appareil trouvé pour cette combinaison</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 3: Upload Fichiers */}
                <div className="form-section">
                  <h2>
                    <Archive size={20} />
                    Fichiers 3D (Stockés sur Google Drive)
                  </h2>

                  <div className="upload-area">
                    <input
                      type="file"
                      multiple
                      accept=".stl,.zip,.obj,.3mf,.ply"
                      onChange={handleFileSelect}
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <Upload size={32} />
                      <p>Cliquez ou glissez vos fichiers ici</p>
                      <small>
                        Formats acceptés : .stl, .zip, .obj, .3mf, .ply (max
                        500MB par fichier)
                      </small>
                      <small className="compression-info">
                        Les fichiers seront automatiquement compressés en ZIP et
                        stockés sur Google Drive
                      </small>
                    </label>
                  </div>

                  {/* Barre de progression */}
                  {(isUploading || isCompressing) && (
                    <div className="upload-progress-section">
                      <div className="progress-info">
                        <span className="progress-text">
                          {isCompressing
                            ? "Compression en cours..."
                            : `Upload de ${currentUploadFile}...`}
                        </span>
                        <span className="progress-percentage">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fichiers sélectionnés */}
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <h4>Fichiers sélectionnés ({selectedFiles.length}) :</h4>
                      <div className="files-list">
                        {selectedFiles.map((file, index) => (
                          <div key={`selected-${index}`} className="file-item">
                            <FileText size={16} />
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="upload-actions">
                        <button
                          type="button"
                          onClick={handleUploadFiles}
                          disabled={isUploading || isCompressing}
                          className="upload-btn primary"
                        >
                          {isCompressing || isUploading ? (
                            <>
                              <div className="progress-bar-container small inline">
                                <div className="progress-bar">
                                  <div className="progress-bar-fill indeterminate"></div>
                                </div>
                              </div>
                              {isCompressing ? "Compression..." : "Upload..."}
                            </>
                          ) : (
                            <>
                              <Archive size={16} />
                              Compresser et Uploader sur Drive
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetSelection}
                          className="upload-btn secondary"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fichiers uploadés */}
                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h4>
                        <CheckCircle size={16} className="success-icon" />
                        Fichiers uploadés sur Google Drive (
                        {uploadedFiles.length})
                        {uploadedFiles.some((f) => f.isCompressed) && (
                          <span className="compression-badge">
                            (Compressés)
                          </span>
                        )}
                      </h4>
                      <div className="files-list">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={`uploaded-${index}`}
                            className="uploaded-file-item"
                          >
                            <Archive size={16} />
                            <div className="file-info">
                              <strong>{file.fileName}</strong>
                              <small>
                                {formatFileSize(file.fileSize)}
                                {file.isCompressed && " (Compressé)"}
                              </small>
                            </div>
                            <div className="file-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewFile(file.fileViewUrl, file.fileId)
                                }
                                className="view-btn"
                                title="Voir dans Google Drive"
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile(index, file.fileId)
                                }
                                className="remove-btn"
                                title="Supprimer le fichier"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Commentaire */}
                <div className="form-section">
                  <h2>
                    <MessageSquare size={20} />
                    Commentaire (Optionnel)
                  </h2>
                  <div className="form-group">
                    <Field
                      as="textarea"
                      name="commentaire"
                      placeholder="Ajoutez des instructions ou remarques particulières pour le laboratoire..."
                      className="form-textarea"
                      rows={4}
                    />
                    <div className="character-count">
                      {values.commentaire?.length || 0}/1000 caractères
                    </div>
                    <ErrorMessage
                      name="commentaire"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setUploadedFiles([]);
                      setSelectedFiles([]);
                      setSelectedCategorie("");
                      setSelectedOption("");
                      setSearchTerm("");
                      setFilters({
                        categorie: "",
                        option: "",
                        disponibilite: "all",
                      });
                    }}
                    className="cancel-btn"
                    disabled={isSubmitting}
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    className="submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="progress-bar-container small inline">
                          <div className="progress-bar">
                            <div className="progress-bar-fill indeterminate"></div>
                          </div>
                        </div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer la Commande
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default PasserCommande;
