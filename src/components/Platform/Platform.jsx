import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { Server, Plus, Search, Monitor, Mail } from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";

import PlatformCard from "./components/PlatformCard/PlatformCard";
import PlatformModal from "./components/PlatformModal/PlatformModal";
import ThreeShapeOAuthModal from "./components/modals/3shape/ThreeShapeOAuthModal";
import MeditLinkOAuthModal from "./components/modals/MeditLink/MeditLinkOAuthModal";
import IteroOAuthModal from "./components/modals/Itero/IteroOAuthModal";
import DexisOAuthModal from "./components/modals/Dexis/DexisOAuthModal";
import GoogleDriveOAuthModal from "./components/modals/Google/GoogleDriveOAuthModal";
import ThreeShapeDashboardModal from "./components/modals/3shape/ThreeShapeDashboardModal";
import MeditLinkDashboardModal from "./components/modals/MeditLink/MeditLinkDashboardModal";
import ListLoadingSpinner from "./components/Loading/ListLoadingSpinner";
import EmptyState from "./components/Loading/EmptyState";

import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";
import {
  fetchWithAuth,
  getUserData,
  getUserPlatforms,
  encryptPassword,
  decryptPassword,
} from "./utils/platformUtils";
import { platformTypes } from "./constants/platformConstants";

import "./Platform.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Platform = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showThreeShapeDashboard, setShowThreeShapeDashboard] = useState(false);
  const [showMeditLinkDashboard, setShowMeditLinkDashboard] = useState(false);
  const [is3ShapeModalOpen, setIs3ShapeModalOpen] = useState(false);
  const [isMeditLinkModalOpen, setIsMeditLinkModalOpen] = useState(false);
  const [isIteroModalOpen, setIsIteroModalOpen] = useState(false);
  const [isDexisModalOpen, setIsDexisModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  const [googleDriveStatus, setGoogleDriveStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });
  const [iteroStatus, setIteroStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });
  const [dexisStatus, setDexisStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Hooks d'authentification
  const {
    authStatus: meditlinkAuthStatus,
    userInfo: meditlinkUserInfo,
    isLoading: meditlinkLoading,
    error: meditlinkError,
    isAuthenticated: meditlinkAuthenticated,
    initiateAuth: startMeditlinkAuth,
    logout: meditlinkLogout,
    refresh: refreshMeditlink,
    clearError: clearMeditlinkError,
  } = useMeditLinkAuth({
    autoRefresh: false,
    refreshInterval: 0,
    fetchOnMount: true,
  });

  const {
    authStatus: threeshapeAuthStatus,
    isLoading: threeshapeLoading,
    error: threeshapeError,
    isAuthenticated: threeshapeAuthenticated,
    hasToken: threeshapeHasToken,
    initiateAuth: startThreeshapeAuth,
    refresh: refreshThreeshape,
    clearError: clearThreeshapeError,
  } = useThreeShapeAuth();

  // SWR hooks pour les données
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "user-data" : null, getUserData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
  });

  const {
    data: platforms = [],
    error: platformsError,
    isLoading: platformsLoading,
    mutate: mutatePlatforms,
  } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      errorRetryCount: 3,
    }
  );

  // Fonctions pour vérifier les statuts
  const checkGoogleDriveStatus = useCallback(async () => {
    try {
      setGoogleDriveStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: "Token manquant",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/drive/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleDriveStatus({
          authenticated: data.authenticated || false,
          loading: false,
          error: null,
        });
      } else if (response.status === 401) {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
      } else {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
        });
      }
    } catch (error) {
      setGoogleDriveStatus({
        authenticated: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  const checkIteroStatus = useCallback(async () => {
    try {
      setIteroStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setIteroStatus({
          authenticated: false,
          loading: false,
          error: "Token manquant",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/itero/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIteroStatus({
          authenticated: data.apiStatus === "Connecté",
          loading: false,
          error: null,
        });
      } else {
        setIteroStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
        });
      }
    } catch (error) {
      setIteroStatus({
        authenticated: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  const checkDexisStatus = useCallback(async () => {
    try {
      setDexisStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setDexisStatus({
          authenticated: false,
          loading: false,
          error: "Token manquant",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dexis/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDexisStatus({
          authenticated: data.apiStatus === "Connecté",
          loading: false,
          error: null,
        });
      } else {
        setDexisStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
        });
      }
    } catch (error) {
      setDexisStatus({
        authenticated: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  // Handlers pour Itero
  const handleStartIteroAuth = useCallback(async () => {
    try {
      setIsIteroModalOpen(false);
      setIteroStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/itero/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          "le service de Scraping Itero est actuellement indisponible "
        );
      }

      const data = await response.json();

      if (data.success) {
        setIteroStatus({
          authenticated: true,
          loading: false,
          error: null,
        });
        setSuccess("Connexion Itero réussie !");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(data.error || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur lors de la connexion Itero: " + err.message);
      setIteroStatus((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Handlers pour Dexis
  const handleStartDexisAuth = useCallback(async () => {
    try {
      setIsDexisModalOpen(false);
      setDexisStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/dexis/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la connexion à Dexis");
      }

      const data = await response.json();

      if (data.success) {
        setDexisStatus({
          authenticated: true,
          loading: false,
          error: null,
        });
        setSuccess(data.message || "Connexion Dexis réussie !");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(data.error || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur lors de la connexion Dexis: " + err.message);
      setDexisStatus((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Handlers pour Google Drive
  const handleStartGoogleDriveAuth = useCallback(async () => {
    try {
      setIsGoogleDriveModalOpen(false);
      setGoogleDriveStatus((prev) => ({ ...prev, loading: true }));

      // Récupérer l'URL d'authentification
      const response = await fetch(`${API_BASE_URL}/drive/auth`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'URL");
      }

      const data = await response.json();

      if (data.authenticated) {
        setSuccess("Déjà connecté à Google Drive");
        setGoogleDriveStatus({
          authenticated: true,
          loading: false,
          error: null,
        });
        setTimeout(() => setSuccess(null), 3000);
        return;
      }

      // Ouvrir la popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        data.authUrl,
        "google-drive-auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!authWindow) {
        setError("Veuillez autoriser les popups");
        setGoogleDriveStatus((prev) => ({ ...prev, loading: false }));
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Attendre le message de succès
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "GOOGLE_DRIVE_AUTH_SUCCESS") {
          console.log("✅ Auth réussie !");
          checkGoogleDriveStatus();
          setSuccess("Connexion Google Drive établie !");
          setTimeout(() => setSuccess(null), 5000);
          window.removeEventListener("message", handleMessage);
        } else if (event.data?.type === "GOOGLE_DRIVE_AUTH_ERROR") {
          console.error("❌ Erreur:", event.data.error);
          setError("Erreur: " + event.data.error);
          setGoogleDriveStatus((prev) => ({ ...prev, loading: false }));
          setTimeout(() => setError(null), 5000);
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);

      // Cleanup après 5 minutes
      setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        setGoogleDriveStatus((prev) => ({ ...prev, loading: false }));
      }, 300000);
    } catch (err) {
      setError("Erreur: " + err.message);
      setGoogleDriveStatus((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, [checkGoogleDriveStatus]);

  const handleGoogleDriveDisconnect = useCallback(async (platform) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir déconnecter Google Drive ?")
    ) {
      return;
    }

    try {
      setGoogleDriveStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/drive/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
        setSuccess("Déconnexion Google Drive réussie");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error("Erreur lors de la déconnexion");
      }
    } catch (err) {
      setError("Erreur lors de la déconnexion Google Drive: " + err.message);
      setGoogleDriveStatus((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Handler pour MeditLink Disconnect
  const handleMeditLinkDisconnect = useCallback(
    async (platform) => {
      if (!window.confirm("Êtes-vous sûr de vouloir déconnecter MeditLink ?")) {
        return;
      }

      try {
        await meditlinkLogout();
        setSuccess("Déconnexion MeditLink réussie");
        setTimeout(() => setSuccess(null), 3000);
        console.log("Déconnexion MeditLink réussie");
      } catch (err) {
        setError("Erreur lors de la déconnexion MeditLink: " + err.message);
        setTimeout(() => setError(null), 5000);
      }
    },
    [meditlinkLogout]
  );

  // États combinés mémorisés
  const combinedMeditlinkStatus = useMemo(
    () => ({
      authenticated: meditlinkAuthenticated,
      userInfo: meditlinkUserInfo,
      loading: meditlinkLoading,
      error: meditlinkError,
      ...meditlinkAuthStatus,
    }),
    [
      meditlinkAuthenticated,
      meditlinkUserInfo,
      meditlinkLoading,
      meditlinkError,
      meditlinkAuthStatus,
    ]
  );

  const combinedThreeshapeStatus = useMemo(
    () => ({
      authenticated: threeshapeAuthenticated,
      hasToken: threeshapeHasToken,
      loading: threeshapeLoading,
      error: threeshapeError,
      ...threeshapeAuthStatus,
    }),
    [
      threeshapeAuthenticated,
      threeshapeHasToken,
      threeshapeLoading,
      threeshapeError,
      threeshapeAuthStatus,
    ]
  );

  // Filtrage mémorisé
  const filteredPlatforms = useMemo(() => {
    if (!searchTerm) return platforms;
    const term = searchTerm.toLowerCase();
    return platforms.filter(
      (platform) =>
        platform.name.toLowerCase().includes(term) ||
        platform.email.toLowerCase().includes(term)
    );
  }, [platforms, searchTerm]);

  // Handlers principaux
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        const token = localStorage.getItem("token");
        const url = editingPlatform
          ? `${API_BASE_URL}/platforms/${editingPlatform.id}`
          : `${API_BASE_URL}/platforms`;
        const method = editingPlatform ? "PUT" : "POST";

        const platformData = {
          ...values,
          password: encryptPassword(values.password),
          userId: userData.id,
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(platformData),
        });

        if (!response.ok) {
          throw new Error(
            `Erreur lors de ${
              editingPlatform ? "la modification" : "la création"
            } de la plateforme`
          );
        }

        const data = await response.json();

        if (editingPlatform) {
          mutatePlatforms(
            platforms.map((p) => (p.id === data.id ? data : p)),
            false
          );
          setSuccess("Plateforme modifiée avec succès");
        } else {
          mutatePlatforms([...platforms, data], false);
          setSuccess("Plateforme créée avec succès");
        }

        setIsModalOpen(false);
        setEditingPlatform(null);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
        mutatePlatforms();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      } finally {
        setSubmitting(false);
      }
    },
    [editingPlatform, userData?.id, platforms, mutatePlatforms]
  );

  const handleEdit = useCallback((platform) => {
    const platformToEdit = {
      ...platform,
      password: decryptPassword(platform.password),
    };
    setEditingPlatform(platformToEdit);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (platformId) => {
      if (
        !window.confirm("Êtes-vous sûr de vouloir supprimer cette plateforme ?")
      ) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/platforms/${platformId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la plateforme");
        }

        mutatePlatforms(
          platforms.filter((p) => p.id !== platformId),
          false
        );
        setSuccess("Plateforme supprimée avec succès");
        setTimeout(() => setSuccess(null), 3000);
        mutatePlatforms();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
        mutatePlatforms();
      }
    },
    [platforms, mutatePlatforms]
  );

  const openCreateModal = useCallback(() => {
    setEditingPlatform(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPlatform(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Gestion des messages entre fenêtres
  useEffect(() => {
    const handleMessage = (event) => {
      const allowedOrigins = [
        "https://mysmilelab.be",
        "https://www.mysmilelab.be",
        "http://localhost:5173",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn(
          "⚠️ Message reçu d'une origine non autorisée:",
          event.origin
        );
        return;
      }

      console.log("✅ Message reçu d'une origine autorisée:", event.origin);

      if (event.data?.type === "GOOGLE_DRIVE_AUTH_SUCCESS") {
        console.log("✅ Auth Google Drive réussie depuis le popup !");
        checkGoogleDriveStatus();
        setSuccess("Connexion Google Drive établie avec succès !");
        setTimeout(() => setSuccess(null), 5000);
      } else if (event.data?.type === "GOOGLE_DRIVE_AUTH_ERROR") {
        console.error(
          "❌ Erreur Google Drive depuis le popup:",
          event.data.error
        );
        setError(
          "Erreur lors de l'authentification Google Drive: " + event.data.error
        );
        setTimeout(() => setError(null), 5000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkGoogleDriveStatus]);

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Vérifier les statuts au chargement
  useEffect(() => {
    if (isAuthenticated) {
      checkGoogleDriveStatus();
      checkIteroStatus();
      checkDexisStatus();
    }
  }, [
    isAuthenticated,
    checkGoogleDriveStatus,
    checkIteroStatus,
    checkDexisStatus,
  ]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="platform-main-wrapper">
      <div className="platform-content-container">
        <div className="platform-management-card">
          {/* Header */}
          <div className="platform-management-header">
            <h1 className="platform-management-title">
              <div className="platform-management-icon">
                <Server size={24} />
              </div>
              Gestion des Plateformes
            </h1>
            <div className="platform-header-actions">
              <button
                onClick={openCreateModal}
                className="platform-create-btn"
                disabled={userLoading || !userData}
              >
                <Plus size={18} />
                {userLoading ? "Chargement..." : "Ajouter une plateforme"}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && <div className="platform-error-notification">{error}</div>}
          {success && (
            <div className="platform-success-notification">{success}</div>
          )}

          {/* Search Bar */}
          <div className="platform-search-section">
            <div className="platform-search-wrapper">
              <Search className="platform-search-icon" />
              <input
                type="text"
                placeholder="Rechercher une plateforme..."
                className="platform-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Platforms List */}
          <div className="platform-list-container">
            {platformsLoading ? (
              <ListLoadingSpinner />
            ) : filteredPlatforms.length === 0 ? (
              <EmptyState searchTerm={searchTerm} />
            ) : (
              <div className="platform-grid">
                {filteredPlatforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onConnect3Shape={() => setIs3ShapeModalOpen(true)}
                    onConnectMeditLink={() => setIsMeditLinkModalOpen(true)}
                    onConnectItero={() => setIsIteroModalOpen(true)}
                    onConnectDexis={() => setIsDexisModalOpen(true)}
                    onConnectGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
                    onDisconnectGoogleDrive={handleGoogleDriveDisconnect}
                    onDisconnectMeditLink={handleMeditLinkDisconnect}
                    onShowMeditLinkDashboard={() =>
                      setShowMeditLinkDashboard(true)
                    }
                    onShowThreeShapeDashboard={() =>
                      setShowThreeShapeDashboard(true)
                    }
                    threeshapeStatus={combinedThreeshapeStatus}
                    meditlinkStatus={combinedMeditlinkStatus}
                    iteroStatus={iteroStatus}
                    dexisStatus={dexisStatus}
                    googledriveStatus={googleDriveStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && !userLoading && userData && (
        <PlatformModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingPlatform={editingPlatform}
          initialValues={{
            name: editingPlatform?.name || "",
            email: editingPlatform?.email || "",
            password: editingPlatform?.password || "",
          }}
          onSubmit={handleSubmit}
        />
      )}

      <ThreeShapeDashboardModal
        isOpen={showThreeShapeDashboard}
        onClose={() => setShowThreeShapeDashboard(false)}
      />

      <MeditLinkDashboardModal
        isOpen={showMeditLinkDashboard}
        onClose={() => setShowMeditLinkDashboard(false)}
      />

      <ThreeShapeOAuthModal
        isOpen={is3ShapeModalOpen}
        onClose={() => setIs3ShapeModalOpen(false)}
        onStartAuth={startThreeshapeAuth}
        isLoading={threeshapeLoading}
      />

      <MeditLinkOAuthModal
        isOpen={isMeditLinkModalOpen}
        onClose={() => setIsMeditLinkModalOpen(false)}
        onStartAuth={startMeditlinkAuth}
        isLoading={meditlinkLoading}
      />

      <IteroOAuthModal
        isOpen={isIteroModalOpen}
        onClose={() => setIsIteroModalOpen(false)}
        onStartAuth={handleStartIteroAuth}
        isLoading={iteroStatus.loading}
      />

      <DexisOAuthModal
        isOpen={isDexisModalOpen}
        onClose={() => setIsDexisModalOpen(false)}
        onStartAuth={handleStartDexisAuth}
        isLoading={dexisStatus.loading}
      />

      <GoogleDriveOAuthModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        onStartAuth={handleStartGoogleDriveAuth}
        isLoading={googleDriveStatus.loading}
      />
    </div>
  );
};

export default Platform;
