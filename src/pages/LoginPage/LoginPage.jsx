import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
} from "lucide-react";
import { Bot, Link2, BarChart2, Shield, Zap } from "lucide-react";

import { Link } from "react-router-dom";
import "./LoginPage.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/Config/AuthContext";

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
        endpoint = "/api/auth/login";
        requestBody = {
          email: values.email,
          password: values.password,
        };
      } else {
        endpoint = "/api/cabinet/auth/login";
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

      if (loginType === "laboratoire") {
        login("laboratoire", null, data.token);
        navigate("/dashboard/platform");
      } else {
        login("cabinet", data.cabinet);
        navigate("/compte/cabinet");
      }
    } catch (error) {
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
      <div className="login-auth-wrapper">
        <div className="login-auth-container">
          <div className="login-auth-header">
            <Link to="/" className="login-back-link">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
            <div className="login-logo-section">
              <div className="login-logo-icon">
                <span className="login-logo-text">S</span>
              </div>
              <h1 className="login-brand-title">
                <span className="lab">My</span>smilelab
              </h1>
            </div>
          </div>

          <div className="login-main-content">
            <div className="login-form-container">
              <div className="login-form-header">
                <h2 className="login-main-title">Connexion</h2>
                <p className="login-subtitle">
                  Accédez à votre plateforme Mysmilelab pour gérer vos{" "}
                  {loginType === "laboratoire"
                    ? "laboratoires dentaires"
                    : "dossiers patients"}
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
                  <Building2 size={20} />
                  Laboratoire Dentaire
                </button>
                <button
                  type="button"
                  className={`login-type-btn ${
                    loginType === "cabinet" ? "active" : ""
                  }`}
                  onClick={() => setLoginType("cabinet")}
                >
                  <Users size={20} />
                  Cabinet Dentaire
                </button>
              </div>

              {loginType === "cabinet" && (
                <div className="login-cabinet-notice">
                  <div className="login-notice-header">
                    <Info size={20} className="login-notice-icon" />
                    <span className="login-notice-title">
                      Information importante
                    </span>
                    <button
                      type="button"
                      className="login-notice-toggle"
                      onClick={() => setShowCabinetInfo(!showCabinetInfo)}
                    >
                      {showCabinetInfo ? "Masquer" : "En savoir plus"}
                    </button>
                  </div>

                  {showCabinetInfo && (
                    <div className="login-notice-content">
                      <div className="login-notice-item">
                        <AlertCircle size={16} className="text-blue-500" />
                        <span>
                          Les cabinets dentaires doivent être ajoutés par un
                          laboratoire partenaire
                        </span>
                      </div>
                      <div className="login-notice-item">
                        <Mail size={16} className="text-green-500" />
                        <span>
                          Vos identifiants vous seront envoyés par email par
                          votre laboratoire
                        </span>
                      </div>
                      <div className="login-notice-item">
                        <Shield size={16} className="text-orange-500" />
                        <span>
                          Seuls les laboratoires peuvent créer des comptes sur
                          cette plateforme
                        </span>
                      </div>
                      <div className="login-notice-contact">
                        <strong>Vous n'avez pas vos identifiants ?</strong>
                        <br />
                        Contactez votre laboratoire dentaire partenaire qui vous
                        donnera accès à la plateforme.
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
                      className={`login-submit-btn ${
                        isLoading ? "login-btn-loading" : ""
                      } ${loginType === "cabinet" ? "login-btn-cabinet" : ""}`}
                    >
                      {isLoading ? (
                        <div className="login-loading-spinner">
                          <div className="login-spinner"></div>
                          Connexion en cours...
                        </div>
                      ) : (
                        <>
                          Se connecter{" "}
                          {loginType === "cabinet"
                            ? "au cabinet"
                            : "au laboratoire"}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {loginType === "laboratoire" && (
                <div className="login-signup-section">
                  <p className="login-signup-text">
                    Vous n'avez pas encore de compte ?{" "}
                    <Link to="/register" className="login-signup-link">
                      Créer un compte laboratoire
                    </Link>
                  </p>
                </div>
              )}

              {loginType === "cabinet" && (
                <div className="login-signup-section">
                  <p className="login-signup-text">
                    <strong>
                      Seuls les laboratoires peuvent créer des comptes.
                    </strong>
                    <br />
                    Contactez votre laboratoire partenaire pour obtenir vos
                    accès.
                  </p>
                </div>
              )}
            </div>

            <div className="login-info-section">
              <div className="login-info-card">
                <h3 className="login-info-title">
                  {loginType === "laboratoire"
                    ? "Pourquoi choisir Mysmilelab ?"
                    : "Avantages pour votre cabinet"}
                </h3>
                <ul className="login-info-list">
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Bot size={20} className="text-blue-500" />
                    </span>
                    {loginType === "laboratoire"
                      ? "IA générative pour automatiser vos processus"
                      : "Suivi en temps réel de vos commandes"}
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Link2 size={20} className="text-green-500" />
                    </span>
                    {loginType === "laboratoire"
                      ? "Intégration avec Itero, 3Shape, MedditLink"
                      : "Communication directe avec votre laboratoire"}
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <BarChart2 size={20} className="text-purple-500" />
                    </span>
                    {loginType === "laboratoire"
                      ? "Analytics avancés et reporting en temps réel"
                      : "Historique détaillé de vos patients"}
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Shield size={20} className="text-red-500" />
                    </span>
                    Sécurité médicale et conformité HIPAA
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Zap size={20} className="text-yellow-500" />
                    </span>
                    {loginType === "laboratoire"
                      ? "Gain de temps significatif (-75% de temps perdu)"
                      : "Interface simplifiée et intuitive"}
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

export default LoginPage;
