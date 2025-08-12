import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cabinets.css";

const Cabinets = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cabinets, setCabinets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCabinets();
  }, [isAuthenticated, navigate]);

  const fetchCabinets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/cabinet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des cabinets");
      }

      const data = await response.json();
      setCabinets(data);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    nom: Yup.string()
      .required("Le nom du cabinet est requis")
      .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    adresseDeLivraison: Yup.string().max(
      255,
      "L'adresse de livraison ne peut pas dépasser 255 caractères"
    ),
    adresseDeFacturation: Yup.string().max(
      255,
      "L'adresse de facturation ne peut pas dépasser 255 caractères"
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      const url = editingCabinet
        ? `/api/cabinet/${editingCabinet.id}`
        : "/api/cabinet";
      const method = editingCabinet ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
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

      if (editingCabinet) {
        setCabinets(cabinets.map((c) => (c.id === data.id ? data : c)));
        setSuccess("Cabinet modifié avec succès");
      } else {
        setCabinets([...cabinets, data]);
        setSuccess("Cabinet créé avec succès");
      }

      setIsModalOpen(false);
      setEditingCabinet(null);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cabinet) => {
    setEditingCabinet(cabinet);
    setIsModalOpen(true);
  };

  const handleDelete = async (cabinetId) => {
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

      setCabinets(cabinets.filter((c) => c.id !== cabinetId));
      setSuccess("Cabinet supprimé avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const openCreateModal = () => {
    setEditingCabinet(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCabinet(null);
  };

  const filteredCabinets = cabinets.filter(
    (cabinet) =>
      cabinet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabinet.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="cabinet-initial-loading">
        <div className="cabinet-loading-spinner"></div>
        <p>Chargement des cabinets...</p>
      </div>
    );
  }

  return (
    <>
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
              </h1>
              <button onClick={openCreateModal} className="cabinet-create-btn">
                <Plus size={18} />
                Ajouter un cabinet
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Cabinets List */}
            <div className="cabinet-list-container">
              {filteredCabinets.length === 0 ? (
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
                      <div key={cabinet.id} className="cabinet-table-row">
                        <div className="cabinet-table-cell">
                          <div className="cabinet-name-info">
                            <Building2 size={18} className="cabinet-icon" />
                            <span className="cabinet-name">{cabinet.nom}</span>
                          </div>
                        </div>
                        <div className="cabinet-table-cell">
                          <div className="cabinet-email-info">
                            <Mail size={16} className="cabinet-info-icon" />
                            <span>{cabinet.email}</span>
                          </div>
                        </div>
                        <div className="cabinet-table-cell">
                          <div className="cabinet-address-info">
                            <MapPin size={16} className="cabinet-info-icon" />
                            <span>
                              {cabinet.adresseDeLivraison || "Non renseignée"}
                            </span>
                          </div>
                        </div>
                        <div className="cabinet-table-cell">
                          <div className="cabinet-address-info">
                            <FileText size={16} className="cabinet-info-icon" />
                            <span>
                              {cabinet.adresseDeFacturation || "Non renseignée"}
                            </span>
                          </div>
                        </div>
                        <div className="cabinet-table-cell actions">
                          <div className="cabinet-actions">
                            <button
                              onClick={() => handleEdit(cabinet)}
                              className="cabinet-edit-btn"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(cabinet.id)}
                              className="cabinet-delete-btn"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
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
                  {editingCabinet
                    ? "Modifier le cabinet"
                    : "Ajouter un cabinet"}
                </h2>
                <button onClick={closeModal} className="cabinet-modal-close">
                  <X size={24} />
                </button>
              </div>

              <Formik
                initialValues={{
                  nom: editingCabinet?.nom || "",
                  email: editingCabinet?.email || "",
                  adresseDeLivraison: editingCabinet?.adresseDeLivraison || "",
                  adresseDeFacturation:
                    editingCabinet?.adresseDeFacturation || "",
                }}
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
    </>
  );
};

export default Cabinets;
