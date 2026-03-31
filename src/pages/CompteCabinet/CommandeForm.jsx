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

// Appareil optionnel — seul le commentaire est requis si pas d'appareil
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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const getMinDate = useCallback(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatDateForInput(t);
  }, [formatDateForInput]);

  const compressFilesToZip = useCallback(async (files) => {
    const zip = new JSZip();
    const zipFileName = `commande_${new Date().toISOString().replace(/[:.]/g, "-")}_${Math.random().toString(36).substring(2, 9)}.zip`;
    files.forEach((file) => {
      zip.file(
        `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`,
        file,
      );
    });
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    return new File([blob], zipFileName, {
      type: "application/zip",
      lastModified: Date.now(),
    });
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      const ok =
        ["stl", "zip", "obj", "3mf", "ply"].includes(ext) &&
        f.size <= 1024 * 1024 * 1024;
      if (!ok && f.size > 1024 * 1024 * 1024)
        toast.error(`Fichier ${f.name} trop volumineux (max 1GB)`);
      return ok;
    });
    if (valid.length !== files.length)
      toast.warning(
        "Seuls les fichiers .stl, .zip, .obj, .3mf, .ply (max 1GB) sont acceptés",
      );
    setSelectedFiles((p) => [...p, ...valid]);
  }, []);

  const uploadFileWithProgress = useCallback((file, formData, token) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable)
          setUploadProgress(10 + (e.loaded / e.total) * 90);
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Erreur parsing réponse"));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || `Erreur HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`Erreur HTTP ${xhr.status}`));
            }
          }
        }
      };
      xhr.onerror = () => reject(new Error("Erreur réseau lors de l'upload"));
      xhr.open("POST", `${API_BASE_URL}/files/upload-command`);
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${localStorage.getItem("token")}`,
      );
      xhr.timeout = 300000;
      xhr.send(formData);
    });
  }, []);

  const handleUploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Sélectionnez au moins un fichier");
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
      const token = localStorage.getItem("token");
      const stlFiles = selectedFiles.filter(
        (f) => !f.name.toLowerCase().endsWith(".zip"),
      );
      const zipFiles = selectedFiles.filter((f) =>
        f.name.toLowerCase().endsWith(".zip"),
      );
      let filesToUpload = selectedFiles;

      if (stlFiles.length > 0) {
        filesToUpload = [await compressFilesToZip(selectedFiles)];
        toast.info("Compression des fichiers en cours...");
      }

      setIsCompressing(false);
      setUploadProgress(10);
      const newFiles = [];

      for (const file of filesToUpload) {
        setCurrentUploadFile(file.name);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("cabinetName", userData.nom);
        formData.append(
          "commandeRef",
          `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        );

        let retries = 3,
          result;
        while (retries > 0) {
          try {
            result = await uploadFileWithProgress(file, formData, token);
            break;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            toast.warning(`Nouvelle tentative...`);
            await new Promise((r) => setTimeout(r, 1000));
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
      }

      setUploadedFiles((p) => [...p, ...newFiles]);
      setSelectedFiles([]);
      setUploadProgress(100);
      setCurrentUploadFile("");
      toast.success(`${newFiles.length} fichier(s) uploadé(s) avec succès`);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      let msg = err.message || "Erreur lors de l'upload";
      if (msg.includes("413")) msg = "Fichier trop volumineux pour le serveur.";
      else if (msg.toLowerCase().includes("network"))
        msg = "Erreur réseau. Vérifiez votre connexion.";
      toast.error(msg);
      if (onError) onError(msg);
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
      const res = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setUploadedFiles((p) => p.filter((_, i) => i !== index));
      toast.success("Fichier supprimé avec succès");
    } catch {
      toast.error("Erreur lors de la suppression du fichier");
    }
  }, []);

  const handleViewFile = useCallback((fileViewUrl, fileId) => {
    const url =
      fileViewUrl ||
      (fileId ? `https://drive.google.com/file/d/${fileId}/view` : null);
    if (url) window.open(url, "_blank");
  }, []);

  const sendEmailNotification = useCallback(
    async (commande, cabinet) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/email/send-commande-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              commande_id: commande.externalId || commande.id,
              patient_ref: commande.refPatient,
              plateforme: "MYSMILELAB",
              cabinet: cabinet.nom,
              date_reception: new Date().toLocaleDateString("fr-FR"),
              commentaire: commande.commentaire || "Aucun commentaire",
              type_appareil: commande.typeAppareil || "Non spécifié",
              date_echeance: commande.dateEcheance,
              nombre_fichiers: uploadedFiles.length,
            }),
          },
        );
        if (res.ok)
          toast.success("Email de notification envoyé au laboratoire");
        else toast.warning("Commande créée mais email non envoyé");
      } catch {
        toast.warning("Commande créée mais email non envoyé");
      }
    },
    [uploadedFiles.length],
  );

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      // Si pas d'appareil, le commentaire devient obligatoire
      if (!selectedAppareil && !values.commentaire?.trim()) {
        toast.error(
          "Sans appareil sélectionné, veuillez indiquer un commentaire décrivant votre demande",
        );
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
        const commandeData = {
          cabinetId: userData.id,
          cabinetName: userData.nom,
          refPatient: values.refPatient.trim(),
          typeAppareil: selectedAppareil?.nom || null,
          commentaire: values.commentaire?.trim() || "",
          details: selectedAppareil?.description || "",
          fichierUrls: uploadedFiles.map((f) => f.fileUrl),
          fichierPublicIds: uploadedFiles.map((f) => f.fileId),
          adresseDeLivraison: userData.adresseDeLivraison || "",
          adresseDeFacturation: userData.adresseDeFacturation || "",
          dateEcheance: values.dateEcheance,
        };

        const res = await fetch(`${API_BASE_URL}/public/commandes/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(commandeData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur création commande");
        }
        const result = await res.json();

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
      } catch (err) {
        const msg = err.message || "Erreur lors de la création de la commande";
        toast.error(msg);
        if (onError) onError(msg);
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
    ],
  );

  if (!userData) {
    return (
      <div className="loading-container">
        <div className="spinner" />
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
          <div className="selected-badge neutral">
            <AlertCircle size={14} />
            <span>Sans appareil (commentaire requis)</span>
          </div>
        )}
      </div>

      <Formik
        initialValues={{ refPatient: "", commentaire: "", dateEcheance: "" }}
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
                    Date minimum : {getMinDate().split("-").reverse().join("/")}
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
                    />
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="files-list pending">
                  <h4>Fichiers à uploader ({selectedFiles.length})</h4>
                  {selectedFiles.map((file, i) => (
                    <div key={`sel-${i}`} className="file-item">
                      <FileText size={16} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles((p) => p.filter((_, j) => j !== i))
                        }
                        className="icon-btn danger"
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
                          <div className="spinner tiny" />
                          {isCompressing ? "Compression..." : "Upload..."}
                        </>
                      ) : (
                        <>
                          <Archive size={16} />
                          Télécharger sur le Drive
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
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
                  {uploadedFiles.map((file, i) => (
                    <div key={`up-${i}`} className="file-item">
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
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(i, file.fileId)}
                        className="icon-btn danger"
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
                {!selectedAppareil && (
                  <span className="required-note">
                    {" "}
                    — requis si pas d'appareil
                  </span>
                )}
              </h3>
              <div className="field">
                <Field
                  as="textarea"
                  name="commentaire"
                  placeholder={
                    selectedAppareil
                      ? "Ajoutez des instructions ou remarques..."
                      : "Décrivez votre demande (obligatoire sans appareil sélectionné)..."
                  }
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
                disabled={isSubmitting || uploadedFiles.length === 0}
                className="btn primary large"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner tiny" />
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
