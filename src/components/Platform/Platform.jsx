/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import useSWR from "swr";
import { Server, Plus, Search } from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";

// Components
import PlatformCard from "./components/PlatformCard/PlatformCard";
import PlatformModal from "./components/PlatformModal/PlatformModal";
import ListLoadingSpinner from "./components/Loading/ListLoadingSpinner";
import EmptyState from "./components/Loading/EmptyState";

// Modals OAuth & Dashboards
import ThreeShapeOAuthModal from "./components/modals/3shape/ThreeShapeOAuthModal";
import ThreeShapeDashboardModal from "./components/modals/3shape/ThreeShapeDashboardModal";
import MeditLinkOAuthModal from "./components/modals/MeditLink/MeditLinkOAuthModal";
import MeditLinkDashboardModal from "./components/modals/MeditLink/MeditLinkDashboardModal";
import IteroOAuthModal from "./components/modals/Itero/IteroOAuthModal";
import Csconnect from "./components/modals/Csconnect";

// Dexis : Modal OAuth + Dashboard
import DexisOAuthModal from "./components/modals/Dexis/DexisOAuthModal";
import DexisDashboardModal from "./components/modals/Dexis/DexisDashboardModal";

// Hooks Custom Auth
import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";
import useDexisAuth from "../../components/Config/useDexisAuth";

// Utils
import { getUserData, getUserPlatforms } from "./utils/platformUtils";
import "./Platform.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Platform = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- UI States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Dashboard States ---
  const [showThreeShapeDashboard, setShowThreeShapeDashboard] = useState(false);
  const [showMeditLinkDashboard, setShowMeditLinkDashboard] = useState(false);
  const [showDexisDashboard, setShowDexisDashboard] = useState(false);

  // --- OAuth Modals States ---
  const [is3ShapeModalOpen, setIs3ShapeModalOpen] = useState(false);
  const [isMeditLinkModalOpen, setIsMeditLinkModalOpen] = useState(false);
  const [isIteroModalOpen, setIsIteroModalOpen] = useState(false);
  const [isCsConnectModalOpen, setIsCsConnectModalOpen] = useState(false);
  const [isDexisModalOpen, setIsDexisModalOpen] = useState(false);

  // --- Manual Status States (Legacy) ---
  const [iteroStatus, setIteroStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });

  const [csConnectStatus, setCsConnectStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });

  // =========================================================================
  // 1. HOOKS D'AUTHENTIFICATION
  // =========================================================================

  // --- MeditLink ---
  const {
    authStatus: meditlinkAuthStatus,
    userInfo: meditlinkUserInfo,
    isLoading: meditlinkLoading,
    error: meditlinkError,
    isAuthenticated: meditlinkAuthenticated,
    initiateAuth: startMeditlinkAuth,
    logout: meditlinkLogout,
  } = useMeditLinkAuth({
    autoRefresh: false,
    refreshInterval: 0,
    fetchOnMount: true,
  });

  // --- 3Shape ---
  const {
    authStatus: threeshapeAuthStatus,
    isLoading: threeshapeLoading,
    error: threeshapeError,
    isAuthenticated: threeshapeAuthenticated,
    hasToken: threeshapeHasToken,
    initiateAuth: startThreeshapeAuth,
  } = useThreeShapeAuth();

  // --- Dexis ---
  const {
    authStatus: dexisAuthStatus,
    isLoading: dexisLoading,
    isAuthenticated: dexisAuthenticated,
    initiateAuth: startDexisAuth,
  } = useDexisAuth({
    refreshInterval: 10000,
  });

  // =========================================================================
  // 2. DATA FETCHING (SWR)
  // =========================================================================

  const { data: userData, isLoading: userLoading } = useSWR(
    isAuthenticated ? "user-data" : null,
    getUserData,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
    },
  );

  const {
    data: platforms = [],
    isLoading: platformsLoading,
    mutate: mutatePlatforms,
  } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    },
  );

  // =========================================================================
  // 3. HANDLERS SPECIFIQUES
  // =========================================================================

  // --- 3Shape ---
  const handleStartThreeShapeAuth = useCallback(async () => {
    try {
      setIs3ShapeModalOpen(false);
      await startThreeshapeAuth();
      setSuccess("Authentification 3Shape lancée - vérifiez le nouvel onglet");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erreur 3Shape: " + err.message);
      setTimeout(() => setError(null), 5000);
    }
  }, [startThreeshapeAuth]);

  // --- MeditLink ---
  const handleMeditLinkDisconnect = useCallback(
    async (platform) => {
      if (!window.confirm("Êtes-vous sûr de vouloir déconnecter MeditLink ?"))
        return;
      try {
        await meditlinkLogout();
        setSuccess("Déconnexion MeditLink réussie");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message);
      }
    },
    [meditlinkLogout],
  );

  // --- Dexis ---
  const handleStartDexisAuth = useCallback(async () => {
    try {
      setIsDexisModalOpen(false);
      await startDexisAuth();
      setSuccess("Authentification Dexis lancée - vérifiez le nouvel onglet");
      setTimeout(() => {
        setSuccess(null);
        // Ouvrir le dashboard après connexion réussie
        setShowDexisDashboard(true);
      }, 2000);
    } catch (err) {
      setError("Erreur Dexis: " + err.message);
      setTimeout(() => setError(null), 5000);
    }
  }, [startDexisAuth]);

  const handleShowDexisDashboard = useCallback(() => {
    // Si déjà connecté, ouvrir directement le dashboard
    if (dexisAuthenticated) {
      setShowDexisDashboard(true);
    } else {
      // Sinon, ouvrir le modal OAuth d'abord
      setIsDexisModalOpen(true);
    }
  }, [dexisAuthenticated]);

  // --- Itero (Manual Check) ---
  const checkIteroStatus = useCallback(async () => {
    try {
      setIteroStatus((prev) => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/itero/status`, {
        headers: { Authorization: `Bearer ${token}` },
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
          error: "Erreur check",
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

      const data = await response.json();
      if (data.success) {
        setIteroStatus({ authenticated: true, loading: false, error: null });
        setSuccess("Connexion Itero réussie !");
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur Itero: " + err.message);
      setIteroStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // --- CS Connect (Manual Check) ---
  const checkCsConnectStatus = useCallback(async () => {
    try {
      setCsConnectStatus((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/csconnect/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCsConnectStatus({
          authenticated: data.connected || false,
          loading: false,
          error: null,
        });
      } else {
        setCsConnectStatus({
          authenticated: false,
          loading: false,
          error: null,
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

  const handleStartCsConnectAuth = useCallback(async () => {
    try {
      setIsCsConnectModalOpen(false);
      setCsConnectStatus((p) => ({ ...p, loading: true }));
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/csconnect/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setCsConnectStatus({
          authenticated: true,
          loading: false,
          error: null,
        });
        setSuccess("Connexion CS Connect réussie");
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      setError(e.message);
      setCsConnectStatus((p) => ({ ...p, loading: false }));
    }
  }, []);

  const handleCsConnectDisconnect = useCallback(async () => {
    if (!window.confirm("Déconnecter CS Connect ?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/csconnect/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCsConnectStatus({ authenticated: false, loading: false, error: null });
      setSuccess("Déconnecté");
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // =========================================================================
  // 4. ETATS COMBINÉS & MEMO
  // =========================================================================

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
    ],
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
    ],
  );

  const combinedDexisStatus = useMemo(
    () => ({
      authenticated: dexisAuthenticated,
      loading: dexisLoading,
      ...dexisAuthStatus,
    }),
    [dexisAuthenticated, dexisLoading, dexisAuthStatus],
  );

  const filteredPlatforms = useMemo(() => {
    if (!searchTerm) return platforms;
    const term = searchTerm.toLowerCase();
    return platforms.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term),
    );
  }, [platforms, searchTerm]);

  // =========================================================================
  // 5. CRUD PLATEFORME
  // =========================================================================

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        const token = localStorage.getItem("token");
        const url = editingPlatform
          ? `${API_BASE_URL}/platforms/${editingPlatform.id}`
          : `${API_BASE_URL}/platforms`;
        const method = editingPlatform ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, userId: userData.id }),
        });

        if (!response.ok) throw new Error("Erreur sauvegarde plateforme");
        const data = await response.json();

        if (editingPlatform) {
          mutatePlatforms(
            platforms.map((p) => (p.id === data.id ? data : p)),
            false,
          );
          setSuccess("Plateforme modifiée");
        } else {
          mutatePlatforms([...platforms, data], false);
          setSuccess("Plateforme créée");
        }

        setIsModalOpen(false);
        setEditingPlatform(null);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
        mutatePlatforms();
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [editingPlatform, userData?.id, platforms, mutatePlatforms],
  );

  const handleEdit = useCallback((platform) => {
    setEditingPlatform(platform);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (platformId) => {
      if (!window.confirm("Supprimer cette plateforme ?")) return;
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/platforms/${platformId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        mutatePlatforms(
          platforms.filter((p) => p.id !== platformId),
          false,
        );
        setSuccess("Plateforme supprimée");
        setTimeout(() => setSuccess(null), 3000);
        mutatePlatforms();
      } catch (err) {
        setError(err.message);
      }
    },
    [platforms, mutatePlatforms],
  );

  // =========================================================================
  // 6. EFFECTS
  // =========================================================================

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      checkIteroStatus();
      checkCsConnectStatus();
    }
  }, [isAuthenticated, checkIteroStatus, checkCsConnectStatus]);

  if (!isAuthenticated) return null;

  // =========================================================================
  // 7. RENDER
  // =========================================================================

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
                onClick={() => {
                  setEditingPlatform(null);
                  setIsModalOpen(true);
                }}
                className="platform-create-btn"
                disabled={userLoading || !userData}
              >
                <Plus size={18} />
                {userLoading ? "Chargement..." : "Ajouter une plateforme"}
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && <div className="platform-error-notification">{error}</div>}
          {success && (
            <div className="platform-success-notification">{success}</div>
          )}

          {/* Search */}
          <div className="platform-search-section">
            <div className="platform-search-wrapper">
              <Search className="platform-search-icon" />
              <input
                type="text"
                placeholder="Rechercher une plateforme..."
                className="platform-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
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
                    onConnectCsConnect={() => setIsCsConnectModalOpen(true)}
                    onDisconnectMeditLink={handleMeditLinkDisconnect}
                    onDisconnectCsConnect={handleCsConnectDisconnect}
                    onShowMeditLinkDashboard={() =>
                      setShowMeditLinkDashboard(true)
                    }
                    onShowThreeShapeDashboard={() =>
                      setShowThreeShapeDashboard(true)
                    }
                    onShowDexisDashboard={handleShowDexisDashboard}
                    threeshapeStatus={combinedThreeshapeStatus}
                    meditlinkStatus={combinedMeditlinkStatus}
                    dexisStatus={combinedDexisStatus}
                    iteroStatus={iteroStatus}
                    csconnectStatus={csConnectStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* CRUD Plateforme */}
      {isModalOpen && !userLoading && userData && (
        <PlatformModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlatform(null);
          }}
          editingPlatform={editingPlatform}
          initialValues={{
            name: editingPlatform?.name || "",
            email: editingPlatform?.email || "",
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Dashboards */}
      <ThreeShapeDashboardModal
        isOpen={showThreeShapeDashboard}
        onClose={() => setShowThreeShapeDashboard(false)}
      />

      <MeditLinkDashboardModal
        isOpen={showMeditLinkDashboard}
        onClose={() => setShowMeditLinkDashboard(false)}
      />

      <DexisDashboardModal
        isOpen={showDexisDashboard}
        onClose={() => setShowDexisDashboard(false)}
      />

      {/* OAuth Modals */}
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
        isLoading={dexisLoading}
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
