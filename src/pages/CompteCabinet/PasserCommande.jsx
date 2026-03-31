/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback, useContext } from "react";
import useSWR from "swr";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import JSZip from "jszip";
import {
  Search,
  SlidersHorizontal,
  X,
  Tag,
  Wrench,
  ImageIcon,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShoppingCart,
  Send,
  Upload,
  Archive,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Package,
  Eye,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { apiGet } from "../../components/Config/apiUtils";
import "./PasserCommande.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fetcher = (url) => apiGet(url);

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
  { value: "TUBES_SUR_16_ET_26", label: "Tubes 16 et 26" },
  { value: "BRAS_DE_DELAIRE", label: "Bras de Delaire" },
  { value: "SMART_BANDS", label: "Smart Bands" },
  { value: "VERIN_SUPERIEUR", label: "Vérin Supérieur" },
  { value: "BAGUES_STANDARD", label: "Bagues Standard" },
  { value: "BENEFIT_STANDARD_VERIN_STANDARD", label: "Benefit Standard" },
  { value: "POWER_SCREW_BENEFIT_STANDARD", label: "Power Screw Benefit" },
  { value: "AUCUN", label: "Aucune option" },
];

const validationSchema = Yup.object({
  refPatient: Yup.string().required("Référence patient requise").max(100),
  commentaire: Yup.string().max(1000, "Maximum 1000 caractères"),
  dateEcheance: Yup.date()
    .min(new Date(), "Doit être dans le futur")
    .required("Date d'échéance requise"),
});

// ── Image Viewer with zoom ───────────────────────────────────────────────────
const ImageViewer = React.memo(({ images }) => {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.3, 3)), []);
  const zoomOut = useCallback(
    () =>
      setZoom((z) => {
        const n = Math.max(z - 0.3, 1);
        if (n <= 1) setPos({ x: 0, y: 0 });
        return n;
      }),
    [],
  );
  const reset = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const onMD = (e) => {
    if (zoom > 1) {
      setDragging(true);
      setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
      e.preventDefault();
    }
  };
  const onMM = (e) => {
    if (dragging && zoom > 1)
      setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const onMU = () => setDragging(false);
  const onWheel = (e) => {
    e.preventDefault();
    e.deltaY < 0 ? zoomIn() : zoomOut();
  };

  React.useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [idx]);

  const img = images[idx];
  if (!img)
    return (
      <div className="pc-viewer-empty">
        <ImageIcon size={40} />
        <span>Aucune image</span>
      </div>
    );

  return (
    <div className="pc-viewer">
      <div
        className="pc-viewer-stage"
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={onMU}
        onWheel={onWheel}
        style={{
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
        }}
      >
        <img
          src={img.imagePath}
          alt=""
          style={{
            transform: `scale(${zoom}) translate(${pos.x / zoom}px,${pos.y / zoom}px)`,
          }}
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            className="pc-nav prev"
            onClick={() =>
              setIdx((i) => (i - 1 + images.length) % images.length)
            }
          >
            ‹
          </button>
          <button
            className="pc-nav next"
            onClick={() => setIdx((i) => (i + 1) % images.length)}
          >
            ›
          </button>
          <span className="pc-counter">
            {idx + 1}/{images.length}
          </span>
        </>
      )}
      <div className="pc-zoom-bar">
        <button onClick={zoomOut} disabled={zoom <= 1}>
          <ZoomOut size={13} />
        </button>
        <button onClick={reset}>
          <RotateCcw size={13} />
        </button>
        <button onClick={zoomIn} disabled={zoom >= 3}>
          <ZoomIn size={13} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
      {images.length > 1 && (
        <div className="pc-thumbs">
          {images.map((im, i) => (
            <img
              key={im.id}
              src={im.imagePath}
              className={i === idx ? "active" : ""}
              onClick={() => setIdx(i)}
              onError={(e) => (e.target.style.display = "none")}
              alt=""
            />
          ))}
        </div>
      )}
    </div>
  );
});
ImageViewer.displayName = "ImageViewer";

// ── Appareil Card ────────────────────────────────────────────────────────────
const AppareilCard = React.memo(
  ({ appareil, isSelected, onSelect, onPreview }) => {
    const cover = appareil.images?.[0]?.imagePath;
    const catLabel =
      CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
      appareil.categorie;

    return (
      <article className={`pc-card${isSelected ? " selected" : ""}`}>
        <div className="pc-card-img" onClick={() => onSelect(appareil)}>
          {cover ? (
            <>
              <img
                src={cover}
                alt={appareil.nom}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="pc-card-placeholder" style={{ display: "none" }}>
                <ImageIcon size={24} />
              </div>
            </>
          ) : (
            <div className="pc-card-placeholder">
              <ImageIcon size={24} />
              <span>Aucune image</span>
            </div>
          )}
          {appareil.images?.length > 1 && (
            <span className="pc-img-count">
              <ImageIcon size={10} />
              {appareil.images.length}
            </span>
          )}
          {isSelected && (
            <div className="pc-selected-mark">
              <CheckCircle size={18} />
            </div>
          )}
        </div>
        <div className="pc-card-body">
          <h3>{appareil.nom}</h3>
          <span className="pc-cat-pill">
            <Tag size={10} />
            {catLabel}
          </span>
          {appareil.description && (
            <p className="pc-card-desc">
              {appareil.description.length > 72
                ? appareil.description.slice(0, 72) + "…"
                : appareil.description}
            </p>
          )}
        </div>
        <div className="pc-card-footer">
          <button
            className="pc-cta-ghost"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(appareil);
            }}
          >
            <Eye size={13} />
            Détails
          </button>
          <button
            className={`pc-cta-main${isSelected ? " active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(appareil);
            }}
          >
            <ShoppingCart size={13} />
            {isSelected ? "Sélectionné" : "Commander"}
          </button>
        </div>
      </article>
    );
  },
);
AppareilCard.displayName = "AppareilCard";

// ── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = React.memo(({ appareil, onClose, onOrder }) => {
  const catLabel =
    CATEGORIES.find((c) => c.value === appareil.categorie)?.label ||
    appareil.categorie;
  const optLabel =
    OPTIONS.find((o) => o.value === appareil.options)?.label ||
    appareil.options;

  return (
    <aside className="pc-detail">
      <div className="pc-detail-head">
        <h2>{appareil.nom}</h2>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="pc-detail-body">
        <ImageViewer images={appareil.images || []} />
        <div className="pc-detail-meta">
          <div className="pc-meta-row">
            <Tag size={13} />
            <span>
              <b>Catégorie :</b> {catLabel}
            </span>
          </div>
          <div className="pc-meta-row">
            <Wrench size={13} />
            <span>
              <b>Option :</b> {optLabel}
            </span>
          </div>
          {appareil.description && (
            <div className="pc-meta-row">
              <FileText size={13} />
              <span>{appareil.description}</span>
            </div>
          )}
          {appareil.user && (
            <div className="pc-meta-row">
              <User size={13} />
              <span>
                <b>Créateur :</b> {appareil.user.firstName}{" "}
                {appareil.user.lastName}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="pc-detail-foot">
        <button className="pc-order-btn" onClick={() => onOrder(appareil)}>
          <ShoppingCart size={15} />
          Commander cet appareil
        </button>
      </div>
    </aside>
  );
});
DetailPanel.displayName = "DetailPanel";

// ── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = React.memo(({ appareil, onClose, onSuccess }) => {
  const { userData } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fmtSize = (b) => {
    if (!b) return "0B";
    const k = 1024,
      s = ["B", "KB", "MB", "GB"],
      i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + s[i];
  };
  const getMinDate = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return (
        ["stl", "zip", "obj", "3mf", "ply"].includes(ext) &&
        f.size <= 1024 * 1024 * 1024
      );
    });
    setSelectedFiles((p) => [...p, ...files]);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !userData?.nom) return;
    setIsUploading(true);
    setIsCompressing(true);
    setUploadProgress(0);
    try {
      const token = localStorage.getItem("token");
      const hasNonZip = selectedFiles.some(
        (f) => !f.name.toLowerCase().endsWith(".zip"),
      );
      let files = selectedFiles;
      if (hasNonZip) {
        const zip = new JSZip();
        selectedFiles.forEach((f) => zip.file(`${Date.now()}_${f.name}`, f));
        const blob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        files = [
          new File([blob], `commande_${Date.now()}.zip`, {
            type: "application/zip",
          }),
        ];
      }
      setIsCompressing(false);
      setUploadProgress(10);
      const newFiles = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("cabinetName", userData.nom);
        fd.append("commandeRef", `cmd_${Date.now()}`);
        const result = await new Promise((res, rej) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable)
              setUploadProgress(10 + (e.loaded / e.total) * 85);
          };
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              xhr.status === 200
                ? res(JSON.parse(xhr.responseText))
                : rej(new Error(`HTTP ${xhr.status}`));
            }
          };
          xhr.open("POST", `${API_BASE_URL}/files/upload-command`);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.timeout = 300000;
          xhr.send(fd);
        });
        newFiles.push({
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileViewUrl: result.fileViewUrl,
          fileId: result.fileId,
          fileSize: result.fileSize,
        });
      }
      setUploadedFiles((p) => [...p, ...newFiles]);
      setSelectedFiles([]);
      setUploadProgress(100);
      toast.success(`${newFiles.length} fichier(s) uploadé(s)`);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      toast.error(err.message || "Erreur upload");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
    }
  };

  const removeUploaded = async (i, fileId) => {
    try {
      await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUploadedFiles((p) => p.filter((_, j) => j !== i));
      toast.success("Supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!appareil && !values.commentaire?.trim()) {
      toast.error("Commentaire requis sans appareil");
      setSubmitting(false);
      return;
    }
    if (!userData?.id) {
      toast.error("Informations cabinet manquantes");
      setSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/public/commandes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cabinetId: userData.id,
          cabinetName: userData.nom,
          refPatient: values.refPatient.trim(),
          typeAppareil: appareil?.nom || null,
          commentaire: values.commentaire?.trim() || "",
          details: appareil?.description || "",
          fichierUrls: uploadedFiles.map((f) => f.fileUrl),
          fichierPublicIds: uploadedFiles.map((f) => f.fileId),
          adresseDeLivraison: userData.adresseDeLivraison || "",
          adresseDeFacturation: userData.adresseDeFacturation || "",
          dateEcheance: values.dateEcheance,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.error || "Erreur création");
      try {
        await fetch(`${API_BASE_URL}/email/send-commande-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            commande_id: result.commande.externalId,
            patient_ref: values.refPatient,
            cabinet: userData.nom,
            date_reception: new Date().toLocaleDateString("fr-FR"),
            commentaire: values.commentaire || "",
            type_appareil: appareil?.nom || "Non spécifié",
            date_echeance: values.dateEcheance,
            nombre_fichiers: uploadedFiles.length,
          }),
        });
      } catch {
        /* non bloquant */
      }
      toast.success("Commande créée !");
      if (onSuccess) onSuccess(result.commande);
      onClose();
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-head">
          <div className="pc-modal-title">
            <ShoppingCart size={17} />
            <div>
              <h2>Nouvelle commande</h2>
              {appareil ? (
                <span className="pc-modal-sub">{appareil.nom}</span>
              ) : (
                <span className="pc-modal-sub neutral">
                  Sans appareil spécifique
                </span>
              )}
            </div>
          </div>
          <button className="pc-modal-x" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {appareil?.images?.length > 0 && (
          <div className="pc-modal-preview">
            <img
              src={appareil.images[0].imagePath}
              alt={appareil.nom}
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="pc-modal-preview-info">
              <strong>{appareil.nom}</strong>
              <span>
                <Tag size={11} />
                {CATEGORIES.find((c) => c.value === appareil.categorie)?.label}
              </span>
              <span>
                <Wrench size={11} />
                {OPTIONS.find((o) => o.value === appareil.options)?.label}
              </span>
            </div>
          </div>
        )}

        <Formik
          initialValues={{ refPatient: "", commentaire: "", dateEcheance: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className="pc-modal-scroll">
                <section className="pc-msec">
                  <h3>
                    <User size={14} />
                    Patient
                  </h3>
                  <div className="pc-mrow">
                    <div className="pc-mfield">
                      <label>Référence patient *</label>
                      <Field
                        name="refPatient"
                        type="text"
                        placeholder="PAT-2024-001"
                      />
                      <ErrorMessage
                        name="refPatient"
                        component="p"
                        className="pc-merr"
                      />
                    </div>
                    <div className="pc-mfield">
                      <label>
                        <Calendar size={11} />
                        Date d'échéance *
                      </label>
                      <Field
                        name="dateEcheance"
                        type="date"
                        min={getMinDate()}
                      />
                      <ErrorMessage
                        name="dateEcheance"
                        component="p"
                        className="pc-merr"
                      />
                    </div>
                  </div>
                </section>

                <section className="pc-msec">
                  <h3>
                    <Upload size={14} />
                    Fichiers 3D
                  </h3>
                  <div className="pc-upload-zone">
                    <input
                      type="file"
                      multiple
                      accept=".stl,.zip,.obj,.3mf,.ply"
                      onChange={handleFileSelect}
                      id="pcf"
                    />
                    <label htmlFor="pcf">
                      <Upload size={26} />
                      <span>Cliquez ou glissez vos fichiers</span>
                      <small>.stl .zip .obj .3mf .ply — max 1GB</small>
                    </label>
                  </div>
                  {isUploading && (
                    <div className="pc-progress">
                      <div className="pc-prog-info">
                        <span>
                          {isCompressing ? "Compression…" : "Upload…"}
                        </span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="pc-prog-track">
                        <div
                          className="pc-prog-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedFiles.length > 0 && (
                    <div className="pc-flist pending">
                      <div className="pc-flist-head">
                        <span>{selectedFiles.length} fichier(s)</span>
                        <div>
                          <button
                            type="button"
                            className="pc-fsm primary"
                            onClick={handleUpload}
                            disabled={isUploading}
                          >
                            <Archive size={11} />
                            Uploader
                          </button>
                          <button
                            type="button"
                            className="pc-fsm"
                            onClick={() => setSelectedFiles([])}
                          >
                            Tout retirer
                          </button>
                        </div>
                      </div>
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="pc-fitem">
                          <FileText size={13} />
                          <span className="pc-fname">{f.name}</span>
                          <span className="pc-fsize">{fmtSize(f.size)}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFiles((p) =>
                                p.filter((_, j) => j !== i),
                              )
                            }
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadedFiles.length > 0 && (
                    <div className="pc-flist uploaded">
                      <div className="pc-flist-head uploaded">
                        <CheckCircle size={13} />
                        <span>{uploadedFiles.length} sur Drive</span>
                      </div>
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="pc-fitem">
                          <Archive size={13} />
                          <div className="pc-finfo">
                            <strong>{f.fileName}</strong>
                            <small>{fmtSize(f.fileSize)}</small>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                f.fileViewUrl ||
                                  `https://drive.google.com/file/d/${f.fileId}/view`,
                                "_blank",
                              )
                            }
                          >
                            <ExternalLink size={11} />
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => removeUploaded(i, f.fileId)}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="pc-msec">
                  <h3>
                    <MessageSquare size={14} />
                    Instructions
                    {!appareil && (
                      <span className="pc-reqnote">
                        {" "}
                        — requis sans appareil
                      </span>
                    )}
                  </h3>
                  <div className="pc-mfield">
                    <Field
                      as="textarea"
                      name="commentaire"
                      rows={3}
                      placeholder={
                        appareil
                          ? "Instructions pour le laboratoire…"
                          : "Décrivez votre demande (obligatoire)…"
                      }
                    />
                    <div className="pc-charcount">
                      {values.commentaire?.length || 0}/1000
                    </div>
                    <ErrorMessage
                      name="commentaire"
                      component="p"
                      className="pc-merr"
                    />
                  </div>
                </section>
              </div>

              <div className="pc-modal-foot">
                <button type="button" className="pc-mcancel" onClick={onClose}>
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadedFiles.length === 0}
                  className="pc-msubmit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="pc-spin-tiny" />
                      Création…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Envoyer la commande
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});
OrderModal.displayName = "OrderModal";

// ── Filter Sidebar ───────────────────────────────────────────────────────────
const FilterSidebar = React.memo(
  ({ search, cat, opt, onSearch, onCat, onOpt, onClear, total, filtered }) => (
    <aside className="pc-sidebar">
      <div className="pc-sb-head">
        <SlidersHorizontal size={15} />
        <span>Filtres</span>
      </div>
      <div className="pc-sb-block">
        <label>Recherche</label>
        <div className="pc-sb-search">
          <Search size={13} />
          <input
            type="text"
            placeholder="Nom…"
            value={search}
            onChange={onSearch}
          />
          {search && (
            <button onClick={() => onSearch({ target: { value: "" } })}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="pc-sb-block">
        <label>Catégorie</label>
        <select value={cat} onChange={onCat}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="pc-sb-block">
        <label>Option</label>
        <select value={opt} onChange={onOpt}>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {(search || cat || opt) && (
        <button className="pc-sb-clear" onClick={onClear}>
          <X size={11} />
          Effacer
        </button>
      )}
      <div className="pc-sb-badge">
        <span className="pc-sb-n">{filtered}</span>
        <span>/ {total} appareil(s)</span>
      </div>
    </aside>
  ),
);
FilterSidebar.displayName = "FilterSidebar";

// ── Main Component ───────────────────────────────────────────────────────────
const PasserCommande = ({ onCommandeCreated, onError, onSuccess }) => {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [opt, setOpt] = useState("");
  const [selected, setSelected] = useState(null);
  const [previewed, setPreviewed] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const { data: appareils = [], isLoading } = useSWR("/appareils", fetcher, {
    revalidateOnFocus: false,
  });

  const filtered = useMemo(
    () =>
      appareils.filter((a) => {
        const t = search.toLowerCase();
        return (
          (!search ||
            a.nom.toLowerCase().includes(t) ||
            a.description?.toLowerCase().includes(t)) &&
          (!cat || a.categorie === cat) &&
          (!opt || a.options === opt)
        );
      }),
    [appareils, search, cat, opt],
  );

  const handleSelect = useCallback((ap) => {
    setSelected(ap);
    setPreviewed(ap);
  }, []);
  const handlePreview = useCallback((ap) => setPreviewed(ap), []);
  const handleOrder = useCallback((ap) => {
    setSelected(ap);
    setOrderOpen(true);
  }, []);
  const handleSuccess = useCallback(
    (commande) => {
      setSelected(null);
      setPreviewed(null);
      if (onCommandeCreated) onCommandeCreated(commande);
      if (onSuccess) onSuccess("Commande créée avec succès");
    },
    [onCommandeCreated, onSuccess],
  );

  const hasFilters = search || cat || opt;
  const clearFilters = useCallback(() => {
    setSearch("");
    setCat("");
    setOpt("");
  }, []);

  return (
    <div className="pc-root">
      <button
        className="pc-mob-toggle"
        onClick={() => setMobileSidebar(!mobileSidebar)}
      >
        <SlidersHorizontal size={15} />
        Filtres{hasFilters && <span className="pc-dot" />}
      </button>

      <div className="pc-layout">
        <div className={`pc-sb-wrap${mobileSidebar ? " open" : ""}`}>
          <FilterSidebar
            search={search}
            cat={cat}
            opt={opt}
            onSearch={(e) => setSearch(e.target.value)}
            onCat={(e) => setCat(e.target.value)}
            onOpt={(e) => setOpt(e.target.value)}
            onClear={clearFilters}
            total={appareils.length}
            filtered={filtered.length}
          />
        </div>
        {mobileSidebar && (
          <div
            className="pc-backdrop"
            onClick={() => setMobileSidebar(false)}
          />
        )}

        <div className={`pc-main${previewed ? " has-panel" : ""}`}>
          <div className="pc-main-head">
            <div>
              <h1>Catalogue</h1>
              <p>Sélectionnez un appareil pour commander</p>
            </div>
            {selected && (
              <div className="pc-chip">
                <CheckCircle size={13} />
                {selected.nom}
                <button
                  onClick={() => {
                    setSelected(null);
                    setPreviewed(null);
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="pc-loading">
              <div className="pc-spinner" />
              <p>Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pc-empty">
              <Package size={48} />
              <h3>Aucun appareil</h3>
              <p>
                {hasFilters
                  ? "Modifiez les filtres."
                  : "Aucun appareil disponible."}
              </p>
            </div>
          ) : (
            <div className="pc-grid">
              {filtered.map((ap) => (
                <AppareilCard
                  key={ap.id}
                  appareil={ap}
                  isSelected={selected?.id === ap.id}
                  onSelect={handleSelect}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>

        {previewed && (
          <DetailPanel
            appareil={previewed}
            onClose={() => setPreviewed(null)}
            onOrder={handleOrder}
          />
        )}
      </div>

      {orderOpen && (
        <OrderModal
          appareil={selected}
          onClose={() => setOrderOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default PasserCommande;
