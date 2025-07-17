// Compte.jsx
import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  User,
  Mail,
  Phone,
  Home,
  Building,
  Save,
  Edit,
  Trash2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Compte.css";

const Compte = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

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
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("Le prénom est requis"),
    lastName: Yup.string().required("Le nom est requis"),
    email: Yup.string().email("Email invalide").required("L'email est requis"),
    phone: Yup.string().matches(
      /^\+?[0-9\s-]+$/,
      "Numéro de téléphone invalide"
    ),
    address: Yup.string(),
    company: Yup.string(),
    newsletter: Yup.boolean(),
    currentPassword: Yup.string().when("newPassword", {
      is: (val) => val && val.length > 0,
      then: Yup.string().required(
        "Le mot de passe actuel est requis pour changer le mot de passe"
      ),
    }),
    newPassword: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .test(
        "not-equal",
        "Le nouveau mot de passe doit être différent de l'ancien",
        function (value) {
          return !value || value !== this.parent.currentPassword;
        }
      ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des données");
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
      setSuccess("Vos informations ont été mises à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte");
      }

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!userData) {
    return (
      <div className="compte-initial-loading">
        <div className="compte-loading-spinner"></div>
        <p>Chargement de vos informations...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="compte-main-wrapper">
        <div className="compte-content-container">
          <div className="compte-profile-card">
            <div className="compte-profile-header">
              <h1 className="compte-profile-title">
                <div className="compte-profile-icon">
                  <User size={24} />
                </div>
                Mon Compte
              </h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="compte-edit-profile-btn"
                >
                  <Edit size={18} />
                  Modifier
                </button>
              )}
            </div>

            {error && <div className="compte-error-notification">{error}</div>}
            {success && (
              <div className="compte-success-notification">{success}</div>
            )}

            <Formik
              initialValues={{
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
                phone: userData.phone || "",
                address: userData.address || "",
                company: userData.company || "",
                newsletter: userData.newsletter || false,
                currentPassword: "",
                newPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values }) => (
                <Form className="compte-profile-form">
                  <div className="compte-form-fields-grid">
                    <div className="compte-input-field-group">
                      <label htmlFor="firstName" className="compte-field-label">
                        Prénom
                      </label>
                      <div className="compte-input-field-wrapper">
                        <User className="compte-input-field-icon" />
                        <Field
                          name="firstName"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label htmlFor="lastName" className="compte-field-label">
                        Nom
                      </label>
                      <div className="compte-input-field-wrapper">
                        <User className="compte-input-field-icon" />
                        <Field
                          name="lastName"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label htmlFor="email" className="compte-field-label">
                        Email
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Mail className="compte-input-field-icon" />
                        <Field
                          name="email"
                          type="email"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label htmlFor="phone" className="compte-field-label">
                        Téléphone
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Phone className="compte-input-field-icon" />
                        <Field
                          name="phone"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label htmlFor="address" className="compte-field-label">
                        Adresse
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Home className="compte-input-field-icon" />
                        <Field
                          name="address"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label htmlFor="company" className="compte-field-label">
                        Entreprise
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Building className="compte-input-field-icon" />
                        <Field
                          name="company"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="company"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    {isEditing && (
                      <>
                        <div className="compte-input-field-group">
                          <label
                            htmlFor="currentPassword"
                            className="compte-field-label"
                          >
                            Mot de passe actuel
                          </label>
                          <div className="compte-input-field-wrapper">
                            <Lock className="compte-input-field-icon" />
                            <Field
                              name="currentPassword"
                              type={showPassword ? "text" : "password"}
                              className="compte-text-input-field"
                            />
                            <button
                              type="button"
                              className="compte-password-visibility-toggle"
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
                            name="currentPassword"
                            component="div"
                            className="compte-field-error-message"
                          />
                        </div>

                        <div className="compte-input-field-group">
                          <label
                            htmlFor="newPassword"
                            className="compte-field-label"
                          >
                            Nouveau mot de passe
                          </label>
                          <div className="compte-input-field-wrapper">
                            <Lock className="compte-input-field-icon" />
                            <Field
                              name="newPassword"
                              type={showPassword ? "text" : "password"}
                              className="compte-text-input-field"
                            />
                            <button
                              type="button"
                              className="compte-password-visibility-toggle"
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
                            name="newPassword"
                            component="div"
                            className="compte-field-error-message"
                          />
                        </div>
                      </>
                    )}

                    <div className="compte-input-field-group">
                      <div className="compte-newsletter-checkbox-wrapper">
                        <Field
                          name="newsletter"
                          type="checkbox"
                          id="newsletter"
                          className="compte-newsletter-checkbox"
                          disabled={!isEditing}
                        />
                        <label
                          htmlFor="newsletter"
                          className="compte-newsletter-checkbox-label"
                        >
                          Recevoir la newsletter
                        </label>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="compte-form-action-buttons">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="compte-cancel-changes-btn"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="compte-save-changes-btn"
                      >
                        {isSubmitting ? (
                          <div className="compte-loading-spinner-container">
                            <div className="compte-loading-spinner"></div>
                            Enregistrement...
                          </div>
                        ) : (
                          <>
                            <Save size={18} />
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>

            {!isEditing && (
              <div className="compte-delete-account-section">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="compte-delete-account-btn"
                >
                  <Trash2 size={18} />
                  {isDeleting
                    ? "Suppression en cours..."
                    : "Supprimer mon compte"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="dashboardpage-footer">
        <div className="dashboardpage-footer-content">
          <p className="dashboardpage-footer-text">
            &copy; IA Lab
            <label>Tous les droits sont réservés.</label>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Compte;
