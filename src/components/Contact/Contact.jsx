import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import emailjs from "@emailjs/browser";
import {
  Mail,
  User,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Building,
} from "lucide-react";
import "./Contact.css";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .required("Le prénom est requis"),
    lastName: Yup.string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .required("Le nom est requis"),
    email: Yup.string()
      .email("Format d'email invalide")
      .required("L'email est requis"),
    company: Yup.string().min(
      2,
      "Le nom de l'entreprise doit contenir au moins 2 caractères"
    ),
    phone: Yup.string().matches(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Numéro de téléphone invalide"
    ),
    subject: Yup.string().required("Le sujet est requis"),
    message: Yup.string()
      .min(10, "Le message doit contenir au moins 10 caractères")
      .required("Le message est requis"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Configuration EmailJS - remplacez par vos propres IDs
      const templateParams = {
        from_name: `${values.firstName} ${values.lastName}`,
        from_email: values.email,
        company: values.company || "Non spécifiée",
        phone: values.phone || "Non spécifié",
        subject: values.subject,
        message: values.message,
        to_email: "contact@mysmilelab.com", // Remplacez par votre email
      };

      await emailjs.send(
        "YOUR_SERVICE_ID", // Remplacez par votre Service ID
        "YOUR_TEMPLATE_ID", // Remplacez par votre Template ID
        templateParams,
        "YOUR_PUBLIC_KEY" // Remplacez par votre Public Key
      );

      setSubmitStatus("success");
      resetForm();
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-section">
      <div className="container">
        <div className="contact-content">
          {/* Header */}
          <div className="contact-header">
            <h1 className="contact-title">Contactez-nous</h1>
            <p className="contact-description">
              Vous avez des questions ? Notre équipe d'experts est là pour vous
              accompagner dans votre projet de digitalisation dentaire.
            </p>
          </div>

          <div className="contact-layout">
            {/* Informations de contact */}
            <div className="contact-info">
              <div className="contact-info-card">
                <h3>Parlons de votre projet</h3>
                <p>
                  Que vous soyez un laboratoire dentaire, un praticien ou
                  simplement curieux de découvrir nos solutions, nous sommes à
                  votre écoute.
                </p>

                <div className="contact-details">
                  <div className="contact-detail-item">
                    <Mail className="contact-detail-icon" />
                    <div>
                      <strong>Email</strong>
                      <p>contact@mysmilelab.com</p>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <Phone className="contact-detail-icon" />
                    <div>
                      <strong>Téléphone</strong>
                      <p>+32 0 493 35 73 28</p>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <MapPin className="contact-detail-icon" />
                    <div>
                      <strong>Adresse</strong>
                      <p>
                        Boulevard Roosevelt 23
                        <br />
                        7060 Soignies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="contact-form-container">
              {submitStatus === "success" && (
                <div className="contact-success-message">
                  <CheckCircle size={24} />
                  <div>
                    <strong>Message envoyé avec succès !</strong>
                    <p>Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="contact-error-message">
                  <strong>Erreur lors de l'envoi</strong>
                  <p>
                    Veuillez réessayer ou nous contacter directement par email.
                  </p>
                </div>
              )}

              <Formik
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  company: "",
                  phone: "",
                  subject: "",
                  message: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form className="contact-form">
                    <div className="contact-form-grid">
                      <div className="contact-input-group">
                        <label htmlFor="firstName" className="contact-label">
                          Prénom *
                        </label>
                        <div className="contact-input-wrapper">
                          <User className="contact-input-icon" />
                          <Field
                            name="firstName"
                            type="text"
                            className="contact-input"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="contact-error"
                        />
                      </div>

                      <div className="contact-input-group">
                        <label htmlFor="lastName" className="contact-label">
                          Nom *
                        </label>
                        <div className="contact-input-wrapper">
                          <User className="contact-input-icon" />
                          <Field
                            name="lastName"
                            type="text"
                            className="contact-input"
                            placeholder="Votre nom"
                          />
                        </div>
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="contact-error"
                        />
                      </div>

                      <div className="contact-input-group">
                        <label htmlFor="email" className="contact-label">
                          Email *
                        </label>
                        <div className="contact-input-wrapper">
                          <Mail className="contact-input-icon" />
                          <Field
                            name="email"
                            type="email"
                            className="contact-input"
                            placeholder="votre@email.com"
                          />
                        </div>
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="contact-error"
                        />
                      </div>

                      <div className="contact-input-group">
                        <label htmlFor="company" className="contact-label">
                          Entreprise
                        </label>
                        <div className="contact-input-wrapper">
                          <Building className="contact-input-icon" />
                          <Field
                            name="company"
                            type="text"
                            className="contact-input"
                            placeholder="Nom de votre entreprise"
                          />
                        </div>
                        <ErrorMessage
                          name="company"
                          component="div"
                          className="contact-error"
                        />
                      </div>

                      <div className="contact-input-group">
                        <label htmlFor="phone" className="contact-label">
                          Téléphone
                        </label>
                        <div className="contact-input-wrapper">
                          <Phone className="contact-input-icon" />
                          <Field
                            name="phone"
                            type="tel"
                            className="contact-input"
                            placeholder="01 23 45 67 89"
                          />
                        </div>
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="contact-error"
                        />
                      </div>

                      <div className="contact-input-group">
                        <label htmlFor="subject" className="contact-label">
                          Sujet *
                        </label>
                        <div className="contact-input-wrapper">
                          <MessageSquare className="contact-input-icon" />
                          <Field
                            as="select"
                            name="subject"
                            className="contact-select"
                          >
                            <option value="">Sélectionnez un sujet</option>
                            <option value="demo">Ajout de mon cabinet</option>
                            <option value="support">
                              Demande d'information{" "}
                            </option>
                            <option value="partnership">Partenariat</option>
                            <option value="other">Autre</option>
                          </Field>
                        </div>
                        <ErrorMessage
                          name="subject"
                          component="div"
                          className="contact-error"
                        />
                      </div>
                    </div>

                    <div className="contact-input-group contact-message-group">
                      <label htmlFor="message" className="contact-label">
                        Message *
                      </label>
                      <Field
                        as="textarea"
                        name="message"
                        className="contact-textarea"
                        placeholder="Décrivez votre projet ou vos besoins..."
                        rows="6"
                      />
                      <ErrorMessage
                        name="message"
                        component="div"
                        className="contact-error"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isValid || !dirty}
                      className="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <div className="contact-loading">
                          <div className="contact-spinner"></div>
                          Envoi en cours...
                        </div>
                      ) : (
                        <>
                          <Send size={20} />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
