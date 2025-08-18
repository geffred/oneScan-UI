import React, { useState } from "react";
import { Upload, FileCheck, X, Loader, Settings, Play } from "lucide-react";
import "./socles.css";

const Socles = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSocleType, setSelectedSocleType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const socleTypes = [
    {
      value: "standard",
      label: "Socle Standard",
      description: "Socle basique pour modèles simples",
    },
  ];

  const handleFileUpload = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validExtensions = [".stl", ".obj", ".ply", ".3mf"];
      return validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
    });

    if (validFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulation du upload avec barre de progression
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadedFiles((prev) => [
              ...prev,
              ...validFiles.map((file) => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
              })),
            ]);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFileUpload(files);
  };

  const removeFile = (fileId) => {
    setUploadedFiles((files) => files.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleGenerateSocle = () => {
    if (uploadedFiles.length === 0 || !selectedSocleType) return;

    setIsGenerating(true);
    // Simulation de la génération
    setTimeout(() => {
      setIsGenerating(false);
      alert("Socle généré avec succès !");
    }, 3000);
  };

  return (
    <div className="socles-main-container">
      <div className="socles-header-section">
        <h2 className="socles-page-title">Génération de Socles 3D</h2>
        <p className="socles-page-subtitle">
          Uploadez vos fichiers 3D et générez automatiquement des socles
          personnalisés
        </p>
      </div>

      <div className="socles-content-grid">
        {/* Section Upload de fichiers */}
        <div className="socles-upload-section">
          <h3 className="socles-section-title">
            <Upload size={20} />
            Upload de fichiers 3D
          </h3>

          <div
            className={`socles-drop-zone ${
              isDragOver ? "socles-drop-zone-active" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="socles-drop-zone-content">
              <Upload size={48} className="socles-upload-icon" />
              <h4>Glissez-déposez vos fichiers 3D ici</h4>
              <p>ou cliquez pour sélectionner</p>
              <input
                type="file"
                multiple
                accept=".stl,.obj,.ply,.3mf"
                onChange={handleFileInput}
                className="socles-file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="socles-browse-btn">
                Parcourir les fichiers
              </label>
              <div className="socles-supported-formats">
                Formats supportés: STL, OBJ, PLY, 3MF
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          {isUploading && (
            <div className="socles-progress-section">
              <div className="socles-progress-bar">
                <div
                  className="socles-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="socles-progress-text">
                {uploadProgress}% uploadé
              </span>
            </div>
          )}

          {/* Liste des fichiers uploadés */}
          {uploadedFiles.length > 0 && (
            <div className="socles-files-list">
              <h4 className="socles-files-list-title">
                Fichiers uploadés ({uploadedFiles.length})
              </h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="socles-file-item">
                  <div className="socles-file-info">
                    <FileCheck size={20} className="socles-file-icon" />
                    <div className="socles-file-details">
                      <span className="socles-file-name">{file.name}</span>
                      <span className="socles-file-size">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="socles-remove-file-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Configuration du socle */}
        <div className="socles-config-section">
          <h3 className="socles-section-title">
            <Settings size={20} />
            Configuration du socle
          </h3>

          <div className="socles-type-selection">
            <label className="socles-label">Type de socle</label>
            <div className="socles-type-grid">
              {socleTypes.map((type) => (
                <div
                  key={type.value}
                  className={`socles-type-card ${
                    selectedSocleType === type.value
                      ? "socles-type-card-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedSocleType(type.value)}
                >
                  <div className="socles-type-header">
                    <h4>{type.label}</h4>
                    <div
                      className={`socles-type-radio ${
                        selectedSocleType === type.value
                          ? "socles-type-radio-selected"
                          : ""
                      }`}
                    ></div>
                  </div>
                  <p className="socles-type-description">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de génération */}
          <div className="socles-generation-section">
            <button
              onClick={handleGenerateSocle}
              disabled={
                uploadedFiles.length === 0 || !selectedSocleType || isGenerating
              }
              className="socles-generate-btn"
            >
              {isGenerating ? (
                <>
                  <Loader size={20} className="socles-spinner" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Générer le socle
                </>
              )}
            </button>

            {uploadedFiles.length === 0 && (
              <p className="socles-generation-hint">
                Veuillez d'abord uploader au moins un fichier 3D
              </p>
            )}

            {uploadedFiles.length > 0 && !selectedSocleType && (
              <p className="socles-generation-hint">
                Veuillez sélectionner un type de socle
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Socles;
