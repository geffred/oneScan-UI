/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
// src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ForgotPasswordPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
  });

  const handleSubmit = async (values, { setFieldError }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cabinet/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setEmailSent(true);
    } catch (error) {
      setFieldError("email", "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Header />
        <div className="forgot-password-wrapper">
          <div className="forgot-password-container">
            <div className="forgot-password-success-message">
              <CheckCircle size={64} className="forgot-password-success-icon" />
              <h2>Email envoyé !</h2>
              <p>
                Si un compte existe avec cette adresse email, vous recevrez un
                lien de réinitialisation dans quelques instants.
              </p>
              <Link to="/login" className="forgot-password-back-to-login">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="forgot-password-wrapper">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            <Link to="/login" className="forgot-password-back-link">
              <ArrowLeft size={20} />
              Retour à la connexion
            </Link>
          </div>

          <div className="forgot-password-content">
            <div className="forgot-password-icon-wrapper">
              <Mail size={32} />
            </div>
            <h1>Mot de passe oublié ?</h1>
            <p className="forgot-password-subtitle">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>

            <Formik
              initialValues={{ email: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="forgot-password-form">
                  <div className="forgot-password-form-group">
                    <label htmlFor="email">Email du cabinet</label>
                    <div className="forgot-password-input-wrapper">
                      <Mail className="forgot-password-input-icon" size={20} />
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="cabinet@exemple.com"
                        className={`forgot-password-form-input ${
                          touched.email && errors.email ? "input-error" : ""
                        }`}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="forgot-password-error-message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="forgot-password-submit-btn"
                  >
                    {isLoading ? (
                      <div className="forgot-password-loading-spinner">
                        <div className="forgot-password-spinner"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
