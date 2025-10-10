import React, { useState, useCallback, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { toast } from "react-toastify";
import {
  Upload,
  FileText,
  User,
  Package,
  MessageSquare,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
  Tag,
  Wrench,
  Trash2,
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
});

const PasserCommande = ({ onCommandeCreated, onError, onSuccess }) => {
  const { userData } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  // Récupérer les appareils
  const { data: appareils = [], isLoading: loadingAppareils } = useSWR(
    "/appareils",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Filtrer les appareils par catégorie et option
  const filteredAppareils = React.useMemo(() => {
    return appareils.filter((app) => {
      const matchCategorie =
        !selectedCategorie || app.categorie === selectedCategorie;
      const matchOption = !selectedOption || app.options === selectedOption;
      return matchCategorie && matchOption;
    });
  }, [appareils, selectedCategorie, selectedOption]);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const isValidExtension = ["stl", "zip"].includes(extension);
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB max

      return isValidExtension && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.warning(
        "Seuls les fichiers .stl et .zip (max 100MB) sont acceptés"
      );
    }

    setSelectedFiles(validFiles);
  }, []);

  // Upload des fichiers sur Cloudinary
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
    try {
      const token = localStorage.getItem("token");
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("cabinetName", userData.nom);
        formData.append("commandeRef", `cmd_${Date.now()}`);

        const response = await fetch(`${API_BASE_URL}/files/upload-command`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de l'upload");
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);

      const newFiles = results.map((result) => ({
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        publicId: result.publicId,
        fileSize: result.fileSize,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setSelectedFiles([]);
      toast.success(`${results.length} fichier(s) uploadé(s) avec succès`);
    } catch (error) {
      console.error("Erreur upload:", error);
      const errorMessage =
        error.message || "Erreur lors de l'upload des fichiers";
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, userData, onError]);

  // Supprimer un fichier uploadé
  const handleRemoveFile = useCallback(async (index, publicId) => {
    try {
      const token = localStorage.getItem("token");
      const encodedPublicId = encodeURIComponent(publicId);

      const response = await fetch(`${API_BASE_URL}/files/${encodedPublicId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("Fichier supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression du fichier");
    }
  }, []);

  // Soumettre la commande
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (uploadedFiles.length === 0) {
      toast.error("Veuillez uploader au moins un fichier STL ou ZIP");
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
        fichierPublicIds: uploadedFiles.map((f) => f.publicId),
        adresseDeLivraison: userData.adresseDeLivraison || "",
        adresseDeFacturation: userData.adresseDeFacturation || "",
      };

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

  // Réinitialiser la sélection
  const handleResetSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  if (!userData) {
    return (
      <div className="passer-commande-loading">
        <Loader className="spinner" />
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
        <p>Remplissez le formulaire et uploadez vos fichiers STL ou ZIP</p>
      </div>

      <Formik
        initialValues={{
          refPatient: "",
          categorie: "",
          option: "",
          commentaire: "",
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
                    onChange={(e) => {
                      setFieldValue("categorie", e.target.value);
                      setSelectedCategorie(e.target.value);
                      // Réinitialiser l'option quand la catégorie change
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
                    disabled={!values.categorie}
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
              {values.categorie && values.option && (
                <div className="appareils-disponibles">
                  <h3>Appareils disponibles :</h3>
                  {loadingAppareils ? (
                    <div className="loading-appareils">
                      <Loader size={16} />
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
                <Upload size={20} />
                Fichiers 3D (STL ou ZIP)
              </h2>

              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  accept=".stl,.zip"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={32} />
                  <p>Cliquez ou glissez vos fichiers ici</p>
                  <small>
                    Formats acceptés : .stl, .zip (max 100MB par fichier)
                  </small>
                </label>
              </div>

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
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="upload-actions">
                    <button
                      type="button"
                      onClick={handleUploadFiles}
                      disabled={isUploading}
                      className="upload-btn primary"
                    >
                      {isUploading ? (
                        <>
                          <Loader size={16} className="spinner" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Uploader les fichiers
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
                    Fichiers uploadés ({uploadedFiles.length})
                  </h4>
                  <div className="files-list">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`uploaded-${index}`}
                        className="uploaded-file-item"
                      >
                        <FileText size={16} />
                        <div className="file-info">
                          <strong>{file.fileName}</strong>
                          <small>
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </small>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, file.publicId)}
                          className="remove-btn"
                          title="Supprimer le fichier"
                        >
                          <Trash2 size={16} />
                        </button>
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
                    <Loader size={18} className="spinner" />
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
  );
};

export default PasserCommande;
