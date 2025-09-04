import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Folder,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  File,
  Database,
  Clock,
  Tag,
} from "lucide-react";
import "./MeditLinkCases.css";

const MeditLinkCases = () => {
  // États pour les données
  const [cases, setCases] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [caseFiles, setCaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // États pour la pagination et filtres
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCases, setTotalCases] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // États pour la modal
  const [showCaseDetail, setShowCaseDetail] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  // Vérification de l'authentification MeditLink
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/meditlink/auth/status", {
        credentials: "include",
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);

      if (data.authenticated) {
        loadCases();
      }
    } catch (error) {
      console.error("Erreur vérification auth MeditLink:", error);
      setIsAuthenticated(false);
    }
  };

  const loadCases = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meditlink/cases`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.content || data); // MeditLink peut retourner data.content pour la pagination
        setTotalCases(data.totalElements || data.length || 0);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setError("Session MeditLink expirée. Veuillez vous reconnecter.");
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (err) {
      setError(`Erreur lors du chargement des cas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCases();
    }
  }, [loadCases]);

  const saveCasesToDatabase = async (startPage = 0, endPage = 2) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/meditlink/cases/save?startPage=${startPage}&endPage=${endPage}&size=${pageSize}`,
        { credentials: "include" }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `${result.savedCount} nouveaux cas sauvegardés (${result.totalProcessed} traités) 
          sur ${result.pagesProcessed} pages`
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Erreur sauvegarde: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const viewCaseDetails = async (caseData) => {
    setLoading(true);
    try {
      // Charger les détails complets du cas
      const response = await fetch(`/api/meditlink/cases/${caseData.uuid}`, {
        credentials: "include",
      });

      if (response.ok) {
        const fullCaseData = await response.json();
        setCurrentCase(fullCaseData);

        // Charger les fichiers du cas
        const filesResponse = await fetch(
          `/api/meditlink/cases/${caseData.uuid}/files`,
          {
            credentials: "include",
          }
        );

        if (filesResponse.ok) {
          const files = await filesResponse.json();
          setCaseFiles(files);
        }

        setShowCaseDetail(true);
      } else {
        throw new Error("Impossible de charger les détails du cas");
      }
    } catch (err) {
      setError(`Erreur chargement détails: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (
    caseUuid,
    fileUuid,
    fileName,
    fileType = "obj"
  ) => {
    const fileKey = `${caseUuid}-${fileUuid}`;
    setDownloadingFiles((prev) => new Set(prev).add(fileKey));

    try {
      const response = await fetch(
        `/api/meditlink/cases/${caseUuid}/files/${fileUuid}/download?type=${fileType}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || `${fileUuid}.${fileType}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccess(`Fichier ${fileName} téléchargé`);
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (err) {
      setError(`Erreur téléchargement: ${err.message}`);
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      !searchTerm ||
      caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.patient?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      caseItem.patient?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scan":
        return "status-scan";
      case "complete":
        return "status-complete";
      case "processing":
        return "status-processing";
      default:
        return "status-default";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="meditlink-cases-container">
        <div className="auth-required">
          <Shield size={48} />
          <h2>Authentification MeditLink requise</h2>
          <p>
            Veuillez vous connecter à MeditLink via OAuth dans la section
            Plateformes.
          </p>
          <button onClick={checkAuthStatus} className="btn-primary">
            <RefreshCw size={16} />
            Vérifier l'authentification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meditlink-cases-container">
      {/* Header */}
      <div className="cases-header">
        <div className="header-title">
          <Shield size={24} />
          <h1>Cas MeditLink</h1>
          <span className="cases-count">
            {totalCases > 0 ? `${totalCases} cas` : ""}
          </span>
        </div>
        <div className="header-actions">
          <button
            onClick={() => saveCasesToDatabase(0, 2)}
            disabled={saving}
            className="btn-secondary"
          >
            <Database size={16} />
            {saving ? "Sauvegarde..." : "Sauvegarder en BDD"}
          </button>
          <button
            onClick={() => loadCases()}
            disabled={loading}
            className="btn-primary"
          >
            <RefreshCw size={16} className={loading ? "spinning" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="message success">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="cases-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom de cas ou patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="page-size-selector">
          <label>Afficher:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>par page</span>
        </div>
      </div>

      {/* Liste des cas */}
      <div className="cases-grid">
        {loading ? (
          <div className="loading-spinner">
            <RefreshCw size={24} className="spinning" />
            <p>Chargement des cas...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-state">
            <Folder size={48} />
            <h3>Aucun cas trouvé</h3>
            <p>
              {searchTerm
                ? "Aucun cas ne correspond à votre recherche."
                : "Aucun cas MeditLink disponible."}
            </p>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div key={caseItem.uuid} className="case-card">
              <div className="case-header">
                <h3 className="case-name">{caseItem.name}</h3>
                <span
                  className={`case-status ${getStatusColor(caseItem.status)}`}
                >
                  {caseItem.status}
                </span>
              </div>

              <div className="case-content">
                <div className="case-info">
                  <div className="info-row">
                    <User size={14} />
                    <span>
                      {caseItem.patient?.name || "N/A"}
                      {caseItem.patient?.code && ` (${caseItem.patient.code})`}
                    </span>
                  </div>
                  <div className="info-row">
                    <Calendar size={14} />
                    <span>Créé: {formatDate(caseItem.dateCreated)}</span>
                  </div>
                  <div className="info-row">
                    <Clock size={14} />
                    <span>Scanné: {formatDate(caseItem.dateScanned)}</span>
                  </div>
                  {caseItem.tags && caseItem.tags.length > 0 && (
                    <div className="info-row">
                      <Tag size={14} />
                      <span>{caseItem.tags.join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="case-files-info">
                  <div className="files-count">
                    <File size={14} />
                    <span>{caseItem.files?.length || 0} fichiers</span>
                  </div>
                </div>
              </div>

              <div className="case-actions">
                <button
                  onClick={() => viewCaseDetails(caseItem)}
                  className="btn-secondary btn-small"
                >
                  <Eye size={14} />
                  Détails
                </button>
                {caseItem.files && caseItem.files.length > 0 && (
                  <button
                    onClick={() => viewCaseDetails(caseItem)}
                    className="btn-primary btn-small"
                  >
                    <Download size={14} />
                    Fichiers
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalCases > pageSize && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="btn-pagination"
          >
            <ChevronLeft size={16} />
            Précédent
          </button>
          <span className="page-info">
            Page {currentPage + 1} sur {Math.ceil(totalCases / pageSize)}
          </span>
          <button
            onClick={() =>
              setCurrentPage(
                Math.min(Math.ceil(totalCases / pageSize) - 1, currentPage + 1)
              )
            }
            disabled={currentPage >= Math.ceil(totalCases / pageSize) - 1}
            className="btn-pagination"
          >
            Suivant
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal détails du cas */}
      {showCaseDetail && currentCase && (
        <div className="modal-overlay">
          <div className="modal-content case-detail-modal">
            <div className="modal-header">
              <h2>{currentCase.name}</h2>
              <button
                onClick={() => setShowCaseDetail(false)}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="case-details">
                <div className="detail-section">
                  <h3>Informations patient</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Nom:</strong> {currentCase.patient?.name || "N/A"}
                    </div>
                    <div>
                      <strong>Code:</strong>{" "}
                      {currentCase.patient?.code || "N/A"}
                    </div>
                    <div>
                      <strong>Statut:</strong>
                      <span
                        className={`case-status ${getStatusColor(
                          currentCase.status
                        )}`}
                      >
                        {currentCase.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Dates</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Créé:</strong>{" "}
                      {formatDate(currentCase.dateCreated)}
                    </div>
                    <div>
                      <strong>Scanné:</strong>{" "}
                      {formatDate(currentCase.dateScanned)}
                    </div>
                    <div>
                      <strong>Modifié:</strong>{" "}
                      {formatDate(currentCase.dateUpdated)}
                    </div>
                  </div>
                </div>

                {currentCase.tags && currentCase.tags.length > 0 && (
                  <div className="detail-section">
                    <h3>Tags</h3>
                    <div className="tags-list">
                      {currentCase.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Fichiers ({caseFiles.length})</h3>
                  <div className="files-list">
                    {caseFiles.map((file) => {
                      const fileKey = `${currentCase.uuid}-${file.uuid}`;
                      const isDownloading = downloadingFiles.has(fileKey);

                      return (
                        <div key={file.uuid} className="file-item">
                          <div className="file-info">
                            <File size={16} />
                            <div>
                              <div className="file-name">{file.name}</div>
                              <div className="file-meta">
                                {(file.size / 1024 / 1024).toFixed(2)} MB •
                                Créé: {formatDate(file.dateCreated)}
                              </div>
                            </div>
                          </div>
                          <div className="file-actions">
                            <button
                              onClick={() =>
                                downloadFile(
                                  currentCase.uuid,
                                  file.uuid,
                                  file.name,
                                  "obj"
                                )
                              }
                              disabled={isDownloading}
                              className="btn-download"
                            >
                              {isDownloading ? (
                                <RefreshCw size={14} className="spinning" />
                              ) : (
                                <Download size={14} />
                              )}
                              OBJ
                            </button>
                            <button
                              onClick={() =>
                                downloadFile(
                                  currentCase.uuid,
                                  file.uuid,
                                  file.name,
                                  "stl"
                                )
                              }
                              disabled={isDownloading}
                              className="btn-download"
                            >
                              {isDownloading ? (
                                <RefreshCw size={14} className="spinning" />
                              ) : (
                                <Download size={14} />
                              )}
                              STL
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowCaseDetail(false)}
                className="btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditLinkCases;
