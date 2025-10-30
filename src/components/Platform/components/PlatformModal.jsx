import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Save,
  X,
  Monitor,
  Mail,
  Shield,
  Link2,
  Cpu,
  HardDrive,
  Cloud,
} from "lucide-react";
import "./PlatformModal.css";

const platformTypes = [
  { value: "THREESHAPE", label: "3Shape" },
  { value: "MEDITLINK", label: "MeditLink" },
  { value: "ITERO", label: "Itero" },
  { value: "DEXIS", label: "Dexis" },
  { value: "GOOGLE_DRIVE", label: "Google Drive" },
];

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de la plateforme est requis"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string().default("").notRequired(),
});

const PlatformModal = ({
  isOpen,
  onClose,
  editingPlatform,
  initialValues,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="platform-modal-overlay">
      <div className="platform-modal">
        <div className="platform-modal-header">
          <h2>
            {editingPlatform
              ? "Modifier la plateforme"
              : "Ajouter une plateforme"}
          </h2>
          <button onClick={onClose} className="platform-modal-close">
            <X size={24} />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="platform-modal-form">
              <div className="platform-form-fields">
                <div className="platform-input-group">
                  <label className="platform-field-label">
                    Nom de la plateforme
                  </label>
                  <div className="platform-input-wrapper">
                    <Monitor className="platform-input-icon" />
                    <Field
                      as="select"
                      name="name"
                      className="platform-select-input"
                    >
                      <option value="">Sélectionner une plateforme</option>
                      {platformTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="platform-error-message"
                  />
                </div>

                {values.name === "MEDITLINK" && (
                  <div className="platform-info-banner">
                    <Shield size={16} />
                    <div>
                      <strong>Plateforme MeditLink :</strong>
                      <p>
                        Après création, utilisez le bouton "Connecter OAuth"
                        pour vous authentifier de manière sécurisée avec votre
                        compte MeditLink.
                      </p>
                    </div>
                  </div>
                )}

                {values.name === "THREESHAPE" && (
                  <div className="platform-info-banner">
                    <Link2 size={16} />
                    <div>
                      <strong>Plateforme 3Shape :</strong>
                      <p>
                        Après création, utilisez le bouton "Connecter" pour vous
                        authentifier avec votre compte 3Shape et accéder à vos
                        cas.
                      </p>
                    </div>
                  </div>
                )}

                {values.name === "ITERO" && (
                  <div className="platform-info-banner">
                    <Cpu size={16} />
                    <div>
                      <strong>Plateforme Itero :</strong>
                      <p>
                        Après création, utilisez le bouton "Connecter" pour vous
                        connecter à l'API Itero et récupérer vos commandes.
                      </p>
                    </div>
                  </div>
                )}

                {values.name === "DEXIS" && (
                  <div className="platform-info-banner">
                    <HardDrive size={16} />
                    <div>
                      <strong>Plateforme Dexis :</strong>
                      <p>
                        Après création, utilisez le bouton "Connecter" pour vous
                        connecter à l'API Dexis et récupérer vos commandes.
                      </p>
                    </div>
                  </div>
                )}

                {values.name === "GOOGLE_DRIVE" && (
                  <div className="platform-info-banner">
                    <Cloud size={16} />
                    <div>
                      <strong>Plateforme Google Drive :</strong>
                      <p>
                        Après création, utilisez le bouton "Connecter OAuth"
                        pour vous authentifier avec votre compte Google et
                        activer le stockage des fichiers.
                      </p>
                    </div>
                  </div>
                )}

                <div className="platform-input-group">
                  <label className="platform-field-label">Email</label>
                  <div className="platform-input-wrapper">
                    <Mail className="platform-input-icon" />
                    <Field
                      name="email"
                      type="email"
                      className="platform-text-input"
                      placeholder="contact@plateforme.com"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="platform-error-message"
                  />
                </div>
              </div>

              <div className="platform-modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="platform-cancel-btn"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="platform-save-btn"
                >
                  {isSubmitting ? (
                    <div className="platform-loading-container">
                      <div className="platform-loading-spinner"></div>
                      {editingPlatform ? "Modification..." : "Création..."}
                    </div>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingPlatform ? "Modifier" : "Créer"}
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PlatformModal;
