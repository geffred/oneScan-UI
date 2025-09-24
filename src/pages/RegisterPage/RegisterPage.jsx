import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Building,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

// Variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const companyTypes = [
    { value: "prothesiste", label: "Prothésiste Dentaire" },
    { value: "dentiste", label: "Dentiste" },
    { value: "universite", label: "Université / École" },
    { value: "particulier", label: "Particulier" },
  ];

  const countries = [
    { value: "FR", label: "France" },
    { value: "BE", label: "Belgique" },
    { value: "CH", label: "Suisse" },
    { value: "CA", label: "Canada" },
    { value: "LU", label: "Luxembourg" },
  ];

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères")
      .required("Le prénom est requis"),
    lastName: Yup.string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères")
      .required("Le nom est requis"),
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    password: Yup.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      )
      .required("Le mot de passe est requis"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        "Les mots de passe ne correspondent pas"
      )
      .required("La confirmation du mot de passe est requise"),
    phone: Yup.string()
      .matches(
        /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
        "Format de téléphone invalide (ex: +33123456789 ou 0123456789)"
      )
      .required("Le téléphone est requis"),
    country: Yup.string().required("Le pays est requis"),
    companyType: Yup.string().required("Le type de société est requis"),
    acceptTerms: Yup.boolean()
      .oneOf([true], "Vous devez accepter les conditions générales")
      .required("Vous devez accepter les conditions générales"),
    newsletter: Yup.boolean(),
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    companyType: "",
    acceptTerms: false,
    newsletter: false,
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          country: values.country,
          companyType: values.companyType,
          newsletter: values.newsletter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/login");
    } catch (error) {
      setFieldError("email", error.message);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="register-auth-wrapper">
        <div className="register-auth-container">
          {/* Header */}
          <div className="register-auth-header">
            <Link to="/" className="register-back-link">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
            <div className="register-logo-section">
              <div className="register-logo-icon">
                <span className="register-logo-text">IA</span>
              </div>
              <h1 className="register-brand-title">IA Lab</h1>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="register-main-content">
            <div className="register-form-container">
              <div className="register-form-header">
                <h2 className="register-main-title">Créer un compte</h2>
                <p className="register-subtitle">
                  Rejoignez la révolution de l'IA dans les laboratoires
                  dentaires
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form className="register-form">
                    {/* Prénom et Nom */}
                    <div className="register-form-row">
                      <div className="register-form-group">
                        <label
                          htmlFor="firstName"
                          className="register-form-label"
                        >
                          Prénom *
                        </label>
                        <div className="register-input-wrapper">
                          <User className="register-input-icon" size={20} />
                          <Field
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Votre prénom"
                            className={`register-form-input ${
                              touched.firstName && errors.firstName
                                ? "register-input-error"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="register-error-message"
                        />
                      </div>

                      <div className="register-form-group">
                        <label
                          htmlFor="lastName"
                          className="register-form-label"
                        >
                          Nom *
                        </label>
                        <div className="register-input-wrapper">
                          <User className="register-input-icon" size={20} />
                          <Field
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Votre nom"
                            className={`register-form-input ${
                              touched.lastName && errors.lastName
                                ? "register-input-error"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="register-error-message"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="register-form-group">
                      <label htmlFor="email" className="register-form-label">
                        Email professionnel *
                      </label>
                      <div className="register-input-wrapper">
                        <Mail className="register-input-icon" size={20} />
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          placeholder="votre.email@exemple.com"
                          className={`register-form-input ${
                            touched.email && errors.email
                              ? "register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="register-error-message"
                      />
                    </div>

                    {/* Téléphone */}
                    <div className="register-form-group">
                      <label htmlFor="phone" className="register-form-label">
                        Téléphone *
                      </label>
                      <div className="register-input-wrapper">
                        <Phone className="register-input-icon" size={20} />
                        <Field
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="+32 0 23 45 67 89"
                          className={`register-form-input ${
                            touched.phone && errors.phone
                              ? "register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="register-error-message"
                      />
                    </div>

                    {/* Pays et Type de société */}
                    <div className="register-form-row">
                      <div className="register-form-group">
                        <label
                          htmlFor="country"
                          className="register-form-label"
                        >
                          Pays *
                        </label>
                        <div className="register-input-wrapper">
                          <Globe className="register-input-icon" size={20} />
                          <Field
                            as="select"
                            id="country"
                            name="country"
                            className={`register-form-select ${
                              touched.country && errors.country
                                ? "register-input-error"
                                : ""
                            }`}
                          >
                            <option value="">Sélectionner un pays</option>
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
                          className="register-error-message"
                        />
                      </div>

                      <div className="register-form-group">
                        <label
                          htmlFor="companyType"
                          className="register-form-label"
                        >
                          Type de société *
                        </label>
                        <div className="register-input-wrapper">
                          <Building className="register-input-icon" size={20} />
                          <Field
                            as="select"
                            id="companyType"
                            name="companyType"
                            className={`register-form-select ${
                              touched.companyType && errors.companyType
                                ? "register-input-error"
                                : ""
                            }`}
                          >
                            <option value="">Sélectionner le type</option>
                            {companyTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <ErrorMessage
                          name="companyType"
                          component="div"
                          className="register-error-message"
                        />
                      </div>
                    </div>

                    {/* Mot de passe et confirmation */}
                    <div className="register-form-group">
                      <label htmlFor="password" className="register-form-label">
                        Mot de passe *
                      </label>
                      <div className="register-input-wrapper">
                        <Lock className="register-input-icon" size={20} />
                        <Field
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          placeholder="Votre mot de passe"
                          className={`register-form-input ${
                            touched.password && errors.password
                              ? "register-input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="register-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="register-error-message"
                      />
                    </div>

                    <div className="register-form-group">
                      <label
                        htmlFor="confirmPassword"
                        className="register-form-label"
                      >
                        Confirmer le mot de passe *
                      </label>
                      <div className="register-input-wrapper">
                        <Lock className="register-input-icon" size={20} />
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirmer votre mot de passe"
                          className={`register-form-input ${
                            touched.confirmPassword && errors.confirmPassword
                              ? "register-input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="register-password-toggle"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="register-error-message"
                      />
                    </div>

                    {/* Conditions générales */}
                    <div className="register-form-group">
                      <label className="register-checkbox-wrapper register-terms-wrapper">
                        <Field
                          type="checkbox"
                          name="acceptTerms"
                          className="register-checkbox"
                        />
                        <span className="register-checkbox-label">
                          J'accepte les{" "}
                          <Link
                            to="/terms"
                            target="_blank"
                            className="register-terms-link"
                          >
                            conditions générales d'utilisation
                          </Link>{" "}
                          et la{" "}
                          <Link
                            to="/privacy"
                            target="_blank"
                            className="register-terms-link"
                          >
                            politique de confidentialité
                          </Link>{" "}
                          *
                        </span>
                      </label>
                      <ErrorMessage
                        name="acceptTerms"
                        component="div"
                        className="register-error-message"
                      />
                    </div>

                    {/* Newsletter */}
                    <div className="register-form-group">
                      <label className="register-checkbox-wrapper">
                        <Field
                          type="checkbox"
                          name="newsletter"
                          className="register-checkbox"
                        />
                        <span className="register-checkbox-label">
                          Je souhaite recevoir les actualités et offres
                          spéciales d'IA Lab
                        </span>
                      </label>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`register-submit-btn ${
                        isLoading ? "register-btn-loading" : ""
                      }`}
                    >
                      {isLoading ? (
                        <div className="register-loading-spinner">
                          <div className="register-spinner"></div>
                          Création du compte...
                        </div>
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Lien vers connexion */}
              <div className="register-login-section">
                <p className="register-login-text">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login" className="register-login-link">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            {/* Section informative */}
            <div className="register-info-section">
              <div className="register-info-card">
                <h3 className="register-info-title">Rejoignez l'excellence</h3>
                <div className="register-info-stats">
                  <div className="register-stat-item">
                    <span className="register-stat-number">50+</span>
                    <span className="register-stat-label">
                      Laboratoires partenaires
                    </span>
                  </div>
                  <div className="register-stat-item">
                    <span className="register-stat-number">1M+</span>
                    <span className="register-stat-label">
                      Commandes traitées
                    </span>
                  </div>
                  <div className="register-stat-item">
                    <span className="register-stat-number">98%</span>
                    <span className="register-stat-label">
                      Satisfaction client
                    </span>
                  </div>
                </div>

                <ul className="register-benefits-list">
                  <li className="register-benefit-item">
                    <CheckCircle className="register-benefit-icon" size={20} />
                    <span>Essai gratuit de 15 jours</span>
                  </li>
                  <li className="register-benefit-item">
                    <CheckCircle className="register-benefit-icon" size={20} />
                    <span>Support client 7j/7</span>
                  </li>
                  <li className="register-benefit-item">
                    <CheckCircle className="register-benefit-icon" size={20} />
                    <span>Formation incluse</span>
                  </li>
                  <li className="register-benefit-item">
                    <CheckCircle className="register-benefit-icon" size={20} />
                    <span>Aucun engagement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
