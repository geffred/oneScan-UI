/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
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
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import CommentSection from "./CommentSection";
import "./CommandeInfoGrid.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITERO_API_BASE_URL =
  "https://smilelabitero-api-production.up.railway.app";
const CSCONNECT_API_BASE_URL =
  "https://smilelabcsconnect-api-production.up.railway.app";

// Fonction pour récupérer les données de génération de bon de commande
const fetchCommandeData = async (externalId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/public/commandes/${externalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonction pour récupérer les données de fichiers (MeditLink)
const fetchMeditLinkOrderData = async (externalId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/meditlink/orders/${externalId}`,
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

  return response.json();
};

// Fonction pour récupérer les données de fichiers (3Shape)
const fetchThreeShapeOrderData = async (externalId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${API_BASE_URL}/threeshape/orders/${externalId}`,
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

  return response.json();
};

// Composant pour télécharger les fichiers CSConnect
const CSConnectFileDownloadButton = React.memo(
  ({ externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    const downloadCSConnectFile = async (externalId) => {
      console.log(`📥 Début du téléchargement CSConnect: ${externalId}`);

      try {
        const response = await fetch(
          `${CSCONNECT_API_BASE_URL}/api/csconnect/download/${externalId}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("📦 Réponse CSConnect:", result);

        if (result.status === "success" && result.filePath) {
          console.log(
            `✅ Fichier téléchargé avec succès sur le serveur: ${result.filePath}`
          );
          return result;
        } else {
          throw new Error(result.message || "Échec du téléchargement");
        }
      } catch (error) {
        console.error(
          "❌ Erreur détaillée lors du téléchargement CSConnect:",
          error
        );
        throw error;
      }
    };

    const handleDownload = async () => {
      if (!externalId || disabled) return;

      setIsDownloading(true);
      setDownloadError(null);

      try {
        const result = await downloadCSConnectFile(externalId);
        console.log(
          `✅ Fichier CSConnect ${externalId} téléchargé avec succès`
        );

        // Afficher un message de succès à l'utilisateur
        if (result.message) {
          alert(`✅ ${result.message}\n\nFichier: ${result.filePath}`);
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du fichier CSConnect ${externalId}:`,
          error
        );
        setDownloadError(error.message);
        alert(`❌ Erreur: ${error.message}`);
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <button
        className="details-scan-download-btn csconnect-file-btn"
        onClick={handleDownload}
        disabled={disabled || isLoading || isDownloading}
        title={`Télécharger le scan CSConnect ${externalId}`}
      >
        <Download size={16} />
        <div className="file-info">
          <span className="file-name">Scan CSConnect</span>
          <span className="file-details">Archive ZIP</span>
        </div>
        {isDownloading && (
          <div className="details-download-spinner-small"></div>
        )}
      </button>
    );
  }
);

// Composant pour télécharger les fichiers Itero
const IteroFileDownloadButton = React.memo(
  ({ externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadIteroFile = async (externalId) => {
      console.log(`📥 Début du téléchargement Itero: ${externalId}`);

      try {
        const response = await fetch(
          `${ITERO_API_BASE_URL}/api/itero/commandes/${externalId}/download-stl-file`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Le fichier téléchargé est vide (0 bytes)");
        }

        // Extraire le nom de fichier du header Content-Disposition
        let downloadFilename = `scan-itero-${externalId}.zip`;
        const contentDisposition = response.headers.get("content-disposition");

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        console.log(`💾 Nom de fichier final: ${downloadFilename}`);

        // Déclencher le téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = downloadFilename;

        document.body.appendChild(a);
        a.click();

        // Nettoyer
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        console.log("✅ Téléchargement Itero terminé avec succès");
        return blob;
      } catch (error) {
        console.error(
          "❌ Erreur détaillée lors du téléchargement Itero:",
          error
        );
        throw error;
      }
    };

    const handleDownload = async () => {
      if (!externalId || disabled) return;

      setIsDownloading(true);
      try {
        await downloadIteroFile(externalId);
        console.log(`✅ Fichier Itero ${externalId} téléchargé avec succès`);
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du fichier Itero ${externalId}:`,
          error
        );
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <button
        className="details-scan-download-btn itero-file-btn"
        onClick={handleDownload}
        disabled={disabled || isLoading || isDownloading}
        title={`Télécharger le scan Itero ${externalId}`}
      >
        <Download size={16} />
        <div className="file-info">
          <span className="file-name">Scan Itero</span>
          <span className="file-details">Archive ZIP</span>
        </div>
        {isDownloading && (
          <div className="details-download-spinner-small"></div>
        )}
      </button>
    );
  }
);

// Composant pour télécharger les fichiers MySmileLab
const MySmileLabFileDownloadButton = React.memo(
  ({ fileUrl, fileName, publicId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadMySmileLabFile = async (fileUrl, fileName) => {
      console.log(`📥 Début du téléchargement MySmileLab: ${fileName}`);

      try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Le fichier téléchargé est vide (0 bytes)");
        }

        // Déterminer le nom de fichier final
        let downloadFilename = fileName;

        // Vérifier l'extension du fichier
        if (
          !downloadFilename.toLowerCase().endsWith(".stl") &&
          !downloadFilename.toLowerCase().endsWith(".zip")
        ) {
          // Essayer d'extraire l'extension de l'URL ou utiliser .stl par défaut
          const urlExtension = fileUrl.split(".").pop().toLowerCase();
          if (urlExtension === "stl" || urlExtension === "zip") {
            downloadFilename =
              downloadFilename.replace(/\.[^/.]+$/, "") + "." + urlExtension;
          } else {
            downloadFilename =
              downloadFilename.replace(/\.[^/.]+$/, "") + ".stl";
          }
        }

        console.log(`💾 Nom de fichier final: ${downloadFilename}`);

        // Déclencher le téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = downloadFilename;

        document.body.appendChild(a);
        a.click();

        // Nettoyer
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        console.log("✅ Téléchargement MySmileLab terminé avec succès");
        return blob;
      } catch (error) {
        console.error(
          "❌ Erreur détaillée lors du téléchargement MySmileLab:",
          error
        );
        throw error;
      }
    };

    const handleDownload = async () => {
      if (!fileUrl || disabled) return;

      setIsDownloading(true);
      try {
        await downloadMySmileLabFile(fileUrl, fileName);
        console.log(`✅ Fichier MySmileLab ${fileName} téléchargé avec succès`);
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du fichier MySmileLab ${fileName}:`,
          error
        );
      } finally {
        setIsDownloading(false);
      }
    };

    const getFileTypeFromName = (filename) => {
      if (filename.toLowerCase().endsWith(".stl")) return "Fichier STL";
      if (filename.toLowerCase().endsWith(".zip")) return "Archive ZIP";
      return "Fichier 3D";
    };

    return (
      <button
        className="details-scan-download-btn mysmilelab-file-btn"
        onClick={handleDownload}
        disabled={disabled || isLoading || isDownloading}
        title={`Télécharger ${fileName} - ${getFileTypeFromName(fileName)}`}
      >
        <Download size={16} />
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <span className="file-details">{getFileTypeFromName(fileName)}</span>
        </div>
        {isDownloading && (
          <div className="details-download-spinner-small"></div>
        )}
      </button>
    );
  }
);

const GoogleDriveFileDownloadButton = React.memo(
  ({ fileUrl, fileName, fileId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadGoogleDriveFile = async (fileId, fileName) => {
      console.log(
        `📥 Début du téléchargement Google Drive via proxy: ${fileName}`
      );

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/files/download-drive/${fileId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Le fichier téléchargé est vide (0 bytes)");
        }

        // Déterminer le nom de fichier final
        let downloadFilename = fileName;

        // Vérifier l'extension du fichier
        if (
          !downloadFilename.toLowerCase().endsWith(".stl") &&
          !downloadFilename.toLowerCase().endsWith(".zip")
        ) {
          // Essayer d'extraire l'extension du Content-Disposition header
          const contentDisposition = response.headers.get(
            "content-disposition"
          );
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            if (filenameMatch && filenameMatch[1]) {
              downloadFilename = filenameMatch[1].replace(/['"]/g, "");
            }
          } else {
            // Fallback: utiliser .stl par défaut
            downloadFilename =
              downloadFilename.replace(/\.[^/.]+$/, "") + ".stl";
          }
        }

        console.log(`💾 Nom de fichier final: ${downloadFilename}`);

        // Déclencher le téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = downloadFilename;

        document.body.appendChild(a);
        a.click();

        // Nettoyer
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        console.log("✅ Téléchargement Google Drive terminé avec succès");
        return blob;
      } catch (error) {
        console.error("❌ Erreur détaillée lors du téléchargement:", error);
        throw error;
      }
    };

    const handleDownload = async () => {
      if (!fileId || disabled) return;

      setIsDownloading(true);
      try {
        await downloadGoogleDriveFile(fileId, fileName);
        console.log(
          `✅ Fichier Google Drive ${fileName} téléchargé avec succès`
        );
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du fichier Google Drive ${fileName}:`,
          error
        );
        // Fallback: ouvrir dans un nouvel onglet
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        }
      } finally {
        setIsDownloading(false);
      }
    };

    const handleViewInDrive = () => {
      if (fileId) {
        window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
      }
    };

    const getFileTypeFromName = (filename) => {
      if (filename.toLowerCase().endsWith(".stl")) return "Fichier STL";
      if (filename.toLowerCase().endsWith(".zip")) return "Archive ZIP";
      return "Fichier 3D";
    };

    return (
      <div className="google-drive-file-item">
        <button
          className="details-scan-download-btn google-drive-download-btn"
          onClick={handleDownload}
          disabled={disabled || isLoading || isDownloading}
          title={`Télécharger ${fileName}`}
        >
          <Download size={16} />
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-details">
              {getFileTypeFromName(fileName)}
            </span>
          </div>
          {isDownloading && (
            <div className="details-download-spinner-small"></div>
          )}
        </button>

        {fileId && (
          <button
            className="google-drive-view-btn"
            onClick={handleViewInDrive}
            title="Voir dans Google Drive"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>
    );
  }
);

const MeditLinkFileDownloadButton = React.memo(
  ({ file, externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadMeditLinkFile = async (fileUuid, fileName, externalId) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      console.log(
        `📥 Début du téléchargement MeditLink: ${fileName} (UUID: ${fileUuid})`
      );

      try {
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
          const errorText = await infoResponse.text();
          console.error(
            `❌ Erreur info fichier: ${infoResponse.status}`,
            errorText
          );
          throw new Error(
            `Erreur ${infoResponse.status}: ${infoResponse.statusText}`
          );
        }

        const fileInfo = await infoResponse.json();
        console.log("📄 Infos fichier reçues:", fileInfo);

        const downloadUrl = fileInfo.url || fileInfo.downloadUrl;

        if (!downloadUrl) {
          console.error(
            "❌ Aucune URL de téléchargement dans la réponse:",
            fileInfo
          );
          throw new Error(
            "URL de téléchargement non disponible dans la réponse"
          );
        }

        console.log(`🔗 Téléchargement depuis: ${downloadUrl}`);

        // Étape 2: Télécharger le fichier depuis l'URL fournie
        const downloadResponse = await fetch(downloadUrl);

        if (!downloadResponse.ok) {
          console.error(`❌ Erreur téléchargement: ${downloadResponse.status}`);
          throw new Error(
            `Erreur de téléchargement ${downloadResponse.status}: ${downloadResponse.statusText}`
          );
        }

        const blob = await downloadResponse.blob();
        console.log(
          `✅ Blob créé - Taille: ${blob.size} bytes, Type: ${blob.type}`
        );

        if (blob.size === 0) {
          throw new Error("Le fichier téléchargé est vide (0 bytes)");
        }

        // Étape 3: Créer le nom de fichier final
        let downloadFilename = fileInfo.downloadFileName || fileName;

        // Vérifier l'extension du fichier
        if (
          !downloadFilename.toLowerCase().endsWith(".stl") &&
          !downloadFilename.toLowerCase().endsWith(".7z") &&
          !downloadFilename.toLowerCase().endsWith(".zip")
        ) {
          downloadFilename = downloadFilename.replace(/\.[^/.]+$/, "") + ".stl";
        }

        console.log(`💾 Nom de fichier final: ${downloadFilename}`);

        // Étape 4: Déclencher le téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = downloadFilename;

        document.body.appendChild(a);
        a.click();

        // Nettoyer
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        console.log("✅ Téléchargement terminé avec succès");
        return blob;
      } catch (error) {
        console.error("❌ Erreur détaillée lors du téléchargement:", error);
        throw error;
      }
    };

    const handleDownload = async () => {
      if (!file.uuid || disabled) return;

      setIsDownloading(true);
      try {
        await downloadMeditLinkFile(file.uuid, file.name, externalId);
        console.log(`✅ Fichier ${file.name} téléchargé avec succès`);
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du fichier ${file.name}:`,
          error
        );
      } finally {
        setIsDownloading(false);
      }
    };

    const getFileTypeLabel = (fileType) => {
      switch (fileType) {
        case "SCAN_DATA":
          return "Scan 3D";
        case "ATTACHED_DATA":
          return "Fichier attaché";
        default:
          return "Fichier";
      }
    };

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return "Taille inconnue";
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
        title={`Télécharger ${file.name} (${formatFileSize(
          file.size
        )}) - ${getFileTypeLabel(file.fileType)}`}
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

const ThreeShapeFileDownloadButton = React.memo(
  ({ hash, label, externalId, disabled, isLoading }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadThreeShapeFile = async (externalId, hash, filename) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      console.log(
        `📥 Début du téléchargement 3Shape: ${label} (Hash: ${hash})`
      );

      const response = await fetch(
        `${API_BASE_URL}/threeshape/files/${externalId}/${hash}`,
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

        await downloadThreeShapeFile(externalId, hash, filename);
        console.log(`✅ Scan ${label} téléchargé avec succès`);
      } catch (error) {
        console.error(
          `❌ Erreur lors du téléchargement du scan ${label}:`,
          error
        );
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
  const [threeShapeFiles, setThreeShapeFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadKey, setFileLoadKey] = useState(0);

  const isThreeShape = commande && commande.plateforme === "THREESHAPE";
  const isMeditLink = commande && commande.plateforme === "MEDITLINK";
  const isMySmileLab = commande && commande.plateforme === "MYSMILELAB";
  const isItero = commande && commande.plateforme === "ITERO";
  const isCSConnect = commande && commande.plateforme === "CSCONNECT";

  // Fonction pour récupérer les fichiers MeditLink
  const fetchMeditLinkFiles = async () => {
    if (!isMeditLink || !commande.externalId) return;

    setIsLoadingFiles(true);
    try {
      console.log(
        `🔍 Récupération des fichiers MeditLink pour: ${commande.externalId}`
      );
      const orderData = await fetchMeditLinkOrderData(commande.externalId);

      console.log("📦 Données de commande MeditLink reçues:", orderData);

      // Extraire les fichiers du cas
      if (
        orderData.order &&
        orderData.order.case &&
        orderData.order.case.files
      ) {
        const files = orderData.order.case.files;
        console.log(
          `📁 ${files.length} fichier(s) trouvé(s) dans la commande:`,
          files
        );

        // Filtrer les fichiers pertinents (SCAN_DATA et ATTACHED_DATA avec STL)
        const relevantFiles = files.filter(
          (file) =>
            file.fileType === "SCAN_DATA" ||
            (file.fileType === "ATTACHED_DATA" &&
              (file.name.toLowerCase().includes(".stl") ||
                file.name.toLowerCase().includes(".scan")))
        );

        console.log(
          `🔧 ${relevantFiles.length} fichier(s) pertinent(s) après filtrage:`,
          relevantFiles
        );
        setMeditLinkFiles(relevantFiles);
      } else {
        console.warn("⚠️ Aucun fichier trouvé dans la commande MeditLink");
        setMeditLinkFiles([]);
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des fichiers MeditLink:",
        error
      );
      setMeditLinkFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Fonction pour récupérer les fichiers 3Shape
  const fetchThreeShapeFiles = async () => {
    if (!isThreeShape || !commande.externalId) return;

    setIsLoadingFiles(true);
    try {
      console.log(
        `🔍 Récupération des fichiers 3Shape pour: ${commande.externalId}`
      );
      const orderData = await fetchThreeShapeOrderData(commande.externalId);

      console.log("📦 Données de commande 3Shape reçues:", orderData);

      // Traiter les fichiers 3Shape selon la structure de l'API
      if (orderData.files && Array.isArray(orderData.files)) {
        console.log(
          `📁 ${orderData.files.length} fichier(s) 3Shape trouvé(s):`,
          orderData.files
        );
        setThreeShapeFiles(orderData.files);
      } else {
        console.warn("⚠️ Aucun fichier trouvé dans la commande 3Shape");
        setThreeShapeFiles([]);
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des fichiers 3Shape:",
        error
      );
      setThreeShapeFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Charger les fichiers selon la plateforme
  useEffect(() => {
    if (isMeditLink) {
      fetchMeditLinkFiles();
    } else if (isThreeShape) {
      fetchThreeShapeFiles();
    }
  }, [isMeditLink, isThreeShape, commande.externalId, fileLoadKey]);

  // Fonction pour recharger les fichiers
  const handleReloadFiles = () => {
    console.log("🔄 Rechargement des fichiers demandé");
    setFileLoadKey((prev) => prev + 1);
  };

  // Fonction pour extraire les fichiers MySmileLab de la commande
  const getMySmileLabFiles = () => {
    if (
      !isMySmileLab ||
      !commande.fichierUrls ||
      !Array.isArray(commande.fichierUrls)
    ) {
      return [];
    }

    return commande.fichierUrls.map((fileUrl, index) => {
      // Extraire le nom de fichier de l'URL ou utiliser un nom par défaut
      let fileName = `fichier-${index + 1}`;
      try {
        const urlParts = fileUrl.split("/");
        fileName = urlParts[urlParts.length - 1];
        // Nettoyer le nom de fichier (supprimer les paramètres d'URL)
        fileName = fileName.split("?")[0];
      } catch (error) {
        console.warn(
          "Impossible d'extraire le nom de fichier de l'URL:",
          fileUrl
        );
      }

      // Récupérer le publicId correspondant s'il existe
      const publicId =
        commande.fichierPublicIds && Array.isArray(commande.fichierPublicIds)
          ? commande.fichierPublicIds[index]
          : null;

      return {
        url: fileUrl,
        name: fileName,
        publicId: publicId,
        index: index,
      };
    });
  };

  const mySmileLabFiles = getMySmileLabFiles();

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
            <span className="details-item-value">{commande.dateReception}</span>
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
          <div className="details-card-header-title">
            <FileText size={20} />
            <h3>Informations Techniques</h3>
          </div>
          {!isItero && !isCSConnect && (
            <button
              className="details-reload-files-btn"
              onClick={handleReloadFiles}
              disabled={isLoadingFiles}
              title="Recharger les fichiers"
            >
              <RefreshCw
                size={16}
                className={isLoadingFiles ? "spinning" : ""}
              />
            </button>
          )}
        </div>
        <div className="details-card-content">
          <div className="details-item">
            <span className="details-item-label">ID externe :</span>
            <span className="details-external-id">{commande.externalId}</span>
          </div>

          <div className="details-item">
            <span className="details-item-label">Numéro de suivi :</span>
            <span className="details-external-id">{commande.numeroSuivi}</span>
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

          {/* Affichage des fichiers CSConnect */}
          {isCSConnect && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers 3D disponibles :
              </span>
              <div className="details-scans-container csconnect-files-container">
                <CSConnectFileDownloadButton
                  externalId={commande.externalId}
                  disabled={false}
                  isLoading={false}
                />
              </div>
            </div>
          )}

          {/* Affichage des fichiers Itero */}
          {isItero && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers 3D disponibles :
              </span>
              <div className="details-scans-container itero-files-container">
                <IteroFileDownloadButton
                  externalId={commande.externalId}
                  disabled={false}
                  isLoading={false}
                />
              </div>
            </div>
          )}

          {/* Affichage des fichiers 3Shape */}
          {isThreeShape && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers 3D disponibles :
                {isLoadingFiles && (
                  <span className="loading-text"> (Chargement...)</span>
                )}
              </span>
              <div className="details-scans-container">
                {commande.hash_upper && (
                  <ThreeShapeFileDownloadButton
                    hash={commande.hash_upper}
                    label="Upper"
                    externalId={commande.externalId}
                    disabled={actionStates.downloadUpper || isLoadingFiles}
                    isLoading={actionStates.downloadUpper || isLoadingFiles}
                  />
                )}
                {commande.hash_lower && (
                  <ThreeShapeFileDownloadButton
                    hash={commande.hash_lower}
                    label="Lower"
                    externalId={commande.externalId}
                    disabled={actionStates.downloadLower || isLoadingFiles}
                    isLoading={actionStates.downloadLower || isLoadingFiles}
                  />
                )}
                {threeShapeFiles.length > 0 &&
                  threeShapeFiles.map((file, index) => (
                    <ThreeShapeFileDownloadButton
                      key={index}
                      hash={file.hash}
                      label={file.name || `Fichier ${index + 1}`}
                      externalId={commande.externalId}
                      disabled={isLoadingFiles}
                      isLoading={isLoadingFiles}
                    />
                  ))}
                {!commande.hash_upper &&
                  !commande.hash_lower &&
                  threeShapeFiles.length === 0 &&
                  !isLoadingFiles && (
                    <span className="no-files-message">
                      Aucun fichier 3D disponible
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* Affichage des fichiers MeditLink */}
          {isMeditLink && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers 3D disponibles :
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
                        Aucun fichier 3D disponible
                      </span>
                    )}
              </div>
            </div>
          )}

          {/* Affichage des fichiers MySmileLab */}
          {isMySmileLab && (
            <div className="details-item">
              <span className="details-item-label">
                Fichiers 3D disponibles sur Google Drive :
                {mySmileLabFiles.length > 0 &&
                  ` (${mySmileLabFiles.length} fichier(s))`}
              </span>
              <div className="details-scans-container google-drive-files-container">
                {mySmileLabFiles.length > 0 ? (
                  mySmileLabFiles.map((file, index) => (
                    <GoogleDriveFileDownloadButton
                      key={index}
                      fileUrl={file.url}
                      fileName={file.name}
                      fileId={file.publicId}
                      disabled={false}
                      isLoading={false}
                    />
                  ))
                ) : (
                  <span className="no-files-message">
                    Aucun fichier 3D disponible pour cette commande
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
