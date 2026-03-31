/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Mail,
  Phone,
  Home,
  MapPin,
  Save,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  FlaskConical,
} from "lucide-react";
import { cabinetApi } from "../../components/Config/apiUtils";
import "./ProfileCabinet.css";

const validationSchema = Yup.object({
  nom: Yup.string()
    .required("Nom du cabinet requis")
    .max(100, "Max 100 caractères"),
  numeroDeTelephone: Yup.string()
    .required("Numéro de téléphone requis")
    .matches(/^\+?[0-9\s-]+$/, "Numéro invalide")
    .max(20, "Max 20 caractères"),
  adresseDeLivraison: Yup.string().max(255, "Max 255 caractères"),
  adresseDeFacturation: Yup.string().max(255, "Max 255 caractères"),
  currentPassword: Yup.string().when("newPassword", {
    is: (v) => v && v.length > 0,
    then: (s) =>
      s.required("Mot de passe actuel requis pour changer le mot de passe"),
    otherwise: (s) => s,
  }),
  newPassword: Yup.string()
    .min(8, "Minimum 8 caractères")
    .test(
      "not-equal",
      "Le nouveau mot de passe doit être différent",
      function (v) {
        return !v || v !== this.parent.currentPassword;
      },
    ),
});

const ProfileCabinet = ({ cabinetData, onUpdate, onError, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (values.newPassword && values.currentPassword) {
        await cabinetApi.changePassword(
          values.currentPassword,
          values.newPassword,
        );
        onSuccess("Mot de passe modifié avec succès");
      }
      const updated = await cabinetApi.update(cabinetData.id, {
        ...cabinetData,
        nom: values.nom,
        numeroDeTelephone: values.numeroDeTelephone,
        adresseDeLivraison: values.adresseDeLivraison,
        adresseDeFacturation: values.adresseDeFacturation,
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      onError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="prc-root">
      {/* Header card */}
      <div className="prc-identity-card">
        <div className="prc-avatar">
          <Building2 size={28} />
        </div>
        <div className="prc-identity-info">
          <h2 className="prc-cabinet-name">{cabinetData.nom}</h2>
          <span className="prc-cabinet-email">
            <Mail size={13} />
            {cabinetData.email}
          </span>
        </div>
        {!isEditing && (
          <button className="prc-edit-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={15} />
            Modifier le profil
          </button>
        )}
      </div>

      <Formik
        initialValues={{
          nom: cabinetData.nom || "",
          email: cabinetData.email || "",
          numeroDeTelephone: cabinetData.numeroDeTelephone || "",
          adresseDeLivraison: cabinetData.adresseDeLivraison || "",
          adresseDeFacturation: cabinetData.adresseDeFacturation || "",
          currentPassword: "",
          newPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="prc-form">
            {/* Section — Informations */}
            <section className="prc-section">
              <h3 className="prc-section-title">Informations du cabinet</h3>
              <div className="prc-grid">
                <div className="prc-field">
                  <label className="prc-label">Nom du cabinet</label>
                  <div className="prc-input-wrap">
                    <Building2 size={16} className="prc-icon" />
                    <Field
                      name="nom"
                      type="text"
                      className="prc-input"
                      disabled={!isEditing}
                      placeholder="Cabinet Dentaire Exemple"
                    />
                  </div>
                  <ErrorMessage
                    name="nom"
                    component="p"
                    className="prc-error"
                  />
                </div>

                <div className="prc-field">
                  <label className="prc-label">Email</label>
                  <div className="prc-input-wrap">
                    <Mail size={16} className="prc-icon" />
                    <Field
                      name="email"
                      type="email"
                      className="prc-input prc-readonly"
                      disabled
                    />
                  </div>
                  <p className="prc-hint">
                    L'email ne peut pas être modifié. Contactez votre
                    laboratoire si nécessaire.
                  </p>
                </div>

                <div className="prc-field">
                  <label className="prc-label">Téléphone</label>
                  <div className="prc-input-wrap">
                    <Phone size={16} className="prc-icon" />
                    <Field
                      name="numeroDeTelephone"
                      type="text"
                      className="prc-input"
                      disabled={!isEditing}
                      placeholder="+32 2 123 45 67"
                    />
                  </div>
                  <ErrorMessage
                    name="numeroDeTelephone"
                    component="p"
                    className="prc-error"
                  />
                </div>

                <div className="prc-field">
                  <label className="prc-label">Adresse de livraison</label>
                  <div className="prc-input-wrap">
                    <Home size={16} className="prc-icon" />
                    <Field
                      name="adresseDeLivraison"
                      type="text"
                      className="prc-input"
                      disabled={!isEditing}
                      placeholder="Rue de la Santé 12, 1000 Bruxelles"
                    />
                  </div>
                  <ErrorMessage
                    name="adresseDeLivraison"
                    component="p"
                    className="prc-error"
                  />
                </div>

                <div className="prc-field prc-full">
                  <label className="prc-label">
                    Adresse de facturation{" "}
                    <span className="prc-optional">(optionnel)</span>
                  </label>
                  <div className="prc-input-wrap">
                    <MapPin size={16} className="prc-icon" />
                    <Field
                      name="adresseDeFacturation"
                      type="text"
                      className="prc-input"
                      disabled={!isEditing}
                      placeholder="Identique à la livraison si vide"
                    />
                  </div>
                  <ErrorMessage
                    name="adresseDeFacturation"
                    component="p"
                    className="prc-error"
                  />
                </div>
              </div>
            </section>

            {/* Section — Mot de passe (édition uniquement) */}
            {isEditing && (
              <section className="prc-section">
                <h3 className="prc-section-title">
                  Sécurité{" "}
                  <span className="prc-optional">
                    — laissez vide pour ne pas changer
                  </span>
                </h3>
                <div className="prc-grid">
                  <div className="prc-field">
                    <label className="prc-label">Mot de passe actuel</label>
                    <div className="prc-input-wrap">
                      <Lock size={16} className="prc-icon" />
                      <Field
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        className="prc-input"
                        placeholder="Mot de passe actuel"
                      />
                      <button
                        type="button"
                        className="prc-eye"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="currentPassword"
                      component="p"
                      className="prc-error"
                    />
                  </div>

                  <div className="prc-field">
                    <label className="prc-label">Nouveau mot de passe</label>
                    <div className="prc-input-wrap">
                      <Lock size={16} className="prc-icon" />
                      <Field
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        className="prc-input"
                        placeholder="Min. 8 caractères"
                      />
                      <button
                        type="button"
                        className="prc-eye"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="p"
                      className="prc-error"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Section — Laboratoire */}
            {cabinetData.userFirstName && cabinetData.userLastName && (
              <section className="prc-section">
                <h3 className="prc-section-title">Laboratoire partenaire</h3>
                <div className="prc-lab-card">
                  <div className="prc-lab-icon">
                    <FlaskConical size={20} />
                  </div>
                  <div className="prc-lab-info">
                    <strong>
                      {cabinetData.userFirstName} {cabinetData.userLastName}
                    </strong>
                    <p>
                      Pour toute modification de votre email ou suppression de
                      compte, contactez directement votre laboratoire
                      partenaire.
                    </p>
                  </div>
                  <div className="prc-lab-badge">
                    <CheckCircle size={14} />
                    Partenaire actif
                  </div>
                </div>
              </section>
            )}

            {/* Actions */}
            {isEditing && (
              <div className="prc-actions">
                <button
                  type="button"
                  className="prc-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="prc-save"
                >
                  {isSubmitting ? (
                    <>
                      <span className="prc-spinner" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileCabinet;
