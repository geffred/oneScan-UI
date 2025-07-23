// Platform.jsx
import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Platform.css";

const Platform = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Configuration de chiffrement
  const SECRET_KEY = "MaCleSecrete12345"; // À remplacer par une clé sécurisée en production

  const platformTypes = [
    { value: "ITERO", label: "Itero" },
    { value: "THREESHAPE", label: "3Shape" },
    { value: "DEXIS", label: "Dexis" },
    { value: "MEDITLINK", label: "Meditlink" },
    { value: "AUTRE", label: "Autre" },
  ];

  // Fonction de chiffrement
  const encryptPassword = (password) => {
    try {
      return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    } catch (error) {
      console.error("Erreur lors du chiffrement:", error);
      return password; // En cas d'erreur, retourne le mot de passe non chiffré
    }
  };

  // Fonction pour déchiffrer (si besoin d'afficher le mot de passe en clair dans l'UI)
  // À utiliser avec précaution et seulement si nécessaire
  const decryptPassword = (encryptedPassword) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Erreur lors du déchiffrement:", error);
      return encryptedPassword;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userEmail = JSON.parse(atob(token.split(".")[1])).sub;

        const response = await fetch(`/api/auth/user/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (userData?.id) {
      fetchPlatforms();
    }
  }, [userData]);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/platforms/user/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des plateformes");
      }

      const data = await response.json();
      setPlatforms(data);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Le nom de la plateforme est requis"),
    email: Yup.string().email("Email invalide").required("L'email est requis"),
    password: Yup.string().required("Le mot de passe est requis"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      const url = editingPlatform
        ? `/api/platforms/${editingPlatform.id}`
        : "/api/platforms";
      const method = editingPlatform ? "PUT" : "POST";

      // Chiffrer le mot de passe avant l'envoi
      const encryptedPassword = encryptPassword(values.password);

      const platformData = {
        ...values,
        password: encryptedPassword,
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
        setPlatforms(platforms.map((p) => (p.id === data.id ? data : p)));
        setSuccess("Plateforme modifiée avec succès");
      } else {
        setPlatforms([...platforms, data]);
        setSuccess("Plateforme créée avec succès");
      }

      setIsModalOpen(false);
      setEditingPlatform(null);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (platform) => {
    // Déchiffrer le mot de passe seulement pour l'affichage dans le formulaire
    const platformToEdit = {
      ...platform,
      password: decryptPassword(platform.password),
    };
    setEditingPlatform(platformToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (platformId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette plateforme ?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/platforms/${platformId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la plateforme");
      }

      setPlatforms(platforms.filter((p) => p.id !== platformId));
      setSuccess("Plateforme supprimée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const openCreateModal = () => {
    setEditingPlatform(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlatform(null);
    setShowPassword(false);
  };

  const filteredPlatforms = platforms.filter(
    (platform) =>
      platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platform.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !userData) {
    return (
      <div className="platform-initial-loading">
        <div className="platform-loading-spinner"></div>
        <p>Chargement des plateformes...</p>
      </div>
    );
  }

  return (
    <>
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
              <button onClick={openCreateModal} className="platform-create-btn">
                <Plus size={18} />
                Ajouter une plateforme
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="platform-error-notification">{error}</div>
            )}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Platforms List */}
            <div className="platform-list-container">
              {filteredPlatforms.length === 0 ? (
                <div className="platform-empty-state">
                  <Monitor size={48} />
                  <h3>Aucune plateforme trouvée</h3>
                  <p>
                    {searchTerm
                      ? "Aucune plateforme ne correspond à votre recherche."
                      : "Commencez par ajouter votre première plateforme."}
                  </p>
                </div>
              ) : (
                <div className="platform-grid">
                  {filteredPlatforms.map((platform) => (
                    <div key={platform.id} className="platform-card">
                      <div className="platform-card-header">
                        <h3 className="platform-card-title">{platform.name}</h3>
                      </div>
                      <div className="platform-card-content">
                        <div className="platform-card-info">
                          <Mail size={16} />
                          <span>{platform.email}</span>
                        </div>
                        <div className="platform-card-status">
                          <span className="platform-connected-status">
                            Connecté
                          </span>
                        </div>
                      </div>
                      <div className="platform-card-actions">
                        <button
                          onClick={() => handleEdit(platform)}
                          className="platform-edit-btn"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(platform.id)}
                          className="platform-delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
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
                initialValues={{
                  name: editingPlatform?.name || "",
                  email: editingPlatform?.email || "",
                  password: editingPlatform?.password || "",
                }}
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
                            <option value="">
                              Sélectionner une plateforme
                            </option>
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
                            onClick={() => setShowPassword(!showPassword)}
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
                            {editingPlatform
                              ? "Modification..."
                              : "Création..."}
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
      </div>
    </>
  );
};

export default Platform;
