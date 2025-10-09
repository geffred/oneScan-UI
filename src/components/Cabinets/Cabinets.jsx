import React, { useState, useContext, useMemo, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR, { mutate } from "swr";
import emailjs from "@emailjs/browser";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  MapPin,
  Search,
  FileText,
  Phone,
  KeyRound,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cabinets.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const EMAILJS_PUBLIC_KEY = "rfexuIcDBNIIdOsf2";

emailjs.init(EMAILJS_PUBLIC_KEY);

// Schema de validation
const validationSchema = Yup.object({
  nom: Yup.string()
    .required("Le nom du cabinet est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
  numeroDeTelephone: Yup.string()
    .required("Le numéro de téléphone est requis")
    .matches(
      /^(\+?\d{1,3}[-\s]?)?\d{6,12}$/,
      "Format de numéro de téléphone européen invalide"
    ),
  adresseDeLivraison: Yup.string().max(
    255,
    "L'adresse de livraison ne peut pas dépasser 255 caractères"
  ),
  adresseDeFacturation: Yup.string().max(
    255,
    "L'adresse de facturation ne peut pas dépasser 255 caractères"
  ),
});

// Configuration EmailJS
const EMAILJS_SERVICE_ID = "service_ag5llz9";
const EMAILJS_TEMPLATE_ID = "template_7846xp8";

// Fonction de fetch pour SWR
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  return response.json();
};

// Fonction pour récupérer les cabinets
const getCabinets = async () => {
  return fetchWithAuth(`${API_BASE_URL}/cabinet`);
};

// Fonction pour récupérer les informations de l'utilisateur connecté
const getCurrentUser = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/auth/me`);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};

// Composant de ligne de tableau
const CabinetRow = React.memo(
  ({ cabinet, onEdit, onDelete, onSendPassword, sendingPasswords }) => (
    <div className="cabinet-table-row">
      <div className="cabinet-table-cell" data-label="Nom du Cabinet">
        <div className="cabinet-name-info">
          <Building2 size={18} className="cabinet-icon" />
          <span className="cabinet-name">{cabinet.nom}</span>
        </div>
      </div>

      <div className="cabinet-table-cell" data-label="Email">
        <div className="cabinet-email-info">
          <Mail size={16} className="cabinet-info-icon" />
          <span>{cabinet.email}</span>
        </div>
      </div>

      <div className="cabinet-table-cell" data-label="Téléphone">
        <div className="cabinet-email-info">
          <Phone size={16} className="cabinet-info-icon" />
          <span>{cabinet.numeroDeTelephone || "Non renseigné"}</span>
        </div>
      </div>

      <div className="cabinet-table-cell" data-label="Adresse de Livraison">
        <div className="cabinet-address-info">
          <MapPin size={16} className="cabinet-info-icon" />
          <span>{cabinet.adresseDeLivraison || "Non renseignée"}</span>
        </div>
      </div>

      <div className="cabinet-table-cell" data-label="Adresse de Facturation">
        <div className="cabinet-address-info">
          <FileText size={16} className="cabinet-info-icon" />
          <span>{cabinet.adresseDeFacturation || "Non renseignée"}</span>
        </div>
      </div>

      <div className="cabinet-table-cell" data-label="Statut Mot de Passe">
        <div className="cabinet-password-status">
          <span
            className={`password-status-badge ${
              cabinet.passwordSend ? "sent" : "not-sent"
            }`}
          >
            {cabinet.passwordSend ? "Envoyé" : "Non envoyé"}
          </span>
        </div>
      </div>

      <div className="cabinet-table-cell actions">
        <div className="cabinet-actions">
          <button
            onClick={() => onSendPassword(cabinet)}
            className={`cabinet-send-btn ${cabinet.passwordSend ? "sent" : ""}`}
            disabled={
              cabinet.passwordSend || sendingPasswords.includes(cabinet.id)
            }
            title={
              cabinet.passwordSend
                ? "Mot de passe déjà envoyé"
                : "Envoyer le mot de passe"
            }
            aria-label="Envoyer mot de passe"
          >
            {sendingPasswords.includes(cabinet.id) ? (
              <div className="cabinet-loading-spinner small"></div>
            ) : (
              <KeyRound />
            )}
          </button>
          <button
            onClick={() => onEdit(cabinet)}
            className="cabinet-edit-btn"
            title="Modifier"
            aria-label="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(cabinet.id)}
            className="cabinet-delete-btn"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
);

CabinetRow.displayName = "CabinetRow";

const Cabinet = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingPasswords, setSendingPasswords] = useState([]);
  const navigate = useNavigate();

  // SWR hook pour récupérer l'utilisateur connecté
  const {
    data: currentUser,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "currentUser" : null, getCurrentUser, {
    revalidateOnFocus: false,
  });

  // SWR hook pour les cabinets
  const {
    data: cabinetsData,
    error: cabinetsError,
    isLoading: cabinetsLoading,
    mutate: mutateCabinets,
  } = useSWR(isAuthenticated ? "cabinets" : null, getCabinets, {
    revalidateOnFocus: false,
  });

  const cabinets = cabinetsData || [];

  // Filtrage mémorisé
  const filteredCabinets = useMemo(() => {
    if (!searchTerm) return cabinets;

    const term = searchTerm.toLowerCase();
    return cabinets.filter(
      (cabinet) =>
        cabinet.nom.toLowerCase().includes(term) ||
        cabinet.email.toLowerCase().includes(term) ||
        cabinet.numeroDeTelephone?.toLowerCase().includes(term)
    );
  }, [cabinets, searchTerm]);

  // Valeurs initiales mémorisées
  const initialValues = useMemo(
    () => ({
      nom: editingCabinet?.nom || "",
      email: editingCabinet?.email || "",
      numeroDeTelephone: editingCabinet?.numeroDeTelephone || "",
      adresseDeLivraison: editingCabinet?.adresseDeLivraison || "",
      adresseDeFacturation: editingCabinet?.adresseDeFacturation || "",
    }),
    [editingCabinet]
  );

  // Gestion des erreurs
  React.useEffect(() => {
    if (cabinetsError) {
      setError("Erreur lors de la récupération des cabinets");
      setTimeout(() => setError(null), 3000);
    }
    if (userError) {
      setError("Erreur lors de la récupération des informations utilisateur");
      setTimeout(() => setError(null), 3000);
    }
  }, [cabinetsError, userError]);

  // Redirection si non authentifié
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // =======================
  // Handler principal de soumission
  // =======================
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const url = editingCabinet
          ? `${API_BASE_URL}/cabinet/${editingCabinet.id}`
          : `${API_BASE_URL}/cabinet`;

        const method = editingCabinet ? "PUT" : "POST";

        // ✅ CORRECTION : Payload correct pour l'API
        const payload = {
          nom: values.nom,
          email: values.email,
          numeroDeTelephone: values.numeroDeTelephone,
          adresseDeLivraison: values.adresseDeLivraison || "",
          adresseDeFacturation: values.adresseDeFacturation || "",
          // Le mot de passe est généré automatiquement par le backend
          // Ne pas l'envoyer depuis le frontend
        };

        console.log("Envoi payload:", payload);

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.message ||
              `Erreur ${response.status} lors de ${
                editingCabinet ? "la modification" : "la création"
              }`
          );
        }

        // ✅ CORRECTION : Gestion correcte de la réponse
        let updatedCabinet;
        if (editingCabinet) {
          // Pour la modification, la réponse contient directement le cabinet
          updatedCabinet = responseData;
          mutateCabinets(
            cabinets.map((c) =>
              c.id === updatedCabinet.id ? updatedCabinet : c
            ),
            false
          );
          setSuccess("Cabinet modifié avec succès");
        } else {
          // Pour la création, la réponse a une structure différente
          updatedCabinet = responseData.cabinet;
          mutateCabinets([...cabinets, updatedCabinet], false);
          setSuccess("Cabinet créé avec succès");
        }

        setIsModalOpen(false);
        setEditingCabinet(null);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);

        // Revalider les données
        mutateCabinets();
      } catch (err) {
        console.error("Erreur détaillée:", err);
        setError(err.message || "Une erreur est survenue");
        setTimeout(() => setError(null), 5000);
      } finally {
        setSubmitting(false);
      }
    },
    [editingCabinet, cabinets, mutateCabinets]
  );

  // =======================
  // Handler envoi mot de passe (simplifié)
  // =======================
  const handleSendPassword = useCallback(
    async (cabinet) => {
      setSendingPasswords((prev) => [...prev, cabinet.id]);

      try {
        const token = localStorage.getItem("token");

        // Appeler l'API pour régénérer le mot de passe
        const regenerateResponse = await fetch(
          `${API_BASE_URL}/cabinet/${cabinet.id}/regenerate-password`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!regenerateResponse.ok) {
          throw new Error("Erreur lors de la génération du mot de passe");
        }

        const regenerateData = await regenerateResponse.json();
        const newPassword = regenerateData.newPassword;

        // Envoyer l'email avec le nouveau mot de passe
        const templateParams = {
          to_email: cabinet.email,
          cabinet_name: cabinet.nom,
          password: newPassword,
          to_name: cabinet.nom,
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );

        // Marquer comme envoyé
        const markResponse = await fetch(
          `${API_BASE_URL}/cabinet/${cabinet.id}/mark-password-sent`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!markResponse.ok) {
          throw new Error("Erreur lors de la mise à jour du statut d'envoi");
        }

        const updatedCabinet = { ...cabinet, passwordSend: true };
        mutateCabinets(
          cabinets.map((c) => (c.id === cabinet.id ? updatedCabinet : c)),
          false
        );

        setSuccess(`Mot de passe envoyé avec succès à ${cabinet.nom}`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
        setError(`Erreur lors de l'envoi du mot de passe: ${error.message}`);
        setTimeout(() => setError(null), 5000);
      } finally {
        setSendingPasswords((prev) => prev.filter((id) => id !== cabinet.id));
      }
    },
    [cabinets, mutateCabinets]
  );

  // =======================
  // Autres handlers
  // =======================
  const handleEdit = useCallback((cabinet) => {
    setEditingCabinet(cabinet);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (cabinetId) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cabinet ?")) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/cabinet/${cabinetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du cabinet");
        }

        mutateCabinets(
          cabinets.filter((c) => c.id !== cabinetId),
          false
        );
        setSuccess("Cabinet supprimé avec succès");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      }
    },
    [cabinets, mutateCabinets]
  );

  const openCreateModal = useCallback(() => {
    setEditingCabinet(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCabinet(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const isLoading = userLoading || cabinetsLoading;

  return (
    <div className="cabinet-main-wrapper">
      <div className="cabinet-content-container">
        <div className="cabinet-management-card">
          {/* Header */}
          <div className="cabinet-management-header">
            <h1 className="cabinet-management-title">
              <div className="cabinet-management-icon">
                <Building2 size={24} />
              </div>
              Gestion des Cabinets
              {currentUser && (
                <span className="cabinet-user-info">
                  - {currentUser.firstName} {currentUser.lastName}
                </span>
              )}
            </h1>
            <button
              onClick={openCreateModal}
              className="cabinet-create-btn"
              disabled={isLoading}
            >
              <Plus size={18} />
              {isLoading ? "Chargement..." : "Ajouter un cabinet"}
            </button>
          </div>

          {/* Status Messages */}
          {error && <div className="cabinet-error-notification">{error}</div>}
          {success && (
            <div className="cabinet-success-notification">{success}</div>
          )}

          {/* Search Bar */}
          <div className="cabinet-search-section">
            <div className="cabinet-search-wrapper">
              <Search className="cabinet-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un cabinet..."
                className="cabinet-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Cabinets List */}
          <div className="cabinet-list-container">
            {isLoading ? (
              <div className="cabinet-list-loading">
                <div className="cabinet-loading-spinner"></div>
                <p>Chargement des cabinets...</p>
              </div>
            ) : filteredCabinets.length === 0 ? (
              <div className="cabinet-empty-state">
                <Building2 size={48} />
                <h3>Aucun cabinet trouvé</h3>
                <p>
                  {searchTerm
                    ? "Aucun cabinet ne correspond à votre recherche."
                    : "Commencez par ajouter votre premier cabinet."}
                </p>
              </div>
            ) : (
              <div className="cabinet-table-container">
                <div className="cabinet-table-header">
                  <div className="cabinet-table-cell header">
                    Nom du Cabinet
                  </div>
                  <div className="cabinet-table-cell header">Email</div>
                  <div className="cabinet-table-cell header">Téléphone</div>
                  <div className="cabinet-table-cell header">
                    Adresse Livraison
                  </div>
                  <div className="cabinet-table-cell header">
                    Adresse Facturation
                  </div>
                  <div className="cabinet-table-cell header">
                    Statut Mot de Passe
                  </div>
                  <div className="cabinet-table-cell header actions">
                    Actions
                  </div>
                </div>
                <div className="cabinet-table-body">
                  {filteredCabinets.map((cabinet) => (
                    <CabinetRow
                      key={cabinet.id}
                      cabinet={cabinet}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSendPassword={handleSendPassword}
                      sendingPasswords={sendingPasswords}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="cabinet-modal-overlay">
          <div className="cabinet-modal">
            <div className="cabinet-modal-header">
              <h2>
                {editingCabinet ? "Modifier le cabinet" : "Ajouter un cabinet"}
              </h2>
              <button onClick={closeModal} className="cabinet-modal-close">
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
                <Form className="cabinet-modal-form">
                  <div className="cabinet-form-fields">
                    <div className="cabinet-input-group">
                      <label className="cabinet-field-label">
                        Nom du cabinet *
                      </label>
                      <div className="cabinet-input-wrapper">
                        <Building2 className="cabinet-input-icon" />
                        <Field
                          name="nom"
                          type="text"
                          className="cabinet-text-input"
                          placeholder="Cabinet Médical Dr. Dupont"
                        />
                      </div>
                      <ErrorMessage
                        name="nom"
                        component="div"
                        className="cabinet-error-message"
                      />
                    </div>

                    <div className="cabinet-input-group">
                      <label className="cabinet-field-label">Email *</label>
                      <div className="cabinet-input-wrapper">
                        <Mail className="cabinet-input-icon" />
                        <Field
                          name="email"
                          type="email"
                          className="cabinet-text-input"
                          placeholder="contact@cabinet.fr"
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="cabinet-error-message"
                      />
                    </div>

                    <div className="cabinet-input-group">
                      <label className="cabinet-field-label">
                        Numéro de téléphone *
                      </label>
                      <div className="cabinet-input-wrapper">
                        <Phone className="cabinet-input-icon" />
                        <Field
                          name="numeroDeTelephone"
                          type="tel"
                          className="cabinet-text-input"
                          placeholder="01 23 45 67 89"
                        />
                      </div>
                      <ErrorMessage
                        name="numeroDeTelephone"
                        component="div"
                        className="cabinet-error-message"
                      />
                    </div>

                    <div className="cabinet-input-group">
                      <label className="cabinet-field-label">
                        Adresse de livraison
                      </label>
                      <div className="cabinet-input-wrapper">
                        <MapPin className="cabinet-input-icon" />
                        <Field
                          name="adresseDeLivraison"
                          type="text"
                          className="cabinet-text-input"
                          placeholder="123 Rue de la Santé, 75013 Paris"
                        />
                      </div>
                      <ErrorMessage
                        name="adresseDeLivraison"
                        component="div"
                        className="cabinet-error-message"
                      />
                    </div>

                    <div className="cabinet-input-group">
                      <label className="cabinet-field-label">
                        Adresse de facturation
                      </label>
                      <div className="cabinet-input-wrapper">
                        <FileText className="cabinet-input-icon" />
                        <Field
                          name="adresseDeFacturation"
                          type="text"
                          className="cabinet-text-input"
                          placeholder="123 Rue de la Facturation, 75013 Paris"
                        />
                      </div>
                      <ErrorMessage
                        name="adresseDeFacturation"
                        component="div"
                        className="cabinet-error-message"
                      />
                    </div>
                  </div>

                  <div className="cabinet-modal-actions">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="cabinet-cancel-btn"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cabinet-save-btn"
                    >
                      {isSubmitting ? (
                        <div className="cabinet-loading-container">
                          <div className="cabinet-loading-spinner"></div>
                          {editingCabinet ? "Modification..." : "Création..."}
                        </div>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingCabinet ? "Modifier" : "Créer"}
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
  );
};

export default Cabinet;
