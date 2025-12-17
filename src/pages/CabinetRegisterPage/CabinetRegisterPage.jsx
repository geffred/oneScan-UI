import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { HashLink } from "react-router-hash-link";
import { Link, useNavigate } from "react-router-dom";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import "./CabinetRegisterPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Schéma de validation ---
const validationSchema = Yup.object({
  nom: Yup.string()
    .min(2, "Trop court (min 2)")
    .max(100, "Trop long (max 100)")
    .required("Nom du cabinet requis"),
  email: Yup.string().email("Email invalide").required("Email requis"),
  motDePasse: Yup.string()
    .min(8, "Min 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "1 Majuscule, 1 minuscule, 1 chiffre requis"
    )
    .required("Mot de passe requis"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("motDePasse"), null], "Les mots de passe diffèrent")
    .required("Confirmation requise"),
  numeroDeTelephone: Yup.string()
    .matches(/^(\+?\d{1,3}[-\s]?)?\d{6,12}$/, "Numéro invalide")
    .required("Téléphone requis"),
  adresseDeLivraison: Yup.string().max(255, "Trop long"),
  adresseDeFacturation: Yup.string().max(255, "Trop long"),
  acceptTerms: Yup.boolean()
    .oneOf([true], "Veuillez accepter les conditions")
    .required("Requis"),
});

// --- Sous-composant pour les champs (DRY) ---
const RegisterField = ({
  name,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  touched,
  errors,
  togglePassword,
  showPassword,
}) => {
  const isPassword = name === "motDePasse" || name === "confirmPassword";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="crp-form-group">
      <label htmlFor={name} className="crp-label">
        {label}
      </label>
      <div
        className={`crp-input-wrapper ${
          touched[name] && errors[name] ? "crp-error-border" : ""
        }`}
      >
        {Icon && <Icon className="crp-input-icon" size={20} />}
        <Field
          type={inputType}
          id={name}
          name={name}
          placeholder={placeholder}
          className="crp-input"
        />
        {isPassword && (
          <button
            type="button"
            className="crp-password-toggle"
            onClick={togglePassword}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      <ErrorMessage name={name} component="div" className="crp-error-msg" />
    </div>
  );
};

const CabinetRegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const navigate = useNavigate();

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
    setGeneralError(null);

    // Nettoyage basique des données avant envoi (trim)
    const payload = {
      nom: values.nom.trim(),
      email: values.email.trim(),
      motDePasse: values.motDePasse,
      numeroDeTelephone: values.numeroDeTelephone.trim(),
      adresseDeLivraison: values.adresseDeLivraison?.trim(),
      adresseDeFacturation:
        values.adresseDeFacturation?.trim() ||
        values.adresseDeLivraison?.trim(), // Fallback intelligent
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cabinet/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({})); // Gestion cas où le body est vide ou non-JSON

      if (!response.ok) {
        // Gestion spécifique des erreurs 409 et 500
        if (response.status === 409) {
          throw new Error("Cet email est déjà utilisé par un autre cabinet.");
        }
        if (response.status === 500) {
          throw new Error(
            "Erreur serveur interne. Veuillez contacter le support."
          );
        }
        throw new Error(data.message || "Une erreur inconnue est survenue.");
      }

      console.log("Inscription réussie:", data);

      navigate("/cabinet/verify-email", {
        state: {
          email: values.email,
          cabinetData: payload,
        },
      });
    } catch (error) {
      console.error("Erreur Inscription:", error);

      if (error.message.toLowerCase().includes("email")) {
        setFieldError("email", error.message);
      } else {
        setGeneralError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="crp-page" id="header-register">
        <div className="crp-container">
          {/* Header Carte */}
          <div className="crp-card-header">
            <Link to="/" className="crp-back-link">
              <ArrowLeft size={18} /> Retour
            </Link>
            <div className="crp-logo-block">
              <div className="crp-logo-circle">
                <User size={24} />
              </div>
              <h1>Espace Cabinet</h1>
            </div>
          </div>

          <div className="crp-content">
            <div className="crp-intro">
              <h2>Créer un compte</h2>
              <p>Rejoignez notre réseau de partenaires dentaires.</p>
            </div>

            {generalError && (
              <div className="crp-alert-error">
                <AlertTriangle size={20} />
                <span>{generalError}</span>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="crp-form">
                  <RegisterField
                    name="nom"
                    label="Nom du cabinet *"
                    icon={User}
                    placeholder="Cabinet Dr. Martin"
                    touched={touched}
                    errors={errors}
                  />

                  <RegisterField
                    name="email"
                    label="Email professionnel *"
                    icon={Mail}
                    type="email"
                    placeholder="contact@cabinet.com"
                    touched={touched}
                    errors={errors}
                  />

                  <div className="crp-row">
                    <RegisterField
                      name="numeroDeTelephone"
                      label="Téléphone *"
                      icon={Phone}
                      type="tel"
                      placeholder="+32..."
                      touched={touched}
                      errors={errors}
                    />
                    <RegisterField
                      name="adresseDeLivraison"
                      label="Adresse livraison"
                      icon={MapPin}
                      placeholder="Rue..."
                      touched={touched}
                      errors={errors}
                    />
                  </div>

                  <RegisterField
                    name="adresseDeFacturation"
                    label="Adresse facturation (optionnel)"
                    icon={FileText}
                    placeholder="Laisser vide si identique"
                    touched={touched}
                    errors={errors}
                  />

                  <div className="crp-row">
                    <RegisterField
                      name="motDePasse"
                      label="Mot de passe *"
                      icon={Lock}
                      placeholder="••••••••"
                      touched={touched}
                      errors={errors}
                      showPassword={showPassword}
                      togglePassword={() => setShowPassword(!showPassword)}
                    />
                    <RegisterField
                      name="confirmPassword"
                      label="Confirmation *"
                      icon={Lock}
                      placeholder="••••••••"
                      touched={touched}
                      errors={errors}
                      showPassword={showConfirmPassword}
                      togglePassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </div>

                  {/* Checkbox Terms */}
                  <div className="crp-terms-group">
                    <label className="crp-checkbox-label">
                      <Field
                        type="checkbox"
                        name="acceptTerms"
                        className="crp-checkbox"
                      />
                      <span>
                        J'accepte les{" "}
                        <Link to="/terms" target="_blank">
                          conditions générales
                        </Link>
                        .
                      </span>
                    </label>
                    <ErrorMessage
                      name="acceptTerms"
                      component="div"
                      className="crp-error-msg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="crp-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="crp-spin" size={20} /> Traitement...
                      </>
                    ) : (
                      <>
                        Créer mon compte <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="crp-footer-link">
              Déjà un compte ?{" "}
              <HashLink to="/login#header-login">Se connecter</HashLink>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CabinetRegisterPage;
