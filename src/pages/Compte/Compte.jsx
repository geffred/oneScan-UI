import React, { useState, useEffect } from "react";
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
  Globe,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Compte.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const countries = [
  { value: "FR", label: "France" },
  { value: "BE", label: "Belgique" },
  { value: "CH", label: "Suisse" },
  { value: "CA", label: "Canada" },
  { value: "LU", label: "Luxembourg" },
];

const Compte = () => {
  const {
    isAuthenticated,
    userType,
    userData: contextUserData,
    logout,
  } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Si l'utilisateur est un cabinet, rediriger vers la page spécifique
    if (userType === "cabinet") {
      navigate("/compte/cabinet");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token non trouvé");
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
        console.error("Erreur fetchUserData:", err);
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate, userType]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("Le prénom est requis"),
    lastName: Yup.string().required("Le nom est requis"),
    phone: Yup.string().matches(
      /^\+?[0-9\s-]+$/,
      "Numéro de téléphone invalide"
    ),
    country: Yup.string(),
    companyType: Yup.string(),
    newsletter: Yup.boolean(),
    currentPassword: Yup.string().when("newPassword", {
      is: (val) => val && val.length > 0,
      then: () =>
        Yup.string().required(
          "Le mot de passe actuel est requis pour changer le mot de passe"
        ),
      otherwise: () => Yup.string(),
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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé");
      }

      // Préparer les données à envoyer (sans les mots de passe vides)
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        country: values.country,
        companyType: values.companyType,
        newsletter: values.newsletter,
      };

      // Ajouter les mots de passe seulement s'ils sont fournis
      if (values.newPassword && values.currentPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      const response = await fetch(`${API_BASE_URL}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour des données"
        );
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
      setSuccess("Vos informations ont été mises à jour avec succès");

      // Réinitialiser les champs de mot de passe
      resetForm({
        values: {
          ...values,
          currentPassword: "",
          newPassword: "",
        },
      });

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
      console.error("Erreur handleSubmit:", err);
      setTimeout(() => setError(null), 5000);
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
      if (!token) {
        throw new Error("Token non trouvé");
      }

      const response = await fetch(`${API_BASE_URL}/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la suppression du compte"
        );
      }

      logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
      console.error("Erreur handleDeleteAccount:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
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

            {error && (
              <div className="compte-error-notification">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="compte-notification-close"
                >
                  ×
                </button>
              </div>
            )}
            {success && (
              <div className="compte-success-notification">
                {success}
                <button
                  onClick={() => setSuccess(null)}
                  className="compte-notification-close"
                >
                  ×
                </button>
              </div>
            )}

            <Formik
              initialValues={{
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
                phone: userData.phone || "",
                country: userData.country || "",
                companyType: userData.companyType || "",
                newsletter: userData.newsletter || false,
                currentPassword: "",
                newPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values, resetForm }) => (
                <Form className="compte-profile-form">
                  <div className="compte-form-fields-grid">
                    <div className="compte-input-field-group">
                      <label htmlFor="firstName" className="compte-field-label">
                        Prénom *
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
                        Nom *
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
                          className="compte-text-input-field compte-email-disabled"
                          disabled={true} // Email toujours non modifiable
                        />
                      </div>
                      {isEditing && (
                        <small className="compte-field-note">
                          L'email ne peut pas être modifié
                        </small>
                      )}
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
                      <label htmlFor="country" className="compte-field-label">
                        Pays
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Globe className="compte-input-field-icon" />
                        <Field
                          as="select"
                          name="country"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        >
                          <option value="">Sélectionnez un pays</option>
                          {countries.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="country"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    <div className="compte-input-field-group">
                      <label
                        htmlFor="companyType"
                        className="compte-field-label"
                      >
                        Type d'entreprise
                      </label>
                      <div className="compte-input-field-wrapper">
                        <Building className="compte-input-field-icon" />
                        <Field
                          name="companyType"
                          type="text"
                          className="compte-text-input-field"
                          disabled={!isEditing}
                        />
                      </div>
                      <ErrorMessage
                        name="companyType"
                        component="div"
                        className="compte-field-error-message"
                      />
                    </div>

                    {isEditing && (
                      <>
                        <div className="compte-password-section-header">
                          <h3>Changer le mot de passe (optionnel)</h3>
                        </div>

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
                              type={showCurrentPassword ? "text" : "password"}
                              className="compte-text-input-field"
                              placeholder="Laissez vide si vous ne souhaitez pas changer"
                            />
                            <button
                              type="button"
                              className="compte-password-visibility-toggle"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
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
                              type={showNewPassword ? "text" : "password"}
                              className="compte-text-input-field"
                              placeholder="Minimum 6 caractères"
                            />
                            <button
                              type="button"
                              className="compte-password-visibility-toggle"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
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
                        onClick={() => {
                          setIsEditing(false);
                          resetForm();
                          setError(null);
                          setSuccess(null);
                        }}
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
              <div className="compte-account-actions-section">
                <button
                  onClick={handleLogout}
                  className="compte-logout-account-btn"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>

                {/*       <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="compte-delete-account-btn"
                >
                  <Trash2 size={18} />
                  {isDeleting
                    ? "Suppression en cours..."
                    : "Supprimer mon compte"}
                </button>*/}
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="dashboardpage-footer">
        <div className="dashboardpage-footer-content">
          <p className="dashboardpage-footer-text">
            &copy; Mysmilelab
            <label>Tous les droits sont réservés.</label>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Compte;
