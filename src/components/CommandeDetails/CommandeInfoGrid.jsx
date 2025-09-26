import React, { useState, useEffect } from "react";
import {
  User,
  Building,
  Server,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  ChevronDown,
  Download,
} from "lucide-react";
import CommentSection from "./CommentSection";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MeditLinkFileDownloadButton = React.memo(
  ({ file, externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadMeditLinkFile = async (fileUuid, fileName, externalId) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      // Étape 1: Récupérer les informations de téléchargement
      const infoResponse = await fetch(
        `${API_BASE_URL}/meditlink/files/${fileUuid}?type=stl`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!infoResponse.ok) {
        throw new Error(
          `Erreur ${infoResponse.status}: ${infoResponse.statusText}`
        );
      }

      const fileInfo = await infoResponse.json();

      if (!fileInfo.downloadUrl) {
        throw new Error("URL de téléchargement non disponible");
      }

      // Étape 2: Télécharger le fichier depuis l'URL fournie
      const downloadResponse = await fetch(fileInfo.downloadUrl);

      if (!downloadResponse.ok) {
        throw new Error(
          `Erreur de téléchargement ${downloadResponse.status}: ${downloadResponse.statusText}`
        );
      }

      const blob = await downloadResponse.blob();

      if (blob.size === 0) {
        throw new Error("Le fichier téléchargé est vide");
      }

      // Étape 3: Créer le nom de fichier final
      let downloadFilename = fileInfo.downloadFileName || fileName;

      // Si le fichier téléchargé est un .7z, on garde ce format
      // Sinon on utilise le nom original avec extension .stl
      if (
        !downloadFilename.toLowerCase().endsWith(".7z") &&
        !downloadFilename.toLowerCase().endsWith(".stl")
      ) {
        downloadFilename = downloadFilename.replace(/\.[^/.]+$/, "") + ".stl";
      }

      // Étape 4: Déclencher le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = downloadFilename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      return blob;
    };

    const handleDownload = async () => {
      if (!file.uuid || disabled) return;

      setIsDownloading(true);
      try {
        await downloadMeditLinkFile(file.uuid, file.name, externalId);
        // toast.success(`Fichier ${file.name} téléchargé avec succès`);
      } catch (error) {
        console.error(
          `Erreur lors du téléchargement du fichier ${file.name}:`,
          error
        );
        // toast.error(`Erreur lors du téléchargement du fichier ${file.name}: ${error.message}`);
      } finally {
        setIsDownloading(false);
      }
    };

    const getFileTypeLabel = (fileType) => {
      switch (fileType) {
        case "SCAN_DATA":
          return "Scan";
        case "ATTACHED_DATA":
          return "Fichier";
        default:
          return "Fichier";
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
      <button
        className="details-scan-download-btn meditlink-file-btn"
        onClick={handleDownload}
        disabled={disabled || isLoading || isDownloading}
        title={`Télécharger ${file.name} (${formatFileSize(file.size)})`}
      >
        <Download size={16} />
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-details">
            {getFileTypeLabel(file.fileType)} - {formatFileSize(file.size)}
          </span>
        </div>
        {isDownloading && (
          <div className="details-download-spinner-small"></div>
        )}
      </button>
    );
  }
);

const ScanDownloadButton = React.memo(
  ({ hash, label, externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadScanByHash = async (externalId, hash, filename) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch(
        `${API_BASE_URL}/cases/${externalId}/attachments/${hash}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const contentDisposition = response.headers.get("content-disposition");
      const customFilename = response.headers.get("x-filename");

      let downloadFilename = filename;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, "");
        }
      } else if (customFilename) {
        downloadFilename = customFilename;
      }

      if (!downloadFilename.toLowerCase().endsWith(".stl")) {
        downloadFilename = downloadFilename.replace(/\.[^/.]+$/, "") + ".stl";
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Le fichier téléchargé est vide");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = downloadFilename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      return blob;
    };

    const handleDownload = async () => {
      if (!hash || disabled) return;

      setIsDownloading(true);
      try {
        const filename = `scan-${label.toLowerCase()}-${externalId}-${hash.substring(
          0,
          8
        )}.stl`;

        await downloadScanByHash(externalId, hash, filename);
        // toast.success(`Scan ${label} téléchargé avec succès`);
      } catch (error) {
        console.error(`Erreur lors du téléchargement du scan ${label}:`, error);
        // toast.error(`Erreur lors du téléchargement du scan ${label}: ${error.message}`);
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <button
        className="details-scan-download-btn"
        onClick={handleDownload}
        disabled={disabled || isLoading || isDownloading}
        title={
          hash
            ? `Télécharger le scan ${label} (${hash.substring(0, 8)}...)`
            : `Scan ${label} non disponible`
        }
      >
        <Download size={16} />
        {isDownloading ? "Téléchargement..." : `Scan ${label}`}
        {isDownloading && (
          <div className="details-download-spinner-small"></div>
        )}
      </button>
    );
  }
);

const StatusDropdown = React.memo(
  ({ currentStatus, onStatusChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
      { value: "EN_ATTENTE", label: "En attente" },
      { value: "EN_COURS", label: "En cours" },
      { value: "TERMINEE", label: "Terminée" },
      { value: "EXPEDIEE", label: "Expédiée" },
      { value: "ANNULEE", label: "Annulée" },
    ];

    const handleStatusSelect = (status) => {
      onStatusChange(status);
      setIsOpen(false);
    };

    const getCurrentStatusLabel = () => {
      const status = statusOptions.find((s) => s.value === currentStatus);
      return status ? status.label : "Statut inconnu";
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest(".status-dropdown")) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="status-dropdown">
        <button
          className="status-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Edit size={16} />
          {getCurrentStatusLabel()}
          <ChevronDown
            size={16}
            className={`status-dropdown-chevron ${isOpen ? "open" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="status-dropdown-menu">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`status-dropdown-item ${
                  currentStatus === status.value ? "active" : ""
                }`}
                onClick={() => handleStatusSelect(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

const CommandeInfoGrid = ({
  commande,
  echeanceStatus,
  plateformeColor,
  formatDate,
  handleStatusChange,
  actionStates,
  isCommentLoading,
  finalCommentaire,
  mutateCommande,
  mutateCommandes,
  mutateCommentaire,
  showNotification,
}) => {
  const [meditLinkFiles, setMeditLinkFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const isThreeShape = commande && commande.plateforme === "THREESHAPE";
  const isMeditLink = commande && commande.plateforme === "MEDITLINK";

  // Fonction pour récupérer les fichiers MeditLink
  const fetchMeditLinkFiles = async () => {
    if (!isMeditLink || !commande.externalId) return;

    setIsLoadingFiles(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch(
        `${API_BASE_URL}/meditlink/orders/${commande.externalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const orderData = await response.json();

      // Extraire les fichiers du cas
      if (orderData.case && orderData.case.files) {
        // Filtrer seulement les fichiers de type SCAN_DATA pour les STL
        const scanFiles = orderData.case.files.filter(
          (file) =>
            file.fileType === "SCAN_DATA" ||
            (file.fileType === "ATTACHED_DATA" &&
              file.name.toLowerCase().includes(".stl"))
        );
        setMeditLinkFiles(scanFiles);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des fichiers MeditLink:",
        error
      );
      // toast.error("Impossible de récupérer les fichiers MeditLink");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Charger les fichiers MeditLink au montage du composant
  useEffect(() => {
    if (isMeditLink) {
      fetchMeditLinkFiles();
    }
  }, [isMeditLink, commande.externalId]);

  return (
    <div className="details-info-grid">
      {/* Informations patient */}
      <div className="details-info-card">
        <div className="details-card-header">
          <User size={20} />
          <h3>Informations Patient</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Référence Patient :</span>
            <span className="details-item-value">
              {commande.refPatient || "Non spécifiée"}
            </span>
          </div>
        </div>
      </div>

      {/* Informations cabinet */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Building size={20} />
          <h3>Cabinet</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Nom du cabinet :</span>
            <span className="details-item-value">{commande.cabinet}</span>
          </div>
        </div>
      </div>

      {/* Plateforme */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Server size={20} />
          <h3>Plateforme</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Source :</span>
            <span
              className={`details-platform-badge commandes-plateforme-${plateformeColor}`}
            >
              {commande.plateforme}
            </span>
          </div>
        </div>
      </div>

      {/* Dates importantes */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Calendar size={20} />
          <h3>Dates</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">Date de réception :</span>
            <span className="details-item-value">
              {formatDate(commande.dateReception)}
            </span>
          </div>
          <div className="details-item">
            <span className="details-item-label">Date d'échéance :</span>
            <span className="details-item-value">
              {formatDate(commande.dateEcheance)}
            </span>
          </div>
        </div>
      </div>

      {/* Statut avec dropdown */}
      <div className="details-info-card">
        <div className="details-card-header">
          <Clock size={20} />
          <h3>Statut</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">État de la commande :</span>
            <span
              className={`details-status-badge commandes-status-${echeanceStatus.class}`}
            >
              {echeanceStatus.label}
            </span>
          </div>
          <div className="details-item">
            <span className="details-item-label">Statut de traitement :</span>
            <StatusDropdown
              currentStatus={commande.status || commande.statut || "EN_ATTENTE"}
              onStatusChange={handleStatusChange}
              isLoading={actionStates.updateStatus}
            />
          </div>
          <div className="details-item">
            <span className="details-item-label">Lecture :</span>
            <span className="details-item-value">
              {commande.vu ? (
                <span className="details-read-status">
                  <CheckCircle size={16} className="details-read-icon" />
                  Lue
                </span>
              ) : (
                <span className="details-unread-status">
                  <AlertCircle size={16} className="details-unread-icon" />
                  Non lue
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Commentaire avec édition */}
      <CommentSection
        commentaire={finalCommentaire}
        isLoading={isCommentLoading}
        commande={commande}
        mutateCommande={mutateCommande}
        mutateCommandes={mutateCommandes}
        mutateCommentaire={mutateCommentaire}
        showNotification={showNotification}
      />

      {/* Informations techniques */}
      <div className="details-info-card">
        <div className="details-card-header">
          <FileText size={20} />
          <h3>Informations Techniques</h3>
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">ID externe :</span>
            <span className="details-external-id">#{commande.externalId}</span>
          </div>

          <div className="details-item">
            <span className="details-item-label">Numéro de suivi :</span>
            <span className="details-external-id">#{commande.numeroSuivi}</span>
          </div>

          <div className="details-item">
            <span className="details-item-label">ID interne :</span>
            <span className="details-item-value">{commande.id}</span>
          </div>

          {commande.typeAppareil && (
            <div className="details-item">
              <span className="details-item-label">Type d'appareil :</span>
              <span className="details-item-value">
                {commande.typeAppareil}
              </span>
            </div>
          )}

          {/* Affichage des hash des scans ThreeShape */}
          {isThreeShape && (commande.hash_upper || commande.hash_lower) && (
            <div className="details-item">
              <span className="details-item-label">Scans disponibles :</span>
              <div className="details-scans-container">
                {commande.hash_upper && (
                  <ScanDownloadButton
                    hash={commande.hash_upper}
                    label="Upper"
                    externalId={commande.externalId}
                    disabled={actionStates.downloadUpper}
                    isLoading={actionStates.downloadUpper}
                  />
                )}
                {commande.hash_lower && (
                  <ScanDownloadButton
                    hash={commande.hash_lower}
                    label="Lower"
                    externalId={commande.externalId}
                    disabled={actionStates.downloadLower}
                    isLoading={actionStates.downloadLower}
                  />
                )}
              </div>
            </div>
          )}

          {/* Affichage des fichiers MeditLink */}
          {isMeditLink && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers disponibles :
                {isLoadingFiles && (
                  <span className="loading-text"> (Chargement...)</span>
                )}
              </span>
              <div className="details-scans-container meditlink-files-container">
                {meditLinkFiles.length > 0
                  ? meditLinkFiles.map((file) => (
                      <MeditLinkFileDownloadButton
                        key={file.uuid}
                        file={file}
                        externalId={commande.externalId}
                        disabled={isLoadingFiles}
                        isLoading={isLoadingFiles}
                      />
                    ))
                  : !isLoadingFiles && (
                      <span className="no-files-message">
                        Aucun fichier disponible
                      </span>
                    )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandeInfoGrid;
