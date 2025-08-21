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
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Platform.css";

// Configuration mise en cache
const SECRET_KEY = "MaCleSecrete12345";
const platformTypes = [
  { value: "ITERO", label: "Itero" },
  { value: "THREESHAPE", label: "3Shape" },
  { value: "DEXIS", label: "Dexis" },
  { value: "MEDITLINK", label: "Meditlink" },
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
  return fetchWithAuth(`/api/auth/user/${userEmail}`);
};

// Fonction pour récupérer les plateformes d'un utilisateur
const getUserPlatforms = async (userId) => {
  if (!userId) return [];
  return fetchWithAuth(`/api/platforms/user/${userId}`);
};

// Fonctions pour 3Shape Authentication
const initiate3ShapeAuth = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/login", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'initiation de l'authentification 3Shape");
  }

  const text = await response.text();
  // Extraire l'URL du lien depuis le HTML retourné
  const urlMatch = text.match(/href="([^"]+)"/);
  if (urlMatch) {
    return urlMatch[1];
  }
  throw new Error("URL d'authentification non trouvée");
};

const complete3ShapeAuth = async (code, state) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/callback?code=${code}&state=${state}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la finalisation de l'authentification 3Shape"
    );
  }

  return response.text();
};

const check3ShapeAuthStatus = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/auth/status", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la vérification du statut 3Shape");
  }

  return response.json();
};

// Composant de carte optimisé avec React.memo
const PlatformCard = React.memo(
  ({ platform, onEdit, onDelete, onConnect3Shape, threeshapeStatus }) => {
    const is3Shape = platform.name === "THREESHAPE";

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
        </div>
        <div className="platform-card-content">
          <div className="platform-card-info">
            <Mail size={16} />
            <span>{platform.email}</span>
          </div>
          <div className="platform-card-status">
            <span className="platform-connected-status">Configuré</span>
          </div>
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
  ({ isOpen, onClose, authUrl, onManualCode }) => {
    const [manualCode, setManualCode] = useState("");
    const [manualState, setManualState] = useState("");

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
            <div className="platform-3shape-step">
              <h3>Étape 1: Authentification</h3>
              <p>
                Cliquez sur le lien ci-dessous pour vous connecter à 3Shape :
              </p>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-3shape-auth-link"
              >
                <Link2 size={18} />
                Se connecter à 3Shape
              </a>
            </div>

            <div className="platform-3shape-step">
              <h3>Étape 2: Code d'autorisation</h3>
              <p>
                Après connexion, copiez le code et l'état depuis l'URL de
                redirection :
              </p>

              <div className="platform-manual-code-form">
                <div className="platform-input-group">
                  <label>Code d'autorisation :</label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ex: CC7D62D5981FB4632C2DF0689B439AC04882387C9A1FE691E85F62FC7025081C-1"
                    className="platform-manual-code-input"
                  />
                </div>

                <div className="platform-input-group">
                  <label>État (state) :</label>
                  <input
                    type="text"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="Ex: RNgFlDN2byZoJPE9pKNlEQ"
                    className="platform-manual-code-input"
                  />
                </div>

                <button
                  onClick={() => onManualCode(manualCode, manualState)}
                  disabled={!manualCode.trim() || !manualState.trim()}
                  className="platform-manual-auth-btn"
                >
                  <CheckCircle size={18} />
                  Finaliser la connexion
                </button>
              </div>
            </div>

            <div className="platform-3shape-help">
              <p>
                <strong>Instructions :</strong>
              </p>
              <ol>
                <li>Cliquez sur "Se connecter à 3Shape"</li>
                <li>Connectez-vous avec vos identifiants 3Shape</li>
                <li>Vous serez redirigé vers une URL contenant le code</li>
                <li>Copiez les paramètres "code" et "state" depuis l'URL</li>
                <li>Collez-les dans les champs ci-dessus</li>
              </ol>
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
  const [threeshapeAuthUrl, setThreeshapeAuthUrl] = useState("");
  const [is3ShapeAuthLoading, setIs3ShapeAuthLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  // SWR hook pour le statut 3Shape
  const {
    data: threeshapeStatus,
    error: threeshapeError,
    mutate: mutateThreeshapeStatus,
  } = useSWR(
    isAuthenticated ? "threeshape-status" : null,
    check3ShapeAuthStatus,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Vérifier toutes les minutes
      errorRetryCount: 1,
      onError: () => {
        // Ignorer les erreurs silencieusement pour le statut 3Shape
      },
    }
  );

  // Détecter automatiquement les paramètres OAuth dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      console.log(
        "🔍 Code OAuth détecté dans l'URL:",
        code.substring(0, 10) + "..."
      );
      handleManualAuthCode(code, state);

      // Nettoyer l'URL après traitement
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handlers pour 3Shape OAuth
  const handle3ShapeConnect = useCallback(async (platform) => {
    try {
      setIs3ShapeAuthLoading(true);
      const authUrl = await initiate3ShapeAuth();
      setThreeshapeAuthUrl(authUrl);
      setIs3ShapeModalOpen(true);

      console.log("🔗 URL d'authentification 3Shape générée");
    } catch (err) {
      setError(
        "Erreur lors de l'initiation de la connexion 3Shape: " + err.message
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setIs3ShapeAuthLoading(false);
    }
  }, []);

  const handleManualAuthCode = useCallback(
    async (code, state) => {
      if (!code || !state) {
        setError("Code et état requis pour l'authentification");
        return;
      }

      try {
        setIs3ShapeAuthLoading(true);
        await complete3ShapeAuth(code, state);

        // Revalider le statut 3Shape
        mutateThreeshapeStatus();

        setSuccess("Connexion 3Shape établie avec succès !");
        setIs3ShapeModalOpen(false);
        setTimeout(() => setSuccess(null), 5000);

        console.log("✅ Authentification 3Shape réussie");
      } catch (err) {
        setError(
          "Erreur lors de la finalisation de l'authentification 3Shape: " +
            err.message
        );
        setTimeout(() => setError(null), 5000);
      } finally {
        setIs3ShapeAuthLoading(false);
      }
    },
    [mutateThreeshapeStatus]
  );

  const close3ShapeModal = useCallback(() => {
    setIs3ShapeModalOpen(false);
    setThreeshapeAuthUrl("");
  }, []);

  // Handlers optimisés existants
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        const token = localStorage.getItem("token");
        const url = editingPlatform
          ? `/api/platforms/${editingPlatform.id}`
          : "/api/platforms";
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

        // Mutation optimiste avec SWR
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

        // Revalider les données pour s'assurer de la cohérence
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
        const response = await fetch(`/api/platforms/${platformId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la plateforme");
        }

        // Mutation optimiste
        mutatePlatforms(
          platforms.filter((p) => p.id !== platformId),
          false
        );
        setSuccess("Plateforme supprimée avec succès");
        setTimeout(() => setSuccess(null), 3000);

        // Revalider pour s'assurer de la cohérence
        mutatePlatforms();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
        // En cas d'erreur, revalider pour restaurer l'état correct
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

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

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
                onClick={() => mutateThreeshapeStatus()}
                className="platform-refresh-btn"
                disabled={is3ShapeAuthLoading}
                title="Actualiser le statut 3Shape"
              >
                <RefreshCw
                  size={18}
                  className={is3ShapeAuthLoading ? "spinning" : ""}
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

          {/* 3Shape Status Banner */}
          {threeshapeStatus && (
            <div
              className={`platform-3shape-banner ${
                threeshapeStatus.authenticated ? "connected" : "disconnected"
              }`}
            >
              {threeshapeStatus.authenticated ? (
                <>
                  <CheckCircle size={20} />
                  <span>3Shape connecté et authentifié</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>
                    3Shape non connecté - Connectez une plateforme 3Shape pour
                    accéder aux données
                  </span>
                </>
              )}
            </div>
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
                    threeshapeStatus={threeshapeStatus}
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
              {({ isSubmitting }) => (
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
        authUrl={threeshapeAuthUrl}
        onManualCode={handleManualAuthCode}
      />
    </div>
  );
};

export default Platform;
