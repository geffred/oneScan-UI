/* eslint-disable no-unused-vars */
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

import PlatformCard from "./components/PlatformCard/PlatformCard";
import PlatformModal from "./components/PlatformModal/PlatformModal";
import ThreeShapeOAuthModal from "./components/modals/3shape/ThreeShapeOAuthModal";
import MeditLinkOAuthModal from "./components/modals/MeditLink/MeditLinkOAuthModal";
import IteroOAuthModal from "./components/modals/Itero/IteroOAuthModal";
import DexisOAuthModal from "./components/modals/Dexis/DexisOAuthModal";
import Csconnect from "./components/modals/Csconnect";
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
  checkPlatformStatus,
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
  const [isCsConnectModalOpen, setIsCsConnectModalOpen] = useState(false);

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
  const [csConnectStatus, setCsConnectStatus] = useState({
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
      onSuccess: (data) => {
        console.log(" Plateformes chargées:", data);
        console.log(
          "🔍 CSCONNECT présent?",
          data.filter((p) => p.name === "CSCONNECT")
        );
      },
      onError: (err) => {
        console.error("❌ Erreur chargement plateformes:", err);
      },
    }
  );

  const handleStartThreeShapeAuth = useCallback(async () => {
    try {
      setIs3ShapeModalOpen(false);
      await startThreeshapeAuth();
      setSuccess("Authentification 3Shape lancée - vérifiez le nouvel onglet");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        "Erreur lors du lancement de l'authentification 3Shape: " + err.message
      );
      setTimeout(() => setError(null), 5000);
    }
  }, [startThreeshapeAuth]);

  // Fonctions pour vérifier les statuts
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

  const checkCsConnectStatus = useCallback(async () => {
    try {
      setCsConnectStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setCsConnectStatus({
          authenticated: false,
          loading: false,
          error: "Token manquant",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/csconnect/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCsConnectStatus({
          authenticated: data.connected || false,
          loading: false,
          error: null,
        });
      } else if (response.status === 401) {
        setCsConnectStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
      } else {
        setCsConnectStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
        });
      }
    } catch (error) {
      setCsConnectStatus({
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

  // Handlers pour CS Connect
  const handleStartCsConnectAuth = useCallback(async () => {
    try {
      setIsCsConnectModalOpen(false);
      setCsConnectStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/csconnect/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la connexion à CS Connect");
      }

      const data = await response.json();

      if (data.success) {
        setCsConnectStatus({
          authenticated: true,
          loading: false,
          error: null,
        });
        setSuccess(data.message || "Connexion CS Connect réussie !");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(data.error || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur lors de la connexion CS Connect: " + err.message);
      setCsConnectStatus((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Handler pour déconnexion CS Connect
  const handleCsConnectDisconnect = useCallback(async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir déconnecter CS Connect ?")) {
      return;
    }

    try {
      setCsConnectStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/csconnect/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCsConnectStatus({
            authenticated: false,
            loading: false,
            error: null,
          });
          setSuccess("Déconnexion CS Connect réussie");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(data.error || "Erreur lors de la déconnexion");
        }
      } else {
        throw new Error("Erreur lors de la déconnexion");
      }
    } catch (err) {
      setError("Erreur lors de la déconnexion CS Connect: " + err.message);
      setCsConnectStatus((prev) => ({ ...prev, loading: false }));
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

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        const token = localStorage.getItem("token");
        const url = editingPlatform
          ? `${API_BASE_URL}/platforms/${editingPlatform.id}`
          : `${API_BASE_URL}/platforms`;
        const method = editingPlatform ? "PUT" : "POST";

        const platformData = {
          name: values.name,
          email: values.email,
          userId: userData.id,
        };

        console.log("📤 Envoi des données:", platformData);

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(platformData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erreur ${response.status}: ${errorText || "Erreur inconnue"}`
          );
        }

        const data = await response.json();

        console.log("✅ Réponse reçue:", data);

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
        console.error("❌ Erreur détaillée:", err);
        setError(err.message);
        setTimeout(() => setError(null), 5000);
      } finally {
        setSubmitting(false);
      }
    },
    [editingPlatform, userData?.id, platforms, mutatePlatforms]
  );

  const handleEdit = useCallback((platform) => {
    const platformToEdit = {
      id: platform.id,
      name: platform.name,
      email: platform.email,
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

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Vérifier les statuts au chargement
  useEffect(() => {
    if (isAuthenticated) {
      checkIteroStatus();
      checkDexisStatus();
      checkCsConnectStatus();
    }
  }, [
    isAuthenticated,
    checkIteroStatus,
    checkDexisStatus,
    checkCsConnectStatus,
  ]);

  // Debug: afficher les plateformes chargées
  useEffect(() => {
    if (platforms.length > 0) {
      console.log("📊 Plateformes disponibles:", platforms);
      const csConnectPlatforms = platforms.filter(
        (p) => p.name === "CSCONNECT"
      );
      if (csConnectPlatforms.length === 0) {
        console.log("⚠️ CSCONNECT n'est pas dans les plateformes chargées");
      } else {
        console.log("✅ CSCONNECT trouvé:", csConnectPlatforms);
      }
    }
  }, [platforms]);

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
                    onConnectCsConnect={() => setIsCsConnectModalOpen(true)}
                    onDisconnectMeditLink={handleMeditLinkDisconnect}
                    onDisconnectCsConnect={handleCsConnectDisconnect}
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
                    csconnectStatus={csConnectStatus}
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
        isLoading={threeshapeLoading}
        onStartAuth={handleStartThreeShapeAuth}
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

      <Csconnect
        isOpen={isCsConnectModalOpen}
        onClose={() => setIsCsConnectModalOpen(false)}
        onStartAuth={handleStartCsConnectAuth}
        isLoading={csConnectStatus.loading}
      />
    </div>
  );
};

export default Platform;
