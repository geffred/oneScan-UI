import React, { useState, useEffect } from "react";
import { Upload, CheckCircle, XCircle, Loader2, HardDrive } from "lucide-react";

// Configuration - À adapter selon votre environnement
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Service API pour Google Drive
const GoogleDriveAPI = {
  // Vérifie le statut d'authentification
  checkStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/drive/status`, {
      credentials: "include",
    });
    return response.json();
  },

  // Récupère l'URL d'authentification
  getAuthUrl: async () => {
    const response = await fetch(`${API_BASE_URL}/drive/auth`, {
      credentials: "include",
    });
    return response.json();
  },

  // Upload un fichier
  uploadFile: async (file, cabinetName, commandeRef) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cabinetName", cabinetName);
    if (commandeRef) {
      formData.append("commandeRef", commandeRef);
    }

    const response = await fetch(`${API_BASE_URL}/files/upload-command`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return response.json();
  },
};

// Composant principal
export default function GoogleDriveAuthSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cabinetName, setCabinetName] = useState("");
  const [commandeRef, setCommandeRef] = useState("");

  // Vérifie le statut au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Gère le callback OAuth (après redirection depuis Google)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (success === "true") {
      setMessage("✅ Authentification réussie !");
      setIsAuthenticated(true);
      // Nettoie l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => checkAuthStatus(), 1000);
    } else if (error) {
      setMessage(`❌ Erreur: ${errorDescription || error}`);
      setIsAuthenticated(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const data = await GoogleDriveAPI.checkStatus();
      setIsAuthenticated(data.authenticated);
      setMessage(data.message);
    } catch (error) {
      console.error("Erreur de vérification:", error);
      setMessage("❌ Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const data = await GoogleDriveAPI.getAuthUrl();
      if (data.authUrl) {
        // Redirige vers Google OAuth
        window.location.href = data.authUrl;
      } else if (data.authenticated) {
        setMessage("✅ Déjà authentifié");
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      setMessage("❌ Erreur lors de l'authentification");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ["stl", "zip"];
      const extension = file.name.split(".").pop().toLowerCase();

      if (!validExtensions.includes(extension)) {
        setMessage("❌ Fichier invalide. Seuls .stl et .zip sont acceptés");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setMessage("❌ Fichier trop volumineux (max 100MB)");
        return;
      }

      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !cabinetName.trim()) {
      setMessage(
        "❌ Veuillez sélectionner un fichier et entrer un nom de cabinet"
      );
      return;
    }

    try {
      setUploadStatus("uploading");
      setMessage("📤 Upload en cours...");

      const result = await GoogleDriveAPI.uploadFile(
        selectedFile,
        cabinetName,
        commandeRef
      );

      if (result.success) {
        setUploadStatus("success");
        setMessage(`✅ ${result.message}`);
        setSelectedFile(null);
        setCabinetName("");
        setCommandeRef("");
        // Reset file input
        document.getElementById("fileInput").value = "";
      } else {
        setUploadStatus("error");
        setMessage(`❌ ${result.error || "Erreur lors de l'upload"}`);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      setUploadStatus("error");
      setMessage("❌ Erreur lors de l'upload du fichier");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Google Drive Integration
              </h1>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAuthenticated
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isAuthenticated ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Connecté
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Non connecté
                </span>
              )}
            </div>
          </div>

          {/* Message d'état */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.includes("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : message.includes("❌")
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Authentification */}
          {!isAuthenticated && (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Vous devez vous connecter à Google Drive pour uploader des
                fichiers
              </p>
              <button
                onClick={handleAuthenticate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Se connecter à Google Drive
              </button>
            </div>
          )}
        </div>

        {/* Formulaire d'upload */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Upload de fichiers
            </h2>

            <div className="space-y-4">
              {/* Nom du cabinet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cabinet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cabinetName}
                  onChange={(e) => setCabinetName(e.target.value)}
                  placeholder="Ex: Cabinet Dentaire Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Référence commande (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence commande (optionnel)
                </label>
                <input
                  type="text"
                  value={commandeRef}
                  onChange={(e) => setCommandeRef(e.target.value)}
                  placeholder="Ex: CMD-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sélection de fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier (.stl ou .zip) <span className="text-red-500">*</span>
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".stl,.zip"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Fichier sélectionné: {selectedFile.name}(
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Bouton d'upload */}
              <button
                onClick={handleUpload}
                disabled={
                  !selectedFile ||
                  !cabinetName.trim() ||
                  uploadStatus === "uploading"
                }
                className={`w-full py-3 rounded-lg font-medium transition-colors shadow-md ${
                  !selectedFile ||
                  !cabinetName.trim() ||
                  uploadStatus === "uploading"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {uploadStatus === "uploading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Uploader sur Google Drive
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Connectez-vous à Google Drive pour commencer</li>
            <li>• Formats acceptés: .stl et .zip uniquement</li>
            <li>• Taille maximale: 100 MB par fichier</li>
            <li>• Les fichiers sont organisés par cabinet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
