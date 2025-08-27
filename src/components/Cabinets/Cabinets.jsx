import React, { useState, useContext, useMemo, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR, { mutate } from "swr";
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
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cabinets.css";

// Schema de validation mis en cache
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

// Fonction de fetch pour SWR
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

// Fonction pour récupérer les cabinets
const getCabinets = async () => {
  return fetchWithAuth("/api/cabinet");
};

// Fonction pour récupérer les informations de l'utilisateur connecté
const getCurrentUser = async () => {
  try {
    return await fetchWithAuth("/api/auth/me"); // Endpoint pour récupérer l'utilisateur connecté
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};

// Composant de ligne de tableau optimisé avec React.memo
const CabinetRow = React.memo(({ cabinet, onEdit, onDelete }) => (
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

    <div className="cabinet-table-cell actions">
      <div className="cabinet-actions">
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
));

CabinetRow.displayName = "CabinetRow";

// Composant de chargement optimisé pour la liste
const ListLoadingSpinner = React.memo(() => (
  <div className="cabinet-list-loading">
    <div className="cabinet-loading-spinner" aria-label="Chargement"></div>
    <p>Chargement des cabinets...</p>
  </div>
));

ListLoadingSpinner.displayName = "ListLoadingSpinner";

// État vide optimisé
const EmptyState = React.memo(({ searchTerm }) => (
  <div className="cabinet-empty-state">
    <Building2 size={48} />
    <h3>Aucun cabinet trouvé</h3>
    <p>
      {searchTerm
        ? "Aucun cabinet ne correspond à votre recherche."
        : "Commencez par ajouter votre premier cabinet."}
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

const Cabinet = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // SWR hook pour récupérer l'utilisateur connecté
  const {
    data: currentUser,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "currentUser" : null, getCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    onError: (error) => {
      console.error("Erreur SWR utilisateur:", error);
    },
  });

  // SWR hook pour les cabinets
  const {
    data: cabinets = [],
    error: cabinetsError,
    isLoading: cabinetsLoading,
    mutate: mutateCabinets,
  } = useSWR(isAuthenticated ? "cabinets" : null, getCabinets, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    errorRetryCount: 3,
    errorRetryInterval: 1000,
  });

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

  // Handlers optimisés
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        // Vérifier que l'utilisateur est bien chargé
        if (!currentUser?.id) {
          throw new Error("Informations utilisateur non disponibles");
        }

        const token = localStorage.getItem("token");
        const url = editingCabinet
          ? `/api/cabinet/${editingCabinet.id}`
          : "/api/cabinet";
        const method = editingCabinet ? "PUT" : "POST";

        // Ajouter l'userId aux données envoyées
        const payload = {
          ...values,
          userId: currentUser.id, // Ajouter l'ID de l'utilisateur connecté
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            errorData ||
              `Erreur lors de ${
                editingCabinet ? "la modification" : "la création"
              } du cabinet`
          );
        }

        const data = await response.json();

        // Mutation optimiste avec SWR
        if (editingCabinet) {
          mutateCabinets(
            cabinets.map((c) => (c.id === data.id ? data : c)),
            false
          );
          setSuccess("Cabinet modifié avec succès");
        } else {
          mutateCabinets([...cabinets, data], false);
          setSuccess("Cabinet créé avec succès");
        }

        setIsModalOpen(false);
        setEditingCabinet(null);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);

        // Revalider les données pour s'assurer de la cohérence
        mutateCabinets();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      } finally {
        setSubmitting(false);
      }
    },
    [editingCabinet, cabinets, mutateCabinets, currentUser]
  );

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
        const response = await fetch(`/api/cabinet/${cabinetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du cabinet");
        }

        // Mutation optimiste
        mutateCabinets(
          cabinets.filter((c) => c.id !== cabinetId),
          false
        );
        setSuccess("Cabinet supprimé avec succès");
        setTimeout(() => setSuccess(null), 3000);

        // Revalider pour s'assurer de la cohérence
        mutateCabinets();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
        // En cas d'erreur, revalider pour restaurer l'état correct
        mutateCabinets();
      }
    },
    [cabinets, mutateCabinets]
  );

  const openCreateModal = useCallback(() => {
    console.log("openCreateModal appelé", { currentUser, userLoading });

    // Vérifier que l'utilisateur est chargé avant d'ouvrir le modal
    if (userLoading) {
      setError("Chargement des informations utilisateur en cours...");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!currentUser?.id) {
      setError(
        "Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter."
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    setEditingCabinet(null);
    setIsModalOpen(true);
  }, [currentUser, userLoading]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCabinet(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Affichage de debug pour vérifier l'état
  React.useEffect(() => {
    console.log("État du composant:", {
      isAuthenticated,
      currentUser,
      userLoading,
      userError,
      cabinetsLoading,
      cabinetsError,
    });
  }, [
    isAuthenticated,
    currentUser,
    userLoading,
    userError,
    cabinetsLoading,
    cabinetsError,
  ]);

  // Affichage immédiat de l'interface
  if (!isAuthenticated) {
    return null; // ou un composant de redirection
  }

  // Afficher un spinner si les données utilisateur ne sont pas encore chargées
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
              disabled={userLoading}
            >
              <Plus size={18} />
              {userLoading
                ? "Chargement utilisateur..."
                : cabinetsLoading
                ? "Chargement cabinets..."
                : "Ajouter un cabinet"}
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
              <ListLoadingSpinner />
            ) : filteredCabinets.length === 0 ? (
              <EmptyState searchTerm={searchTerm} />
            ) : (
              <div className="cabinet-table-container">
                <div className="cabinet-table-header">
                  <div className="cabinet-table-cell header">
                    Nom du Cabinet
                  </div>
                  <div className="cabinet-table-cell header">Email</div>
                  <div className="cabinet-table-cell header">Téléphone</div>
                  <div className="cabinet-table-cell header">
                    Adresse de Livraison
                  </div>
                  <div className="cabinet-table-cell header">
                    Adresse de Facturation
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
              {({ isSubmitting }) => (
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
                      disabled={isSubmitting || !currentUser?.id}
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
