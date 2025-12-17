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
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";
import "./Contact.css";

// Configuration EmailJS (Idéalement à mettre dans un fichier .env)
const EMAIL_CONFIG = {
  SERVICE_ID: "service_ag5llz9",
  TEMPLATE_ID: "template_3qv5owv",
  PUBLIC_KEY: "rfexuIcDBNIIdOsf2",
};

// Schéma de validation
const validationSchema = Yup.object({
  firstName: Yup.string().min(2, "Trop court").required("Requis"),
  lastName: Yup.string().min(2, "Trop court").required("Requis"),
  email: Yup.string().email("Email invalide").required("Requis"),
  phone: Yup.string().matches(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Numéro invalide"
  ),
  company: Yup.string().min(2, "Trop court"),
  subject: Yup.string().required("Sujet requis"),
  message: Yup.string()
    .min(10, "Minimum 10 caractères")
    .required("Message requis"),
});

// Composant interne pour les champs (DRY)
const ContactField = ({
  name,
  label,
  icon: Icon,
  as,
  children,
  type = "text",
  placeholder,
}) => (
  <div className="cnt-field-group">
    <label htmlFor={name} className="cnt-label">
      {label}
    </label>
    <div className="cnt-input-wrapper">
      {Icon && <Icon className="cnt-field-icon" size={18} />}
      <Field
        as={as}
        name={name}
        type={type}
        className={`cnt-input ${as === "textarea" ? "cnt-textarea" : ""}`}
        placeholder={placeholder}
      >
        {children}
      </Field>
    </div>
    <ErrorMessage name={name} component="div" className="cnt-error" />
  </div>
);

const Contact = () => {
  const [status, setStatus] = useState(null); // 'idle', 'submitting', 'success', 'error'

  const handleSubmit = async (values, { resetForm }) => {
    setStatus("submitting");

    try {
      await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        {
          from_name: `${values.firstName} ${values.lastName}`,
          from_email: values.email,
          company: values.company || "Non spécifiée",
          phone: values.phone || "Non spécifié",
          subject: values.subject,
          message: values.message,
          to_email: "contact@smilelabortho.be",
        },
        EMAIL_CONFIG.PUBLIC_KEY
      );

      setStatus("success");
      resetForm();
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error("Erreur email:", error);
      setStatus("error");
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <section className="cnt-section" id="header-contact">
      <div className="cnt-container">
        {/* Header */}
        <div className="cnt-header">
          <h2 className="cnt-title">Contactez-nous</h2>
          <p className="cnt-subtitle">
            Une question ? Un projet ? Notre équipe d'experts vous répond sous
            24h.
          </p>
        </div>

        <div className="cnt-grid">
          {/* Colonne Info */}
          <div className="cnt-info-card">
            <h3 className="cnt-info-title">Nos Coordonnées</h3>
            <p className="cnt-info-desc">
              Nous sommes disponibles du lundi au vendredi pour accompagner
              votre transformation digitale.
            </p>

            <div className="cnt-contacts-list">
              <div className="cnt-contact-item">
                <div className="cnt-icon-circle">
                  <Mail size={20} />
                </div>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:contact@smilelabortho.be">
                    contact@smilelabortho.be
                  </a>
                </div>
              </div>

              <div className="cnt-contact-item">
                <div className="cnt-icon-circle">
                  <Phone size={20} />
                </div>
                <div>
                  <strong>Téléphone</strong>
                  <a href="tel:+320493357328">+32 0 493 35 73 28</a>
                </div>
              </div>

              <div className="cnt-contact-item">
                <div className="cnt-icon-circle">
                  <MapPin size={20} />
                </div>
                <div>
                  <strong>Adresse</strong>
                  <span>
                    Boulevard Roosevelt 23
                    <br />
                    7060 Soignies, Belgique
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Formulaire */}
          <div className="cnt-form-card">
            {status === "success" && (
              <div className="cnt-alert cnt-alert-success">
                <CheckCircle2 size={20} /> Message envoyé avec succès !
              </div>
            )}
            {status === "error" && (
              <div className="cnt-alert cnt-alert-error">
                <AlertCircle size={20} /> Une erreur est survenue.
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
                <Form className="cnt-form">
                  <div className="cnt-row">
                    <ContactField
                      name="firstName"
                      label="Prénom *"
                      icon={User}
                      placeholder="Jean"
                    />
                    <ContactField
                      name="lastName"
                      label="Nom *"
                      icon={User}
                      placeholder="Dupont"
                    />
                  </div>

                  <div className="cnt-row">
                    <ContactField
                      name="email"
                      label="Email *"
                      icon={Mail}
                      type="email"
                      placeholder="jean@cabinet.com"
                    />
                    <ContactField
                      name="phone"
                      label="Téléphone"
                      icon={Phone}
                      type="tel"
                      placeholder="04..."
                    />
                  </div>

                  <ContactField
                    name="company"
                    label="Entreprise / Cabinet"
                    icon={Building}
                    placeholder="Nom du cabinet"
                  />

                  <ContactField
                    name="subject"
                    label="Sujet *"
                    icon={MessageSquare}
                    as="select"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="demo">Demande de démo / Inscription</option>
                    <option value="support">Support technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre demande</option>
                  </ContactField>

                  <ContactField
                    name="message"
                    label="Message *"
                    as="textarea"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />

                  <button
                    type="submit"
                    disabled={status === "submitting" || !isValid || !dirty}
                    className="cnt-submit-btn"
                  >
                    {status === "submitting" ? (
                      <span className="cnt-loader"></span>
                    ) : (
                      <>
                        Envoyer le message <Send size={18} />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
