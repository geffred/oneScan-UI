import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Bot, Link2, BarChart2, Shield, Zap } from "lucide-react";

import { Link } from "react-router-dom";
import "./LoginPage.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/Config/AuthContext";
import { useContext } from "react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Stockez les infos utilisateur
      setIsAuthenticated(true);
      setUserName(data.user.name); // Mettez à jour le nom dans le contexte
      navigate("/dashboard");
    } catch (error) {
      setFieldError("email", error.message);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Schéma de validation Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .required("Le mot de passe est requis"),
  });

  // Valeurs initiales
  const initialValues = {
    email: "",
    password: "",
  };

  return (
    <>
      <Header />
      <div className="login-auth-wrapper">
        <div className="login-auth-container">
          {/* Header avec logo */}
          <div className="login-auth-header">
            <Link to="/" className="login-back-link">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
            <div className="login-logo-section">
              <div className="login-logo-icon">
                <span className="login-logo-text">IA</span>
              </div>
              <h1 className="login-brand-title">IA Lab</h1>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="login-main-content">
            <div className="login-form-container">
              <div className="login-form-header">
                <h2 className="login-main-title">Connexion</h2>
                <p className="login-subtitle">
                  Accédez à votre plateforme IA Lab pour gérer vos laboratoires
                  dentaires
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form className="login-form">
                    {/* Champ Email */}
                    <div className="login-form-group">
                      <label htmlFor="email" className="login-form-label">
                        Email professionnel
                      </label>
                      <div className="login-input-wrapper">
                        <Mail className="login-input-icon" size={20} />
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          placeholder="votre.email@exemple.com"
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

                    {/* Champ Mot de passe */}
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

                    {/* Options */}
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

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`login-submit-btn ${
                        isLoading ? "login-btn-loading" : ""
                      }`}
                    >
                      {isLoading ? (
                        <div className="login-loading-spinner">
                          <div className="login-spinner"></div>
                          Connexion en cours...
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

              {/* Lien vers inscription */}
              <div className="login-signup-section">
                <p className="login-signup-text">
                  Vous n'avez pas encore de compte ?{" "}
                  <Link to="/register" className="login-signup-link">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>

            {/* Section informative */}
            <div className="login-info-section">
              <div className="login-info-card">
                <h3 className="login-info-title">Pourquoi choisir IA Lab ?</h3>
                <ul className="login-info-list">
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Bot size={20} className="text-blue-500" />
                    </span>
                    IA générative pour automatiser vos processus
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <Link2 size={20} className="text-green-500" />
                    </span>
                    Intégration avec Itero, 3Shape, MedditLink
                  </li>
                  <li className="login-info-item">
                    <span className="login-info-icon">
                      <BarChart2 size={20} className="text-purple-500" />
                    </span>
                    Analytics avancés et reporting en temps réel
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
                    Gain de temps significatif (-75% de temps perdu)
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
