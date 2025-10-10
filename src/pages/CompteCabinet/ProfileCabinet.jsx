import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Building,
  Mail,
  Phone,
  Home,
  MapPin,
  Save,
  Edit,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cabinetApi } from "../../components/Config/apiUtils";
import "./ProfileCabinet.css";

const ProfileCabinet = ({ cabinetData, onUpdate, onError, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    nom: Yup.string()
      .required("Le nom du cabinet est requis")
      .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    numeroDeTelephone: Yup.string()
      .required("Le numéro de téléphone est requis")
      .matches(/^\+?[0-9\s-]+$/, "Numéro de téléphone invalide")
      .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères"),
    adresseDeLivraison: Yup.string().max(
      255,
      "L'adresse de livraison ne peut pas dépasser 255 caractères"
    ),
    adresseDeFacturation: Yup.string().max(
      255,
      "L'adresse de facturation ne peut pas dépasser 255 caractères"
    ),
    currentPassword: Yup.string().when(["newPassword"], {
      is: (newPassword) => newPassword && newPassword.length > 0,
      then: (schema) =>
        schema.required(
          "Le mot de passe actuel est requis pour changer le mot de passe"
        ),
      otherwise: (schema) => schema,
    }),
    newPassword: Yup.string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .test(
        "not-equal",
        "Le nouveau mot de passe doit être différent de l'ancien",
        function (value) {
          return !value || value !== this.parent.currentPassword;
        }
      ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Si changement de mot de passe demandé
      if (values.newPassword && values.currentPassword) {
        await cabinetApi.changePassword(
          values.currentPassword,
          values.newPassword
        );
        onSuccess("Mot de passe modifié avec succès");
      }

      // Mettre à jour les autres informations du cabinet
      const updatedCabinetData = {
        ...cabinetData,
        nom: values.nom,
        numeroDeTelephone: values.numeroDeTelephone,
        adresseDeLivraison: values.adresseDeLivraison,
        adresseDeFacturation: values.adresseDeFacturation,
      };

      // Appel API pour mettre à jour le profil
      const updated = await cabinetApi.update(
        cabinetData.id,
        updatedCabinetData
      );

      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      onError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="profile-cabinet-tab-actions">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="profile-cabinet-edit-btn"
          >
            <Edit size={18} />
            Modifier
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
          <Form className="profile-cabinet-form">
            <div className="profile-cabinet-form-grid">
              {/* Nom du Cabinet */}
              <div className="profile-cabinet-field-group">
                <label htmlFor="nom" className="profile-cabinet-label">
                  Nom du Cabinet
                </label>
                <div className="profile-cabinet-input-wrapper">
                  <Building className="profile-cabinet-input-icon" />
                  <Field
                    name="nom"
                    type="text"
                    className="profile-cabinet-input"
                    disabled={!isEditing}
                    placeholder="Cabinet Dentaire Exemple"
                  />
                </div>
                <ErrorMessage
                  name="nom"
                  component="div"
                  className="profile-cabinet-error"
                />
              </div>

              {/* Email du Cabinet */}
              <div className="profile-cabinet-field-group">
                <label htmlFor="email" className="profile-cabinet-label">
                  Email du Cabinet
                </label>
                <div className="profile-cabinet-input-wrapper">
                  <Mail className="profile-cabinet-input-icon" />
                  <Field
                    name="email"
                    type="email"
                    className="profile-cabinet-input profile-cabinet-disabled"
                    disabled={true}
                  />
                </div>
                <p className="profile-cabinet-info">
                  L'email ne peut pas être modifié. Contactez votre laboratoire
                  si nécessaire.
                </p>
              </div>

              {/* Téléphone */}
              <div className="profile-cabinet-field-group">
                <label
                  htmlFor="numeroDeTelephone"
                  className="profile-cabinet-label"
                >
                  Téléphone
                </label>
                <div className="profile-cabinet-input-wrapper">
                  <Phone className="profile-cabinet-input-icon" />
                  <Field
                    name="numeroDeTelephone"
                    type="text"
                    className="profile-cabinet-input"
                    disabled={!isEditing}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <ErrorMessage
                  name="numeroDeTelephone"
                  component="div"
                  className="profile-cabinet-error"
                />
              </div>

              {/* Adresse de Livraison */}
              <div className="profile-cabinet-field-group">
                <label
                  htmlFor="adresseDeLivraison"
                  className="profile-cabinet-label"
                >
                  Adresse de Livraison
                </label>
                <div className="profile-cabinet-input-wrapper">
                  <Home className="profile-cabinet-input-icon" />
                  <Field
                    name="adresseDeLivraison"
                    type="text"
                    className="profile-cabinet-input"
                    disabled={!isEditing}
                    placeholder="123 Rue de la Santé, 75000 Paris"
                  />
                </div>
                <ErrorMessage
                  name="adresseDeLivraison"
                  component="div"
                  className="profile-cabinet-error"
                />
              </div>

              {/* Adresse de Facturation */}
              <div className="profile-cabinet-field-group">
                <label
                  htmlFor="adresseDeFacturation"
                  className="profile-cabinet-label"
                >
                  Adresse de Facturation
                </label>
                <div className="profile-cabinet-input-wrapper">
                  <MapPin className="profile-cabinet-input-icon" />
                  <Field
                    name="adresseDeFacturation"
                    type="text"
                    className="profile-cabinet-input"
                    disabled={!isEditing}
                    placeholder="123 Rue de la Facturation, 75000 Paris"
                  />
                </div>
                <ErrorMessage
                  name="adresseDeFacturation"
                  component="div"
                  className="profile-cabinet-error"
                />
              </div>

              {/* Champs de mot de passe (visible uniquement en mode édition) */}
              {isEditing && (
                <>
                  <div className="profile-cabinet-field-group">
                    <label
                      htmlFor="currentPassword"
                      className="profile-cabinet-label"
                    >
                      Mot de passe actuel
                    </label>
                    <div className="profile-cabinet-input-wrapper">
                      <Lock className="profile-cabinet-input-icon" />
                      <Field
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        className="profile-cabinet-input"
                        placeholder="Mot de passe actuel (optionnel)"
                      />
                      <button
                        type="button"
                        className="profile-cabinet-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="currentPassword"
                      component="div"
                      className="profile-cabinet-error"
                    />
                  </div>

                  <div className="profile-cabinet-field-group">
                    <label
                      htmlFor="newPassword"
                      className="profile-cabinet-label"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="profile-cabinet-input-wrapper">
                      <Lock className="profile-cabinet-input-icon" />
                      <Field
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        className="profile-cabinet-input"
                        placeholder="Nouveau mot de passe (optionnel)"
                      />
                      <button
                        type="button"
                        className="profile-cabinet-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="profile-cabinet-error"
                    />
                    <p className="profile-cabinet-info">
                      Laissez vide si vous ne souhaitez pas changer le mot de
                      passe
                    </p>
                  </div>
                </>
              )}

              {/* Informations du laboratoire */}
              {cabinetData.userFirstName && cabinetData.userLastName && (
                <div className="profile-cabinet-lab-info">
                  <h3 className="profile-cabinet-lab-title">
                    Laboratoire Partenaire
                  </h3>
                  <p className="profile-cabinet-lab-details">
                    <strong>Contact:</strong> {cabinetData.userFirstName}{" "}
                    {cabinetData.userLastName}
                  </p>
                  <p className="profile-cabinet-lab-note">
                    Pour toute modification de votre email ou suppression de
                    compte, contactez votre laboratoire partenaire.
                  </p>
                </div>
              )}
            </div>

            {/* Boutons d'action (visible uniquement en mode édition) */}
            {isEditing && (
              <div className="profile-cabinet-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="profile-cabinet-cancel-btn"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="profile-cabinet-save-btn"
                >
                  {isSubmitting ? (
                    <div className="profile-cabinet-loading">
                      <div className="profile-cabinet-spinner"></div>
                      Enregistrement...
                    </div>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ProfileCabinet;
