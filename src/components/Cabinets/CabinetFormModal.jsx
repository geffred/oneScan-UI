import React, { useState, useMemo } from "react";
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
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import "./CabinetFormModal.css"; // Assure-toi que les styles sont accessibles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Schéma de validation ---
const validationSchema = Yup.object({
  nom: Yup.string().required("Requis").max(100, "Max 100 caractères"),
  email: Yup.string().email("Email invalide").required("Requis"),
  numeroDeTelephone: Yup.string()
    .matches(/^(\+?\d{1,3}[-\s]?)?\d{6,12}$/, "Numéro invalide")
    .required("Requis"),
  adresseDeLivraison: Yup.string().max(255, "Max 255 caractères"),
  adresseDeFacturation: Yup.string().max(255, "Max 255 caractères"),
});

// --- Sous-composant Champ (Interne) ---
const CabinetField = ({
  name,
  label,
  icon: Icon,
  placeholder,
  type = "text",
}) => (
  <div className="cabinet-input-group">
    <label className="cabinet-field-label">{label}</label>
    <div className="cabinet-input-wrapper">
      {Icon && <Icon className="cabinet-input-icon" size={18} />}
      <Field
        name={name}
        type={type}
        className="cabinet-text-input"
        placeholder={placeholder}
      />
    </div>
    <ErrorMessage
      name={name}
      component="div"
      className="cabinet-error-message"
    />
  </div>
);

const CabinetFormModal = ({ isOpen, onClose, cabinetToEdit, onSuccess }) => {
  const [modalError, setModalError] = useState(null);

  const initialValues = useMemo(
    () => ({
      nom: cabinetToEdit?.nom || "",
      email: cabinetToEdit?.email || "",
      numeroDeTelephone: cabinetToEdit?.numeroDeTelephone || "",
      adresseDeLivraison: cabinetToEdit?.adresseDeLivraison || "",
      adresseDeFacturation: cabinetToEdit?.adresseDeFacturation || "",
      skipEmailVerification: false,
    }),
    [cabinetToEdit]
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const url = cabinetToEdit
        ? `${API_BASE_URL}/cabinet/${cabinetToEdit.id}`
        : `${API_BASE_URL}/cabinet`;
      const method = cabinetToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement");
      }

      // Notifier le parent que c'est réussi
      onSuccess(data, cabinetToEdit ? "modification" : "creation");
      onClose();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cabinet-modal-overlay">
      <div className="cabinet-modal">
        <div className="cabinet-modal-header">
          <h2>{cabinetToEdit ? "Modifier" : "Créer"} un cabinet</h2>
          <button onClick={onClose} className="cabinet-modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="cabinet-modal-body">
          {/* Message d'erreur local à la modale */}
          {modalError && (
            <div className="cabinet-modal-error-alert">
              <AlertCircle size={20} />
              <span>{modalError}</span>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="cabinet-modal-form">
                <div className="cabinet-form-fields">
                  <CabinetField
                    name="nom"
                    label="Nom *"
                    icon={Building2}
                    placeholder="Nom du cabinet"
                  />
                  <CabinetField
                    name="email"
                    label="Email *"
                    icon={Mail}
                    type="email"
                    placeholder="contact@..."
                  />

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

                  {!cabinetToEdit && (
                    <div className="cabinet-checkbox-group">
                      <label className="cabinet-checkbox-label">
                        <Field
                          type="checkbox"
                          name="skipEmailVerification"
                          className="cabinet-checkbox-input"
                        />
                        <span className="cabinet-checkbox-text">
                          <CheckCircle2 size={16} /> Accès immédiat (sans
                          validation email)
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
                    {cabinetToEdit ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CabinetFormModal;
