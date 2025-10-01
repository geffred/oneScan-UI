import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { HashLink } from "react-router-hash-link";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/Config/AuthContext";
import "./CabinetRegisterPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CabinetRegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validationSchema = Yup.object({
    nom: Yup.string()
      .min(2, "Le nom du cabinet doit contenir au moins 2 caractères")
      .max(100, "Le nom du cabinet ne peut pas dépasser 100 caractères")
      .required("Le nom du cabinet est requis"),
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    motDePasse: Yup.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      )
      .required("Le mot de passe est requis"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("motDePasse"), null],
        "Les mots de passe ne correspondent pas"
      )
      .required("La confirmation du mot de passe est requise"),
    numeroDeTelephone: Yup.string()
      .matches(
        /^(\+?\d{1,3}[-\s]?)?\d{6,12}$/,
        "Format de numéro de téléphone invalide"
      )
      .required("Le numéro de téléphone est requis"),
    adresseDeLivraison: Yup.string().max(
      255,
      "L'adresse de livraison ne peut pas dépasser 255 caractères"
    ),
    adresseDeFacturation: Yup.string().max(
      255,
      "L'adresse de facturation ne peut pas dépasser 255 caractères"
    ),
    acceptTerms: Yup.boolean()
      .oneOf([true], "Vous devez accepter les conditions générales")
      .required("Vous devez accepter les conditions générales"),
  });

  const initialValues = {
    nom: "",
    email: "",
    motDePasse: "",
    confirmPassword: "",
    numeroDeTelephone: "",
    adresseDeLivraison: "",
    adresseDeFacturation: "",
    acceptTerms: false,
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cabinet/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: values.nom,
          email: values.email,
          motDePasse: values.motDePasse,
          numeroDeTelephone: values.numeroDeTelephone,
          adresseDeLivraison: values.adresseDeLivraison,
          adresseDeFacturation: values.adresseDeFacturation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const data = await response.json();

      // Connecter automatiquement le cabinet après l'inscription
      login("cabinet", data.cabinet);

      navigate("/compte/cabinet");
    } catch (error) {
      if (error.message.includes("email")) {
        setFieldError("email", "Cette adresse email est déjà utilisée");
      } else {
        setFieldError("nom", error.message);
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="cabinet-register-auth-wrapper" id="header-register">
        <div className="cabinet-register-auth-container">
          {/* Header */}
          <div className="cabinet-register-auth-header">
            <Link to="/" className="cabinet-register-back-link">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
            <div className="cabinet-register-logo-section">
              <div className="cabinet-register-logo-icon">
                <User size={24} />
              </div>
              <h1 className="cabinet-register-brand-title">Cabinet Dentaire</h1>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="cabinet-register-main-content">
            <div className="cabinet-register-form-container">
              <div className="cabinet-register-form-header">
                <h2 className="cabinet-register-main-title">
                  Créer un compte cabinet
                </h2>
                <p className="cabinet-register-subtitle">
                  Rejoignez notre réseau de cabinets dentaires partenaires
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form className="cabinet-register-form">
                    {/* Nom du cabinet */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="nom"
                        className="cabinet-register-form-label"
                      >
                        Nom du cabinet *
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <User
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type="text"
                          id="nom"
                          name="nom"
                          placeholder="Cabinet Dentaire Dr. Martin"
                          className={`cabinet-register-form-input ${
                            touched.nom && errors.nom
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="nom"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Email */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="email"
                        className="cabinet-register-form-label"
                      >
                        Email professionnel *
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <Mail
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          placeholder="contact@cabinet-martin.fr"
                          className={`cabinet-register-form-input ${
                            touched.email && errors.email
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Téléphone */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="numeroDeTelephone"
                        className="cabinet-register-form-label"
                      >
                        Numéro de téléphone *
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <Phone
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type="tel"
                          id="numeroDeTelephone"
                          name="numeroDeTelephone"
                          placeholder="+32 2 123 45 67"
                          className={`cabinet-register-form-input ${
                            touched.numeroDeTelephone &&
                            errors.numeroDeTelephone
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="numeroDeTelephone"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Adresse de livraison */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="adresseDeLivraison"
                        className="cabinet-register-form-label"
                      >
                        Adresse de livraison
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <MapPin
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type="text"
                          id="adresseDeLivraison"
                          name="adresseDeLivraison"
                          placeholder="123 Rue de la Santé, 1000 Bruxelles"
                          className={`cabinet-register-form-input ${
                            touched.adresseDeLivraison &&
                            errors.adresseDeLivraison
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="adresseDeLivraison"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Adresse de facturation */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="adresseDeFacturation"
                        className="cabinet-register-form-label"
                      >
                        Adresse de facturation
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <FileText
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type="text"
                          id="adresseDeFacturation"
                          name="adresseDeFacturation"
                          placeholder="123 Rue de la Facturation, 1000 Bruxelles"
                          className={`cabinet-register-form-input ${
                            touched.adresseDeFacturation &&
                            errors.adresseDeFacturation
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="adresseDeFacturation"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Mot de passe */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="motDePasse"
                        className="cabinet-register-form-label"
                      >
                        Mot de passe *
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <Lock
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type={showPassword ? "text" : "password"}
                          id="motDePasse"
                          name="motDePasse"
                          placeholder="Votre mot de passe"
                          className={`cabinet-register-form-input ${
                            touched.motDePasse && errors.motDePasse
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="cabinet-register-password-toggle"
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
                        name="motDePasse"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className="cabinet-register-form-group">
                      <label
                        htmlFor="confirmPassword"
                        className="cabinet-register-form-label"
                      >
                        Confirmer le mot de passe *
                      </label>
                      <div className="cabinet-register-input-wrapper">
                        <Lock
                          className="cabinet-register-input-icon"
                          size={20}
                        />
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirmer votre mot de passe"
                          className={`cabinet-register-form-input ${
                            touched.confirmPassword && errors.confirmPassword
                              ? "cabinet-register-input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="cabinet-register-password-toggle"
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
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Conditions générales */}
                    <div className="cabinet-register-form-group">
                      <label className="cabinet-register-checkbox-wrapper cabinet-register-terms-wrapper">
                        <Field
                          type="checkbox"
                          name="acceptTerms"
                          className="cabinet-register-checkbox"
                        />
                        <span className="cabinet-register-checkbox-label">
                          J'accepte les{" "}
                          <Link
                            to="/terms"
                            target="_blank"
                            className="cabinet-register-terms-link"
                          >
                            conditions générales d'utilisation
                          </Link>{" "}
                          et la{" "}
                          <Link
                            to="/terms"
                            target="_blank"
                            className="cabinet-register-terms-link"
                          >
                            politique de confidentialité
                          </Link>{" "}
                          *
                        </span>
                      </label>
                      <ErrorMessage
                        name="acceptTerms"
                        component="div"
                        className="cabinet-register-error-message"
                      />
                    </div>

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`cabinet-register-submit-btn ${
                        isLoading ? "cabinet-register-btn-loading" : ""
                      }`}
                    >
                      {isLoading ? (
                        <div className="cabinet-register-loading-spinner">
                          <div className="cabinet-register-spinner"></div>
                          Création du compte...
                        </div>
                      ) : (
                        <>
                          Créer mon compte cabinet
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Lien vers connexion */}
              <div className="cabinet-register-login-section">
                <p className="cabinet-register-login-text">
                  Vous avez déjà un compte cabinet ?{" "}
                  <HashLink
                    to="/login#header-login"
                    className="cabinet-register-login-link"
                  >
                    Se connecter
                  </HashLink>
                </p>
              </div>
            </div>

            {/* Section image de couverture */}
            <div className="cabinet-register-cover-section">
              <div
                className="cabinet-register-cover-image"
                style={{
                  backgroundImage:
                    'url("https://smilelabortho.be/wp-content/uploads/2024/05/Capture.png")',
                }}
              >
                <div className="cabinet-register-cover-overlay">
                  <h3 className="cabinet-register-cover-title">
                    L’innovation au cœur du sourire
                  </h3>
                  <p className="cabinet-register-cover-subtitle">
                    Des solutions orthodontiques précises et fiables pour vos
                    patients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CabinetRegisterPage;
