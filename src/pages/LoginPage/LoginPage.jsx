import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { HashLink } from "react-router-hash-link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Users,
  Building2,
  Info,
  AlertCircle,
  Shield,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useAuth } from "../../components/Config/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState("cabinet");
  const [showCabinetInfo, setShowCabinetInfo] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    try {
      let endpoint = "";
      let requestBody = {};

      if (loginType === "laboratoire") {
        endpoint = `${API_BASE_URL}/auth/login`;
        requestBody = {
          email: values.email,
          password: values.password,
        };
      } else {
        endpoint = `${API_BASE_URL}/cabinet/auth/login`;
        requestBody = {
          email: values.email,
          motDePasse: values.password,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Email ou mot de passe incorrect");
      }

      const data = await response.json();
      console.log("Connexion réussie, données:", data);

      // Vérifier la présence du token
      if (!data.token) {
        throw new Error("Token manquant dans la réponse du serveur");
      }

      let loginSuccess = false;
      if (loginType === "laboratoire") {
        loginSuccess = login("laboratoire", null, data.token);
        if (loginSuccess) {
          setTimeout(() => {
            navigate("/dashboard/platform");
          }, 100);
        }
      } else {
        // Pour les cabinets, passer aussi les données cabinet
        loginSuccess = login("cabinet", data.cabinet, data.token);
        if (loginSuccess) {
          setTimeout(() => {
            navigate("/compte/cabinet");
          }, 100);
        }
      }

      if (!loginSuccess) {
        throw new Error("Erreur lors de l'initialisation de la session");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setFieldError("email", error.message);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .required("Le mot de passe est requis"),
  });

  const initialValues = {
    email: "",
    password: "",
  };

  return (
    <>
      <Header />
      <div className="login-auth-wrapper" id="header-login">
        <div className="login-auth-container">
          <div className="login-auth-header">
            <Link to="/" className="login-back-link">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
          </div>

          <div className="login-logo-section">
            <div className="login-logo-icon">
              <span className="login-logo-text">S</span>
            </div>
            <h1 className="login-brand-title">
              <span className="lab">My</span>smilelab
            </h1>
          </div>

          <div className="login-main-content">
            <div className="login-form-container">
              <div className="login-form-header">
                <h2 className="login-main-title">Connexion</h2>
                <p className="login-subtitle">
                  Accédez à votre espace sécurisé
                </p>
              </div>

              <div className="login-type-selector">
                <button
                  type="button"
                  className={`login-type-btn ${
                    loginType === "laboratoire" ? "active" : ""
                  }`}
                  onClick={() => setLoginType("laboratoire")}
                >
                  <Building2 size={18} />
                  Laboratoire
                </button>
                <button
                  type="button"
                  className={`login-type-btn ${
                    loginType === "cabinet" ? "active" : ""
                  }`}
                  onClick={() => setLoginType("cabinet")}
                >
                  <Users size={18} />
                  Cabinet
                </button>
              </div>

              {loginType === "cabinet" && (
                <div className="login-cabinet-notice">
                  <div className="login-notice-header">
                    <div className="login-notice-title-wrapper">
                      <Info size={18} className="login-notice-icon" />
                      <span className="login-notice-title">
                        Information d'accès
                      </span>
                    </div>
                    <button
                      type="button"
                      className="login-notice-toggle"
                      onClick={() => setShowCabinetInfo(!showCabinetInfo)}
                    >
                      {showCabinetInfo ? "Masquer" : "Lire"}
                    </button>
                  </div>

                  {showCabinetInfo && (
                    <div className="login-notice-content">
                      <div className="login-notice-item">
                        <AlertCircle size={16} className="icon-blue" />
                        <span>
                          Les cabinets sont ajoutés par un laboratoire
                          partenaire.
                        </span>
                      </div>
                      <div className="login-notice-item">
                        <Shield size={16} className="icon-orange" />
                        <span>
                          Vos identifiants vous sont transmis par email.
                        </span>
                      </div>
                      <div className="login-notice-contact">
                        <strong>Identifiants perdus ?</strong> Contactez votre
                        laboratoire.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form className="login-form">
                    <div className="login-form-group">
                      <label htmlFor="email" className="login-form-label">
                        {loginType === "laboratoire"
                          ? "Email professionnel"
                          : "Email du cabinet"}
                      </label>
                      <div className="login-input-wrapper">
                        <Mail className="login-input-icon" size={20} />
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          placeholder={
                            loginType === "laboratoire"
                              ? "votre.email@labo.com"
                              : "cabinet@exemple.com"
                          }
                          className={`login-form-input ${
                            touched.email && errors.email
                              ? "login-input-error"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="login-error-message"
                      />
                    </div>

                    <div className="login-form-group">
                      <label htmlFor="password" className="login-form-label">
                        Mot de passe
                      </label>
                      <div className="login-input-wrapper">
                        <Lock className="login-input-icon" size={20} />
                        <Field
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          placeholder="Votre mot de passe"
                          className={`login-form-input ${
                            touched.password && errors.password
                              ? "login-input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="login-password-toggle"
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
                        className="login-error-message"
                      />
                    </div>

                    <div className="login-form-options">
                      <label className="login-checkbox-wrapper">
                        <Field
                          type="checkbox"
                          name="rememberMe"
                          className="login-checkbox"
                        />
                        <span className="login-checkbox-label">
                          Se souvenir de moi
                        </span>
                      </label>
                      <Link to="/forgot-password" className="login-forgot-link">
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="login-submit-btn"
                    >
                      {isLoading ? (
                        <div className="login-loading-spinner">
                          <div className="login-spinner"></div>
                          Connexion...
                        </div>
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {loginType === "cabinet" && (
                <div className="login-signup-section">
                  <p className="login-signup-text">
                    Vous n'avez pas encore de compte ?
                    <HashLink
                      to="/cabinet/register#header-register"
                      className="login-signup-link"
                    >
                      Créer un compte
                    </HashLink>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
