/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Save,
  X,
  Mail,
  MapPin,
  FileText,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import "./CabinetFormModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Schéma de validation identique pour création et édition
const validationSchema = Yup.object({
  nom: Yup.string().required("Requis").max(100, "Max 100 caractères"),
  email: Yup.string().email("Email invalide").required("Requis"),
  numeroDeTelephone: Yup.string()
    .matches(/^(\+?\d{1,3}[-\s]?)?\d{6,12}$/, "Numéro invalide")
    .required("Requis"),
  adresseDeLivraison: Yup.string().max(255, "Max 255 caractères"),
  adresseDeFacturation: Yup.string().max(255, "Max 255 caractères"),
});

// ── Champ générique ───────────────────────────────────────────────────────────
const CabinetField = ({
  name,
  label,
  icon: Icon,
  placeholder,
  type = "text",
  disabled = false,
  hint,
}) => (
  <div className="cabinet-input-group">
    <label className="cabinet-field-label">{label}</label>
    <div className={`cabinet-input-wrapper${disabled ? " disabled" : ""}`}>
      {Icon && <Icon className="cabinet-input-icon" size={18} />}
      <Field
        name={name}
        type={type}
        className={`cabinet-text-input${disabled ? " cabinet-input-disabled" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
    {hint && <p className="cabinet-field-hint">{hint}</p>}
    <ErrorMessage
      name={name}
      component="div"
      className="cabinet-error-message"
    />
  </div>
);

// ── Modal principal ───────────────────────────────────────────────────────────
const CabinetFormModal = ({ isOpen, onClose, cabinetToEdit, onSuccess }) => {
  const [modalError, setModalError] = useState(null);
  const isEdit = Boolean(cabinetToEdit);

  const handleSubmit = async (values, { setSubmitting }) => {
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `${API_BASE_URL}/cabinet/${cabinetToEdit.id}`
        : `${API_BASE_URL}/cabinet`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Erreur lors de l'enregistrement");

      onSuccess(data, isEdit ? "modification" : "creation");
      onClose();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Détecter si l'email a changé (pour afficher le warning)
  const originalEmail = cabinetToEdit?.email || "";

  return (
    <div className="cabinet-modal-overlay">
      <div className="cabinet-modal">
        <div className="cabinet-modal-header">
          <h2>{isEdit ? "Modifier" : "Créer"} un cabinet</h2>
          <button onClick={onClose} className="cabinet-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="cabinet-modal-body">
          {modalError && (
            <div className="cabinet-modal-error-alert">
              <AlertCircle size={20} />
              <span>{modalError}</span>
            </div>
          )}

          <Formik
            initialValues={{
              nom: cabinetToEdit?.nom || "",
              email: cabinetToEdit?.email || "",
              numeroDeTelephone: cabinetToEdit?.numeroDeTelephone || "",
              adresseDeLivraison: cabinetToEdit?.adresseDeLivraison || "",
              adresseDeFacturation: cabinetToEdit?.adresseDeFacturation || "",
              skipEmailVerification: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values }) => {
              const emailChanged = isEdit && values.email !== originalEmail;

              return (
                <Form className="cabinet-modal-form">
                  <div className="cabinet-form-fields">
                    <CabinetField
                      name="nom"
                      label="Nom *"
                      icon={Building2}
                      placeholder="Nom du cabinet"
                    />

                    {/* Email — modifiable en édition avec avertissement */}
                    <CabinetField
                      name="email"
                      label="Email *"
                      icon={Mail}
                      type="email"
                      placeholder="contact@..."
                      hint={
                        isEdit
                          ? "Modifier l'email réinitialisera le statut de vérification et d'envoi du mot de passe."
                          : undefined
                      }
                    />

                    {/* Avertissement si l'email a changé en édition */}
                    {emailChanged && (
                      <div className="cabinet-email-change-warning">
                        <Info size={15} />
                        <span>
                          L'email sera mis à jour. Le cabinet devra recevoir un
                          nouveau mot de passe via le bouton{" "}
                          <strong>🔑 Clé</strong> après enregistrement.
                        </span>
                      </div>
                    )}

                    <div className="form-row-2">
                      <CabinetField
                        name="numeroDeTelephone"
                        label="Téléphone *"
                        icon={Phone}
                        placeholder="+32..."
                      />
                      <CabinetField
                        name="adresseDeLivraison"
                        label="Livraison"
                        icon={MapPin}
                        placeholder="Adresse..."
                      />
                    </div>

                    <CabinetField
                      name="adresseDeFacturation"
                      label="Facturation (Optionnel)"
                      icon={FileText}
                      placeholder="Adresse..."
                    />

                    {/* Option accès immédiat — uniquement à la création */}
                    {!isEdit && (
                      <div className="cabinet-checkbox-group">
                        <label className="cabinet-checkbox-label">
                          <Field
                            type="checkbox"
                            name="skipEmailVerification"
                            className="cabinet-checkbox-input"
                          />
                          <span className="cabinet-checkbox-text">
                            <CheckCircle2
                              size={16}
                              color="var(--cabinet-primary)"
                            />
                            Accès immédiat (sans validation email)
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="cabinet-modal-actions">
                    <button
                      type="button"
                      onClick={onClose}
                      className="cabinet-cancel-btn"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cabinet-save-btn"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {isEdit ? "Enregistrer" : "Créer"}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CabinetFormModal;
