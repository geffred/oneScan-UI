import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR, { mutate } from "swr";
import {
  Server,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Search,
  Monitor,
  Link2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Activity,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import useMeditLinkAuth from "../Config/useMeditLinkAuth";
import useThreeShapeAuth from "../Config/useThreeShapeAuth";
import MeditLinkDashboard from "../MeditLinkDashboard/MeditLinkDashboard";
import "./Platform.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuration mise en cache
const SECRET_KEY = "MaCleSecrete12345";
const platformTypes = [
  { value: "ITERO", label: "Itero" },
  { value: "THREESHAPE", label: "3Shape" },
  { value: "DEXIS", label: "Dexis" },
  { value: "MEDITLINK", label: "MeditLink" },
  { value: "AUTRE", label: "Autre" },
];

// Schema de validation mis en cache
const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de la plateforme est requis"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string().required("Le mot de passe est requis"),
});

// Utilitaires optimisés
const encryptPassword = (password) => {
  try {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    return password;
  }
};

const decryptPassword = (encryptedPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    return encryptedPassword;
  }
};

// Fonctions de fetch pour SWR
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonction pour récupérer les données utilisateur
const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const userEmail = JSON.parse(atob(token.split(".")[1])).sub;
  return fetchWithAuth(`${API_BASE_URL}/auth/user/${userEmail}`);
};

// Fonction pour récupérer les plateformes d'un utilisateur
const getUserPlatforms = async (userId) => {
  if (!userId) return [];
  return fetchWithAuth(`${API_BASE_URL}/platforms/user/${userId}`);
};

// Composant de carte optimisé avec React.memo
const PlatformCard = React.memo(
  ({
    platform,
    onEdit,
    onDelete,
    onConnect3Shape,
    onConnectMeditLink,
    onDisconnectMeditLink,
    onShowMeditLinkDashboard,
    threeshapeStatus,
    meditlinkStatus,
  }) => {
    const is3Shape = platform.name === "THREESHAPE";
    const isMeditLink = platform.name === "MEDITLINK";

    return (
      <div className="platform-card">
        <div className="platform-card-header">
          <h3 className="platform-card-title">{platform.name}</h3>

          {is3Shape && (
            <div
              className={`platform-3shape-status ${
                threeshapeStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {threeshapeStatus?.authenticated ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {threeshapeStatus?.authenticated
                  ? "Connecté à 3Shape"
                  : "Non connecté à 3Shape"}
              </span>
            </div>
          )}

          {isMeditLink && (
            <div
              className={`platform-meditlink-status ${
                meditlinkStatus?.authenticated ? "connected" : "disconnected"
              }`}
            >
              {meditlinkStatus?.authenticated ? (
                <>
                  <CheckCircle size={16} />
                  <span>Connecté à MeditLink</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Non connecté à MeditLink</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="platform-card-content">
          <div className="platform-card-info">
            <Mail size={16} />
            <span>{platform.email}</span>
          </div>
          <div className="platform-card-status">
            <span className="platform-connected-status">Configuré</span>
          </div>

          {/* Affichage des infos utilisateur MeditLink si connecté */}
          {isMeditLink &&
            meditlinkStatus?.authenticated &&
            meditlinkStatus.userInfo && (
              <div className="platform-user-info">
                <Shield size={14} />
                <span>{meditlinkStatus.userInfo.name}</span>
              </div>
            )}

          {/* Affichage des infos de connexion 3Shape si connecté */}
          {is3Shape &&
            threeshapeStatus?.authenticated &&
            threeshapeStatus.hasToken && (
              <div className="platform-user-info">
                <Link2 size={14} />
                <span>Token 3Shape actif</span>
              </div>
            )}
        </div>

        <div className="platform-card-actions">
          {is3Shape && (
            <button
              onClick={() => onConnect3Shape(platform)}
              className={`platform-connect-btn ${
                threeshapeStatus?.authenticated ? "connected" : ""
              }`}
              aria-label="Connecter à 3Shape"
            >
              <Link2 size={16} />
              {threeshapeStatus?.authenticated ? "Reconnecter" : "Connecter"}
            </button>
          )}

          {isMeditLink && (
            <>
              {meditlinkStatus?.authenticated ? (
                <div className="meditlink-actions-group">
                  <button
                    onClick={() => onShowMeditLinkDashboard(platform)}
                    className="platform-connect-btn"
                    aria-label="Tableau de bord MeditLink"
                  >
                    <Activity size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => onDisconnectMeditLink(platform)}
                    className="platform-disconnect-btn"
                    aria-label="Déconnecter de MeditLink"
                  >
                    <X size={16} />
                    Déconnecter
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onConnectMeditLink(platform)}
                  className="platform-connect-btn"
                  disabled={meditlinkStatus?.loading}
                  aria-label="Connecter à MeditLink"
                >
                  <Shield size={16} />
                  {meditlinkStatus?.loading
                    ? "Connexion..."
                    : "Connecter OAuth"}
                </button>
              )}
            </>
          )}

          <button
            onClick={() => onEdit(platform)}
            className="platform-edit-btn"
            aria-label="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(platform.id)}
            className="platform-delete-btn"
            aria-label="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }
);

PlatformCard.displayName = "PlatformCard";

// Composant de chargement optimisé pour la liste
const ListLoadingSpinner = React.memo(() => (
  <div className="platform-list-loading">
    <div className="platform-loading-spinner" aria-label="Chargement"></div>
    <p>Chargement des plateformes...</p>
  </div>
));

ListLoadingSpinner.displayName = "ListLoadingSpinner";

// État vide optimisé
const EmptyState = React.memo(({ searchTerm }) => (
  <div className="platform-empty-state">
    <Monitor size={48} />
    <h3>Aucune plateforme trouvée</h3>
    <p>
      {searchTerm
        ? "Aucune plateforme ne correspond à votre recherche."
        : "Commencez par ajouter votre première plateforme."}
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

// Composant modal pour 3Shape OAuth
const ThreeShapeOAuthModal = React.memo(
  ({ isOpen, onClose, onStartAuth, isLoading }) => {
    if (!isOpen) return null;

    return (
      <div className="platform-modal-overlay">
        <div className="platform-modal platform-3shape-modal">
          <div className="platform-modal-header">
            <h2>Connexion 3Shape</h2>
            <button onClick={onClose} className="platform-modal-close">
              <X size={24} />
            </button>
          </div>

          <div className="platform-3shape-auth-content">
            <div className="platform-3shape-info">
              <Link2 size={48} />
              <h3>Authentification 3Shape OAuth</h3>
              <p>
                Connectez-vous à votre compte 3Shape pour accéder à vos cas et
                synchroniser vos données.
              </p>
            </div>

            <div className="platform-3shape-features">
              <h4>Accès aux fonctionnalités :</h4>
              <ul>
                <li>
                  <CheckCircle size={16} /> Consultation de vos cas
                </li>
                <li>
                  <CheckCircle size={16} /> Téléchargement des fichiers STL
                </li>
                <li>
                  <CheckCircle size={16} /> Gestion des connexions
                </li>
                <li>
                  <CheckCircle size={16} /> Sauvegarde automatique en base
                </li>
              </ul>
            </div>

            <div className="platform-3shape-security">
              <p>
                <strong>Note :</strong> Une nouvelle fenêtre s'ouvrira pour
                l'authentification. Après connexion, vous serez redirigé
                automatiquement.
              </p>
            </div>

            <div className="platform-3shape-actions">
              <button
                onClick={onStartAuth}
                disabled={isLoading}
                className="platform-3shape-connect-btn"
              >
                {isLoading ? (
                  <>
                    <div className="platform-loading-spinner"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Se connecter avec 3Shape
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="platform-modal-actions">
            <button onClick={onClose} className="platform-cancel-btn">
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ThreeShapeOAuthModal.displayName = "ThreeShapeOAuthModal";

// Composant modal pour MeditLink OAuth
const MeditLinkOAuthModal = React.memo(
  ({ isOpen, onClose, onStartAuth, isLoading }) => {
    if (!isOpen) return null;

    return (
      <div className="platform-modal-overlay">
        <div className="platform-modal platform-meditlink-modal">
          <div className="platform-modal-header">
            <h2>Connexion MeditLink OAuth</h2>
            <button onClick={onClose} className="platform-modal-close">
              <X size={24} />
            </button>
          </div>

          <div className="platform-meditlink-auth-content">
            <div className="platform-meditlink-info">
              <Shield size={48} />
              <h3>Authentification sécurisée MeditLink</h3>
              <p>
                Connectez-vous à votre compte MeditLink pour accéder à vos
                données et synchroniser vos informations.
              </p>
            </div>

            <div className="platform-meditlink-features">
              <h4>Accès aux fonctionnalités :</h4>
              <ul>
                <li>
                  <CheckCircle size={16} /> Consultation de vos données
                  utilisateur
                </li>
                <li>
                  <CheckCircle size={16} /> Accès aux groupes et cas
                </li>
                <li>
                  <CheckCircle size={16} /> Gestion des fichiers
                </li>
                <li>
                  <CheckCircle size={16} /> Synchronisation automatique
                </li>
              </ul>
            </div>

            <div className="platform-meditlink-security">
              <p>
                <strong>Sécurité :</strong> Cette connexion utilise le protocole
                OAuth 2.0 sécurisé. Vos identifiants ne seront jamais stockés
                sur nos serveurs.
              </p>
            </div>

            <div className="platform-meditlink-actions">
              <button
                onClick={onStartAuth}
                disabled={isLoading}
                className="platform-meditlink-connect-btn"
              >
                {isLoading ? (
                  <>
                    <div className="platform-loading-spinner"></div>
                    Initialisation...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Se connecter avec MeditLink
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="platform-modal-actions">
            <button onClick={onClose} className="platform-cancel-btn">
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MeditLinkOAuthModal.displayName = "MeditLinkOAuthModal";

const Platform = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // États pour 3Shape OAuth
  const [is3ShapeModalOpen, setIs3ShapeModalOpen] = useState(false);

  // États pour MeditLink OAuth
  const [isMeditLinkModalOpen, setIsMeditLinkModalOpen] = useState(false);
  const [showMeditLinkDashboard, setShowMeditLinkDashboard] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Hook MeditLink Auth - Configuration sans auto-refresh
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

  // Hook 3Shape Auth
  const {
    authStatus: threeshapeAuthStatus,
    isLoading: threeshapeLoading,
    error: threeshapeError,
    isAuthenticated: threeshapeAuthenticated,
    hasToken: threeshapeHasToken,
    initiateAuth: startThreeshapeAuth,
    refresh: refreshThreeshape,
    testConnection: testThreeshapeConnection,
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

  // Détecter automatiquement les paramètres OAuth dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      // Vérifier si c'est un callback MeditLink
      if (
        location.pathname.includes("/meditLink/callback") ||
        (state && state.includes("meditlink")) ||
        urlParams.get("source") === "meditlink"
      ) {
        console.log("Callback MeditLink détecté");
        handleMeditLinkCallback(code, state);
      }
      // Vérifier si c'est un callback 3Shape
      else if (
        location.pathname.includes("/3shapde/callback") ||
        (state && state.includes("3shape")) ||
        urlParams.get("source") === "3shape"
      ) {
        console.log("Callback 3Shape détecté - redirection");
        navigate(`/3shapde/callback${location.search}`, { replace: true });
        return;
      }
      // Par défaut, rediriger vers 3Shape si pas d'indication spécifique
      else {
        console.log("Code OAuth détecté - redirection vers 3Shape callback");
        navigate(`/3shapde/callback${location.search}`, { replace: true });
        return;
      }

      // Nettoyer l'URL après traitement (seulement si pas de redirection)
      if (!location.pathname.includes("/callback")) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);

  // Combiné MeditLink Status avec les infos utilisateur
  const combinedMeditlinkStatus = useMemo(() => {
    return {
      authenticated: meditlinkAuthenticated,
      userInfo: meditlinkUserInfo,
      loading: meditlinkLoading,
      error: meditlinkError,
      ...meditlinkAuthStatus,
    };
  }, [
    meditlinkAuthenticated,
    meditlinkUserInfo,
    meditlinkLoading,
    meditlinkError,
    meditlinkAuthStatus,
  ]);

  // Combiné 3Shape Status
  const combinedThreeshapeStatus = useMemo(() => {
    return {
      authenticated: threeshapeAuthenticated,
      hasToken: threeshapeHasToken,
      loading: threeshapeLoading,
      error: threeshapeError,
      ...threeshapeAuthStatus,
    };
  }, [
    threeshapeAuthenticated,
    threeshapeHasToken,
    threeshapeLoading,
    threeshapeError,
    threeshapeAuthStatus,
  ]);

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

  // Valeurs initiales mémorisées
  const initialValues = useMemo(
    () => ({
      name: editingPlatform?.name || "",
      email: editingPlatform?.email || "",
      password: editingPlatform?.password || "",
    }),
    [editingPlatform]
  );

  // Gestion des erreurs
  useEffect(() => {
    if (userError) {
      setError("Erreur lors de la récupération des données utilisateur");
      setTimeout(() => setError(null), 3000);
    }
  }, [userError]);

  useEffect(() => {
    if (platformsError) {
      setError("Erreur lors de la récupération des plateformes");
      setTimeout(() => setError(null), 3000);
    }
  }, [platformsError]);

  useEffect(() => {
    if (meditlinkError) {
      setError("Erreur MeditLink: " + meditlinkError);
      setTimeout(() => {
        setError(null);
        clearMeditlinkError();
      }, 5000);
    }
  }, [meditlinkError, clearMeditlinkError]);

  useEffect(() => {
    if (threeshapeError) {
      setError("Erreur 3Shape: " + threeshapeError);
      setTimeout(() => {
        setError(null);
        clearThreeshapeError();
      }, 5000);
    }
  }, [threeshapeError, clearThreeshapeError]);

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handlers pour 3Shape OAuth
  const handle3ShapeConnect = useCallback(async (platform) => {
    setIs3ShapeModalOpen(true);
  }, []);

  const handleStart3ShapeAuth = useCallback(async () => {
    try {
      setIs3ShapeModalOpen(false);
      await startThreeshapeAuth();
    } catch (err) {
      setError("Erreur lors de la connexion 3Shape: " + err.message);
      setTimeout(() => setError(null), 5000);
    }
  }, [startThreeshapeAuth]);

  // Handlers pour MeditLink OAuth
  const handleMeditLinkConnect = useCallback(async (platform) => {
    setIsMeditLinkModalOpen(true);
  }, []);

  const handleStartMeditLinkAuth = useCallback(async () => {
    try {
      setIsMeditLinkModalOpen(false);
      await startMeditlinkAuth();
    } catch (err) {
      setError("Erreur lors de la connexion MeditLink: " + err.message);
      setTimeout(() => setError(null), 5000);
    }
  }, [startMeditlinkAuth]);

  const handleMeditLinkCallback = useCallback(
    async (code, state) => {
      try {
        console.log("Traitement du callback MeditLink...");

        const params = new URLSearchParams();
        params.append("code", code);

        if (state && state.trim() !== "") {
          params.append("state", state);
        }

        const response = await fetch(
          `${API_BASE_URL}/meditlink/auth/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            credentials: "include",
            body: params.toString(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Authentification MeditLink réussie");

          refreshMeditlink();

          setSuccess(
            `Connexion MeditLink établie avec succès ! Bienvenue ${
              data.user?.name || "utilisateur"
            }`
          );
          setTimeout(() => setSuccess(null), 5000);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors du callback");
        }
      } catch (err) {
        setError("Erreur lors du callback MeditLink: " + err.message);
        setTimeout(() => setError(null), 5000);
      }
    },
    [refreshMeditlink]
  );

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

  const handleShowMeditLinkDashboard = useCallback((platform) => {
    setShowMeditLinkDashboard(true);
  }, []);

  const handleCloseMeditLinkDashboard = useCallback(() => {
    setShowMeditLinkDashboard(false);
  }, []);

  // Handlers existants optimisés
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
    setShowPassword(false);
  }, []);

  const close3ShapeModal = useCallback(() => {
    setIs3ShapeModalOpen(false);
  }, []);

  const closeMeditLinkModal = useCallback(() => {
    setIsMeditLinkModalOpen(false);
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const refreshAllStatuses = useCallback(() => {
    refreshThreeshape();
    refreshMeditlink();
  }, [refreshThreeshape, refreshMeditlink]);

  // Affichage immédiat de l'interface même si les données utilisateur chargent encore
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
                onClick={refreshAllStatuses}
                className="platform-refresh-btn"
                disabled={threeshapeLoading || meditlinkLoading}
                title="Actualiser tous les statuts"
              >
                <RefreshCw
                  size={18}
                  className={
                    threeshapeLoading || meditlinkLoading ? "spinning" : ""
                  }
                />
              </button>
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
                    onConnect3Shape={handle3ShapeConnect}
                    onConnectMeditLink={handleMeditLinkConnect}
                    onDisconnectMeditLink={handleMeditLinkDisconnect}
                    onShowMeditLinkDashboard={handleShowMeditLinkDashboard}
                    threeshapeStatus={combinedThreeshapeStatus}
                    meditlinkStatus={combinedMeditlinkStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && !userLoading && userData && (
        <div className="platform-modal-overlay">
          <div className="platform-modal">
            <div className="platform-modal-header">
              <h2>
                {editingPlatform
                  ? "Modifier la plateforme"
                  : "Ajouter une plateforme"}
              </h2>
              <button onClick={closeModal} className="platform-modal-close">
                <X size={24} />
              </button>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values }) => (
                <Form className="platform-modal-form">
                  <div className="platform-form-fields">
                    <div className="platform-input-group">
                      <label className="platform-field-label">
                        Nom de la plateforme
                      </label>
                      <div className="platform-input-wrapper">
                        <Monitor className="platform-input-icon" />
                        <Field
                          as="select"
                          name="name"
                          className="platform-select-input"
                        >
                          <option value="">Sélectionner une plateforme</option>
                          {platformTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="platform-error-message"
                      />
                    </div>

                    {/* Info spéciale pour MeditLink */}
                    {values.name === "MEDITLINK" && (
                      <div className="platform-info-banner">
                        <Shield size={16} />
                        <div>
                          <strong>Plateforme MeditLink :</strong>
                          <p>
                            Après création, utilisez le bouton "Connecter OAuth"
                            pour vous authentifier de manière sécurisée avec
                            votre compte MeditLink.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Info spéciale pour 3Shape */}
                    {values.name === "THREESHAPE" && (
                      <div className="platform-info-banner">
                        <Link2 size={16} />
                        <div>
                          <strong>Plateforme 3Shape :</strong>
                          <p>
                            Après création, utilisez le bouton "Connecter" pour
                            vous authentifier avec votre compte 3Shape et
                            accéder à vos cas.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="platform-input-group">
                      <label className="platform-field-label">Email</label>
                      <div className="platform-input-wrapper">
                        <Mail className="platform-input-icon" />
                        <Field
                          name="email"
                          type="email"
                          className="platform-text-input"
                          placeholder="contact@plateforme.com"
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="platform-error-message"
                      />
                    </div>

                    <div className="platform-input-group">
                      <label className="platform-field-label">
                        Mot de passe
                        {(values.name === "MEDITLINK" ||
                          values.name === "THREESHAPE") && (
                          <small>
                            {" "}
                            (utilisé uniquement comme identifiant de
                            configuration)
                          </small>
                        )}
                      </label>
                      <div className="platform-input-wrapper">
                        <Lock className="platform-input-icon" />
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="platform-text-input"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="platform-password-toggle"
                          onClick={togglePassword}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="platform-error-message"
                      />
                    </div>
                  </div>

                  <div className="platform-modal-actions">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="platform-cancel-btn"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="platform-save-btn"
                    >
                      {isSubmitting ? (
                        <div className="platform-loading-container">
                          <div className="platform-loading-spinner"></div>
                          {editingPlatform ? "Modification..." : "Création..."}
                        </div>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingPlatform ? "Modifier" : "Créer"}
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Modal 3Shape OAuth */}
      <ThreeShapeOAuthModal
        isOpen={is3ShapeModalOpen}
        onClose={close3ShapeModal}
        onStartAuth={handleStart3ShapeAuth}
        isLoading={threeshapeLoading}
      />

      {/* Modal MeditLink OAuth */}
      <MeditLinkOAuthModal
        isOpen={isMeditLinkModalOpen}
        onClose={closeMeditLinkModal}
        onStartAuth={handleStartMeditLinkAuth}
        isLoading={meditlinkLoading}
      />

      {/* Modal Dashboard MeditLink */}
      {showMeditLinkDashboard && (
        <div className="platform-modal-overlay">
          <div className="platform-modal platform-meditlink-dashboard-modal">
            <div className="platform-modal-header">
              <h2>Tableau de bord MeditLink</h2>
              <button
                onClick={handleCloseMeditLinkDashboard}
                className="platform-modal-close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="platform-modal-content">
              <MeditLinkDashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Platform;
