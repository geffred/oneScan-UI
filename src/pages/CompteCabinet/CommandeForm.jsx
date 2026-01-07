/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import JSZip from "jszip";
import {
  Upload,
  FileText,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Trash2,
  Archive,
  ExternalLink,
  Calendar,
  ShoppingCart,
  UploadCloud,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./CommandeForm.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object({
  refPatient: Yup.string()
    .required("La référence patient est requise")
    .max(100, "Maximum 100 caractères"),
  commentaire: Yup.string().max(1000, "Maximum 1000 caractères"),
  dateEcheance: Yup.date()
    .min(new Date(), "La date d'échéance doit être dans le futur")
    .required("La date d'échéance est requise"),
});

const CommandeForm = ({
  selectedAppareil,
  onCommandeCreated,
  onError,
  onSuccess,
}) => {
  const { userData } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState("");

  const compressFilesToZip = useCallback(async (files) => {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipFileName = `commande_${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 9)}.zip`;

    files.forEach((file) => {
      const uniqueFileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}_${file.name}`;
      zip.file(uniqueFileName, file);
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
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const isValidExtension = ["stl", "zip", "obj", "3mf", "ply"].includes(
        extension
      );
      const isValidSize = file.size <= 1024 * 1024 * 1024;

      if (!isValidSize) {
        toast.error(`Fichier ${file.name} trop volumineux (max 1GB)`);
      }

      return isValidExtension && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.warning(
        "Seuls les fichiers .stl, .zip, .obj, .3mf, .ply (max 1GB par fichier) sont acceptés"
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const uploadFileWithProgress = useCallback(
    (file, formData, token, index, totalFiles) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            const globalProgress = 10 + (progress * 90) / totalFiles;
            setUploadProgress(Math.min(globalProgress, 99));
          }
        });

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
                  new Error(errorData.error || `Erreur HTTP ${xhr.status}`)
                );
              } catch {
                reject(new Error(`Erreur HTTP ${xhr.status}`));
              }
            }
          }
        };

        xhr.onerror = function () {
          reject(new Error("Erreur réseau lors de l'upload"));
        };

        xhr.open("POST", `${API_BASE_URL}/files/upload-command`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.timeout = 300000;
        xhr.send(formData);
      });
    },
    []
  );

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
        formData.append(
          "commandeRef",
          `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        );

        let retries = 3;
        let result;

        while (retries > 0) {
          try {
            result = await uploadFileWithProgress(
              file,
              formData,
              token,
              i,
              filesToUpload.length
            );
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw error;
            toast.warning(`Nouvelle tentative d'upload... (${3 - retries}/3)`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

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
          `${selectedFiles.length} fichier(s) compressés et uploadés avec succès sur le Drive`
        );
      } else {
        toast.success(
          `${newFiles.length} fichier(s) uploadé(s) avec succès sur le Drive`
        );
      }

      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error("Erreur upload:", error);
      let errorMessage =
        error.message || "Erreur lors de l'upload des fichiers";

      if (errorMessage.includes("413")) {
        errorMessage =
          "Le fichier est trop volumineux pour le serveur. Veuillez contacter l'administrateur.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("Network")
      ) {
        errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
      }

      toast.error(errorMessage);
      if (onError) onError(errorMessage);
      setUploadProgress(0);
      setCurrentUploadFile("");
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
    }
  }, [
    selectedFiles,
    userData,
    onError,
    compressFilesToZip,
    uploadFileWithProgress,
  ]);

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
      toast.success("Fichier supprimé avec succès du Drive");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression du fichier");
    }
  }, []);

  const handleViewFile = useCallback((fileViewUrl, fileId) => {
    if (fileViewUrl) {
      window.open(fileViewUrl, "_blank");
    } else if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
    }
  }, []);

  const sendEmailNotification = useCallback(
    async (commande, cabinet) => {
      try {
        const token = localStorage.getItem("token");

        const emailData = {
          commande_id: commande.externalId || commande.id,
          patient_ref: commande.refPatient,
          plateforme: "MYSMILELAB",
          cabinet: cabinet.nom,
          date_reception: new Date().toLocaleDateString("fr-FR"),
          commentaire: commande.commentaire || "Aucun commentaire",
          type_appareil: commande.typeAppareil,
          date_echeance: commande.dateEcheance,
          nombre_fichiers: uploadedFiles.length,
        };

        const response = await fetch(
          `${API_BASE_URL}/email/send-commande-notification`,
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
          console.warn("Échec de l'envoi de l'email");
          toast.warning("Commande créée mais email non envoyé");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        toast.warning("Commande créée mais email non envoyé");
      }
    },
    [uploadedFiles.length]
  );

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
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

      if (!selectedAppareil) {
        toast.error("Veuillez sélectionner un appareil");
        setSubmitting(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const commandeData = {
          cabinetId: userData.id,
          cabinetName: userData.nom,
          refPatient: values.refPatient.trim(),
          typeAppareil: selectedAppareil.nom,
          commentaire: values.commentaire?.trim() || "",
          details: selectedAppareil?.description || "",
          fichierUrls: uploadedFiles.map((f) => f.fileUrl),
          fichierPublicIds: uploadedFiles.map((f) => f.fileId),
          adresseDeLivraison: userData.adresseDeLivraison || "",
          adresseDeFacturation: userData.adresseDeFacturation || "",
          dateEcheance: values.dateEcheance,
        };

        const response = await fetch(
          `${API_BASE_URL}/public/commandes/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(commandeData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création de la commande"
          );
        }

        const result = await response.json();

        if (result.success) {
          await sendEmailNotification(result.commande, userData);

          toast.success("Commande créée avec succès !");
          if (onSuccess) onSuccess("Commande créée avec succès");
          if (onCommandeCreated) onCommandeCreated(result.commande);

          resetForm();
          setUploadedFiles([]);
          setSelectedFiles([]);
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
    },
    [
      uploadedFiles,
      userData,
      selectedAppareil,
      onSuccess,
      onCommandeCreated,
      onError,
      sendEmailNotification,
    ]
  );

  const handleResetSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const handleRemoveSelectedFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const formatDateForInput = useCallback((date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getMinDate = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  }, [formatDateForInput]);

  if (!userData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des informations du cabinet...</p>
      </div>
    );
  }

  return (
    <main className="form-section">
      <div className="section-header">
        <h2>
          <ShoppingCart size={18} />
          Formulaire de Commande
        </h2>
        {selectedAppareil ? (
          <div className="selected-badge success">
            <CheckCircle size={14} />
            <span>{selectedAppareil.nom}</span>
          </div>
        ) : (
          <div className="selected-badge warning">
            <AlertCircle size={14} />
            <span>Sélectionnez un appareil</span>
          </div>
        )}
      </div>

      <Formik
        initialValues={{
          refPatient: "",
          commentaire: "",
          dateEcheance: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, resetForm }) => (
          <Form className="commande-form">
            <section className="form-group-section">
              <h3>
                <User size={18} />
                Informations Patient
              </h3>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="refPatient">Référence Patient *</label>
                  <Field
                    id="refPatient"
                    name="refPatient"
                    type="text"
                    placeholder="Ex: PAT-2024-001"
                  />
                  <ErrorMessage
                    name="refPatient"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="field">
                  <label htmlFor="dateEcheance">
                    <Calendar size={14} />
                    Date d'échéance *
                  </label>
                  <Field
                    id="dateEcheance"
                    name="dateEcheance"
                    type="date"
                    min={getMinDate()}
                  />
                  <small>
                    Date minimum: {getMinDate().split("-").reverse().join("/")}
                  </small>
                  <ErrorMessage
                    name="dateEcheance"
                    component="div"
                    className="error"
                  />
                </div>
              </div>
            </section>

            <section className="form-group-section">
              <h3>
                <UploadCloud size={18} />
                Fichiers 3D
              </h3>

              <div className="upload-zone">
                <input
                  type="file"
                  multiple
                  accept=".stl,.zip,.obj,.3mf,.ply"
                  onChange={handleFileSelect}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Upload size={40} />
                  <p>Cliquez ou glissez vos fichiers 3D ici</p>
                  <small>Formats: .stl, .zip, .obj, .3mf, .ply • Max 1GB</small>
                </label>
              </div>

              {(isUploading || isCompressing) && (
                <div className="progress-container">
                  <div className="progress-info">
                    <span>
                      {isCompressing
                        ? "Compression en cours..."
                        : `Upload de ${currentUploadFile}...`}
                    </span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="files-list pending">
                  <h4>Fichiers à uploader ({selectedFiles.length})</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={`selected-${index}`} className="file-item">
                      <FileText size={16} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(index)}
                        className="icon-btn danger"
                        title="Retirer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="actions">
                    <button
                      type="button"
                      onClick={handleUploadFiles}
                      disabled={isUploading || isCompressing}
                      className="btn primary"
                    >
                      {isCompressing || isUploading ? (
                        <>
                          <div className="spinner tiny"></div>
                          {isCompressing ? "Compression..." : "Upload..."}
                        </>
                      ) : (
                        <>
                          <Archive size={16} />
                          Télécharger sur dans le Drive
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSelection}
                      className="btn secondary"
                    >
                      Tout retirer
                    </button>
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="files-list uploaded">
                  <h4>
                    <CheckCircle size={16} />
                    Fichiers téléchargés ({uploadedFiles.length})
                  </h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={`uploaded-${index}`} className="file-item">
                      <Archive size={16} />
                      <div className="file-info">
                        <strong>{file.fileName}</strong>
                        <small>
                          {formatFileSize(file.fileSize)}
                          {file.isCompressed && " (Compressé)"}
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleViewFile(file.fileViewUrl, file.fileId)
                        }
                        className="icon-btn"
                        title="Voir"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index, file.fileId)}
                        className="icon-btn danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="form-group-section">
              <h3>
                <MessageSquare size={18} />
                Instructions supplémentaires
              </h3>
              <div className="field">
                <Field
                  as="textarea"
                  name="commentaire"
                  placeholder="Ajoutez des instructions ou remarques pour le laboratoire..."
                  rows={4}
                />
                <div className="char-count">
                  {values.commentaire?.length || 0}/1000
                </div>
                <ErrorMessage
                  name="commentaire"
                  component="div"
                  className="error"
                />
              </div>
            </section>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setUploadedFiles([]);
                  setSelectedFiles([]);
                }}
                className="btn secondary"
                disabled={isSubmitting}
              >
                Réinitialiser
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  uploadedFiles.length === 0 ||
                  !selectedAppareil
                }
                className="btn primary large"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner tiny"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Commander
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default CommandeForm;
