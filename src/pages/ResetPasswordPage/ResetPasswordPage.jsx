/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
// src/pages/ResetPasswordPage/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ResetPasswordPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [cabinetInfo, setCabinetInfo] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/cabinet/auth/verify-reset-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTokenValid(data.valid);
        setCabinetInfo(data.cabinet);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      )
      .required("Le mot de passe est requis"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("newPassword"), null],
        "Les mots de passe ne correspondent pas"
      )
      .required("La confirmation est requise"),
  });

  const handleSubmit = async (values, { setFieldError }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cabinet/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: values.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la réinitialisation"
        );
      }

      setResetSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setFieldError("newPassword", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <>
        <Header />
        <div className="reset-password-wrapper">
          <div className="reset-password-container">
            <div className="reset-password-loading-state">
              <div className="reset-password-spinner-large"></div>
              <p>Vérification du lien...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <Header />
        <div className="reset-password-wrapper">
          <div className="reset-password-container">
            <div className="reset-password-error-state">
              <AlertCircle size={64} className="reset-password-error-icon" />
              <h2>Lien invalide ou expiré</h2>
              <p>
                Ce lien de réinitialisation a expiré ou n'est plus valide.
                Veuillez demander un nouveau lien.
              </p>
              <Link to="/forgot-password" className="reset-password-action-btn">
                Demander un nouveau lien
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (resetSuccess) {
    return (
      <>
        <Header />
        <div className="reset-password-wrapper">
          <div className="reset-password-container">
            <div className="reset-password-success-state">
              <CheckCircle size={64} className="reset-password-success-icon" />
              <h2>Mot de passe réinitialisé !</h2>
              <p>
                Votre mot de passe a été modifié avec succès. Vous allez être
                redirigé vers la page de connexion...
              </p>
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
      <div className="reset-password-wrapper">
        <div className="reset-password-container">
          <div className="reset-password-content">
            <div className="reset-password-icon-wrapper">
              <Lock size={32} />
            </div>
            <h1>Nouveau mot de passe</h1>
            {cabinetInfo && (
              <p className="reset-password-cabinet-info">
                Cabinet : <strong>{cabinetInfo.nom}</strong>
              </p>
            )}
            <p className="reset-password-subtitle">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>

            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="reset-password-form">
                  <div className="reset-password-form-group">
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                    <div className="reset-password-input-wrapper">
                      <Lock className="reset-password-input-icon" size={20} />
                      <Field
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        placeholder="Au moins 8 caractères"
                        className={`reset-password-form-input ${
                          touched.newPassword && errors.newPassword
                            ? "input-error"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="reset-password-toggle"
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
                      name="newPassword"
                      component="div"
                      className="reset-password-error-message"
                    />
                  </div>

                  <div className="reset-password-form-group">
                    <label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </label>
                    <div className="reset-password-input-wrapper">
                      <Lock className="reset-password-input-icon" size={20} />
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirmer votre mot de passe"
                        className={`reset-password-form-input ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "input-error"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="reset-password-toggle"
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
                      className="reset-password-error-message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="reset-password-submit-btn"
                  >
                    {isLoading ? (
                      <div className="reset-password-loading-spinner">
                        <div className="reset-password-spinner"></div>
                        Réinitialisation...
                      </div>
                    ) : (
                      "Réinitialiser le mot de passe"
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

export default ResetPasswordPage;
