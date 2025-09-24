// CompteCabinet.jsx
import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSWR, { mutate } from "swr";
import {
  Users,
  Mail,
  Phone,
  Home,
  Building,
  Save,
  Edit,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  LogOut,
  Package,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./CompteCabinet.css";
import Footer from "../../components/Footer/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Fetcher function for SWR
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des données");
  }
  return response.json();
};

const CompteCabinet = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [cabinetData, setCabinetData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  // SWR pour récupérer les commandes
  const {
    data: commandes,
    error: commandesError,
    isLoading: loadingCommandes,
  } = useSWR(
    cabinetData?.id ? `${API_BASE_URL}/public/commandes` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateInterval: 30000, // Revalidation toutes les 30 secondes
      onSuccess: (data) => {
        // Filtrer les commandes pour ce cabinet
        return (
          data?.filter((commande) => commande.cabinetId === cabinetData?.id) ||
          []
        );
      },
    }
  );

  // Filtrer les commandes pour ce cabinet
  const filteredCommandes =
    commandes?.filter((commande) => commande.cabinetId === cabinetData?.id) ||
    [];

  useEffect(() => {
    // Vérifier l'authentification et récupérer les données du cabinet
    const userType = localStorage.getItem("userType");
    const storedCabinetData = localStorage.getItem("cabinetData");

    if (!isAuthenticated || userType !== "cabinet" || !storedCabinetData) {
      navigate("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(storedCabinetData);
      setCabinetData(parsedData);
    } catch (err) {
      setError("Erreur lors du chargement des données du cabinet");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fonctions utilitaires pour les statuts
  const getStatutIcon = (statut) => {
    const iconMap = {
      EN_ATTENTE: <Clock size={16} />,
      EN_COURS: <AlertCircle size={16} />,
      TERMINEE: <CheckCircle size={16} />,
      EXPEDIEE: <Truck size={16} />,
      ANNULEE: <XCircle size={16} />,
    };
    return iconMap[statut] || <Clock size={16} />;
  };

  const getStatutText = (statut) => {
    const textMap = {
      EN_ATTENTE: "En attente",
      EN_COURS: "En cours",
      TERMINEE: "Terminée",
      EXPEDIEE: "Expédiée",
      ANNULEE: "Annulée",
    };
    return textMap[statut] || statut;
  };

  const getStatutClass = (statut) => {
    const classMap = {
      EN_ATTENTE: "en-attente",
      EN_COURS: "en-cours",
      TERMINEE: "termine",
      EXPEDIEE: "livre",
      ANNULEE: "annule",
    };
    return classMap[statut] || "en-attente";
  };

  // Schema de validation
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

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Si changement de mot de passe demandé, utiliser l'API dédiée
      if (values.newPassword && values.currentPassword) {
        const passwordResponse = await fetch(
          `${API_BASE_URL}/cabinet/auth/change-password?email=${
            cabinetData.email
          }&currentPassword=${encodeURIComponent(
            values.currentPassword
          )}&newPassword=${encodeURIComponent(values.newPassword)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(
            errorData.message || "Erreur lors du changement de mot de passe"
          );
        }
      }

      // Mettre à jour les autres informations du cabinet via l'API de profil
      // Pour les cabinets, il faut utiliser une approche différente car ils n'ont pas de JWT
      // On va d'abord récupérer les données actuelles puis les mettre à jour
      const profileResponse = await fetch(
        `${API_BASE_URL}/cabinet/auth/profile?email=${cabinetData.email}`
      );

      if (!profileResponse.ok) {
        throw new Error("Erreur lors de la récupération du profil");
      }

      const currentProfile = await profileResponse.json();

      // Créer un objet avec les nouvelles données
      const updatedCabinetData = {
        ...currentProfile,
        nom: values.nom,
        numeroDeTelephone: values.numeroDeTelephone,
        adresseDeLivraison: values.adresseDeLivraison,
        adresseDeFacturation: values.adresseDeFacturation,
      };

      // Sauvegarder les données mises à jour
      setCabinetData(updatedCabinetData);
      localStorage.setItem("cabinetData", JSON.stringify(updatedCabinetData));

      setIsEditing(false);
      setSuccess("Vos informations ont été mises à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/cabinet/auth/logout`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem("cabinetData");
      localStorage.removeItem("userType");
      logout();
      navigate("/login");
    }
  };

  // Composant pour l'affichage d'une commande
  const CommandeCard = ({ commande }) => (
    <div className="compte-cabinet-commande-card">
      <div className="compte-cabinet-commande-header">
        <div className="compte-cabinet-commande-info">
          <h3 className="compte-cabinet-commande-ref">{commande.refPatient}</h3>
          <p className="compte-cabinet-commande-plateforme">
            {commande.plateforme}
          </p>
        </div>
        <div
          className={`compte-cabinet-commande-statut ${getStatutClass(
            commande.statut
          )}`}
        >
          {getStatutIcon(commande.statut)}
          {getStatutText(commande.statut)}
        </div>
      </div>

      <div className="compte-cabinet-commande-details">
        <div className="compte-cabinet-commande-detail">
          <Calendar size={14} />
          <span>
            Réception:{" "}
            {new Date(commande.dateReception).toLocaleDateString("fr-FR")}
          </span>
        </div>
        {commande.dateEcheance && (
          <div className="compte-cabinet-commande-detail">
            <Clock size={14} />
            <span>
              Échéance:{" "}
              {new Date(commande.dateEcheance).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
        {commande.typeAppareil && (
          <div className="compte-cabinet-commande-detail">
            <Package size={14} />
            <span>Type: {commande.typeAppareil}</span>
          </div>
        )}
        {commande.numeroSuivi && (
          <div className="compte-cabinet-commande-detail">
            <Truck size={14} />
            <span>Suivi: {commande.numeroSuivi}</span>
          </div>
        )}
      </div>

      {commande.details && (
        <div className="compte-cabinet-commande-description">
          <p>{commande.details}</p>
        </div>
      )}

      {commande.commentaire && (
        <div className="compte-cabinet-commande-commentaire">
          <p>
            <strong>Commentaire:</strong> {commande.commentaire}
          </p>
        </div>
      )}
    </div>
  );

  // État de chargement initial
  if (!cabinetData) {
    return (
      <div className="compte-cabinet-initial-loading">
        <div className="compte-cabinet-loading-spinner"></div>
        <p>Chargement de vos informations...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar path="/compte/cabinet" />
      <div className="compte-cabinet-main-wrapper">
        <div className="compte-cabinet-content-container">
          <div className="compte-cabinet-profile-card">
            {/* En-tête */}
            <div className="compte-cabinet-profile-header">
              <h1 className="compte-cabinet-profile-title">
                <div className="compte-cabinet-profile-icon">
                  <Users size={24} />
                </div>
                Mon Cabinet Dentaire
              </h1>
              <div className="compte-cabinet-header-actions">
                <button
                  onClick={handleLogout}
                  className="compte-cabinet-logout-btn"
                >
                  <LogOut size={18} />
                  Se déconnecter
                </button>
              </div>
            </div>

            {/* Messages de notification */}
            {error && (
              <div className="compte-cabinet-error-notification">{error}</div>
            )}
            {success && (
              <div className="compte-cabinet-success-notification">
                {success}
              </div>
            )}

            {/* Navigation par onglets */}
            <div className="compte-cabinet-tabs">
              <button
                className={`compte-cabinet-tab ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <Users size={18} />
                Profil
              </button>
              <button
                className={`compte-cabinet-tab ${
                  activeTab === "commandes" ? "active" : ""
                }`}
                onClick={() => setActiveTab("commandes")}
              >
                <Package size={18} />
                Mes Commandes ({filteredCommandes.length})
              </button>
            </div>

            {/* Contenu de l'onglet Profil */}
            {activeTab === "profile" && (
              <>
                <div className="compte-cabinet-tab-actions">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="compte-cabinet-edit-profile-btn"
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
                    adresseDeFacturation:
                      cabinetData.adresseDeFacturation || "",
                    currentPassword: "",
                    newPassword: "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form className="compte-cabinet-profile-form">
                      <div className="compte-cabinet-form-fields-grid">
                        {/* Nom du Cabinet */}
                        <div className="compte-cabinet-input-field-group">
                          <label
                            htmlFor="nom"
                            className="compte-cabinet-field-label"
                          >
                            Nom du Cabinet
                          </label>
                          <div className="compte-cabinet-input-field-wrapper">
                            <Building className="compte-cabinet-input-field-icon" />
                            <Field
                              name="nom"
                              type="text"
                              className="compte-cabinet-text-input-field"
                              disabled={!isEditing}
                              placeholder="Cabinet Dentaire Exemple"
                            />
                          </div>
                          <ErrorMessage
                            name="nom"
                            component="div"
                            className="compte-cabinet-field-error-message"
                          />
                        </div>

                        {/* Email du Cabinet */}
                        <div className="compte-cabinet-input-field-group">
                          <label
                            htmlFor="email"
                            className="compte-cabinet-field-label"
                          >
                            Email du Cabinet
                          </label>
                          <div className="compte-cabinet-input-field-wrapper">
                            <Mail className="compte-cabinet-input-field-icon" />
                            <Field
                              name="email"
                              type="email"
                              className="compte-cabinet-text-input-field compte-cabinet-disabled-field"
                              disabled={true}
                            />
                          </div>
                          <p className="compte-cabinet-field-info">
                            L'email ne peut pas être modifié. Contactez votre
                            laboratoire si nécessaire.
                          </p>
                        </div>

                        {/* Téléphone */}
                        <div className="compte-cabinet-input-field-group">
                          <label
                            htmlFor="numeroDeTelephone"
                            className="compte-cabinet-field-label"
                          >
                            Téléphone
                          </label>
                          <div className="compte-cabinet-input-field-wrapper">
                            <Phone className="compte-cabinet-input-field-icon" />
                            <Field
                              name="numeroDeTelephone"
                              type="text"
                              className="compte-cabinet-text-input-field"
                              disabled={!isEditing}
                              placeholder="+33 1 23 45 67 89"
                            />
                          </div>
                          <ErrorMessage
                            name="numeroDeTelephone"
                            component="div"
                            className="compte-cabinet-field-error-message"
                          />
                        </div>

                        {/* Adresse de Livraison */}
                        <div className="compte-cabinet-input-field-group">
                          <label
                            htmlFor="adresseDeLivraison"
                            className="compte-cabinet-field-label"
                          >
                            Adresse de Livraison
                          </label>
                          <div className="compte-cabinet-input-field-wrapper">
                            <Home className="compte-cabinet-input-field-icon" />
                            <Field
                              name="adresseDeLivraison"
                              type="text"
                              className="compte-cabinet-text-input-field"
                              disabled={!isEditing}
                              placeholder="123 Rue de la Santé, 75000 Paris"
                            />
                          </div>
                          <ErrorMessage
                            name="adresseDeLivraison"
                            component="div"
                            className="compte-cabinet-field-error-message"
                          />
                        </div>

                        {/* Adresse de Facturation */}
                        <div className="compte-cabinet-input-field-group">
                          <label
                            htmlFor="adresseDeFacturation"
                            className="compte-cabinet-field-label"
                          >
                            Adresse de Facturation
                          </label>
                          <div className="compte-cabinet-input-field-wrapper">
                            <MapPin className="compte-cabinet-input-field-icon" />
                            <Field
                              name="adresseDeFacturation"
                              type="text"
                              className="compte-cabinet-text-input-field"
                              disabled={!isEditing}
                              placeholder="123 Rue de la Facturation, 75000 Paris"
                            />
                          </div>
                          <ErrorMessage
                            name="adresseDeFacturation"
                            component="div"
                            className="compte-cabinet-field-error-message"
                          />
                        </div>

                        {/* Champs de mot de passe (visible uniquement en mode édition) */}
                        {isEditing && (
                          <>
                            <div className="compte-cabinet-input-field-group">
                              <label
                                htmlFor="currentPassword"
                                className="compte-cabinet-field-label"
                              >
                                Mot de passe actuel
                              </label>
                              <div className="compte-cabinet-input-field-wrapper">
                                <Lock className="compte-cabinet-input-field-icon" />
                                <Field
                                  name="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  className="compte-cabinet-text-input-field"
                                  placeholder="Mot de passe actuel (optionnel)"
                                />
                                <button
                                  type="button"
                                  className="compte-cabinet-password-visibility-toggle"
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
                                className="compte-cabinet-field-error-message"
                              />
                            </div>

                            <div className="compte-cabinet-input-field-group">
                              <label
                                htmlFor="newPassword"
                                className="compte-cabinet-field-label"
                              >
                                Nouveau mot de passe
                              </label>
                              <div className="compte-cabinet-input-field-wrapper">
                                <Lock className="compte-cabinet-input-field-icon" />
                                <Field
                                  name="newPassword"
                                  type={showPassword ? "text" : "password"}
                                  className="compte-cabinet-text-input-field"
                                  placeholder="Nouveau mot de passe (optionnel)"
                                />
                                <button
                                  type="button"
                                  className="compte-cabinet-password-visibility-toggle"
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
                                className="compte-cabinet-field-error-message"
                              />
                              <p className="compte-cabinet-field-info">
                                Laissez vide si vous ne souhaitez pas changer le
                                mot de passe
                              </p>
                            </div>
                          </>
                        )}

                        {/* Informations du laboratoire */}
                        {cabinetData.userFirstName &&
                          cabinetData.userLastName && (
                            <div className="compte-cabinet-lab-info">
                              <h3 className="compte-cabinet-lab-title">
                                Laboratoire Partenaire
                              </h3>
                              <p className="compte-cabinet-lab-details">
                                <strong>Contact:</strong>{" "}
                                {cabinetData.userFirstName}{" "}
                                {cabinetData.userLastName}
                              </p>
                              <p className="compte-cabinet-lab-note">
                                Pour toute modification de votre email ou
                                suppression de compte, contactez votre
                                laboratoire partenaire.
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Boutons d'action (visible uniquement en mode édition) */}
                      {isEditing && (
                        <div className="compte-cabinet-form-action-buttons">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="compte-cabinet-cancel-changes-btn"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="compte-cabinet-save-changes-btn"
                          >
                            {isSubmitting ? (
                              <div className="compte-cabinet-loading-spinner-container">
                                <div className="compte-cabinet-loading-spinner"></div>
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
            )}

            {/* Contenu de l'onglet Commandes */}
            {activeTab === "commandes" && (
              <div className="compte-cabinet-commandes-section">
                <div className="compte-cabinet-commandes-header">
                  <h2 className="compte-cabinet-commandes-title">
                    <Package size={20} />
                    Mes Commandes
                  </h2>
                  <p className="compte-cabinet-commandes-subtitle">
                    Suivez l'état de vos commandes en temps réel
                  </p>
                </div>

                {/* Gestion des états de chargement et d'erreur */}
                {loadingCommandes ? (
                  <div className="compte-cabinet-commandes-loading">
                    <div className="compte-cabinet-loading-spinner"></div>
                    <p>Chargement de vos commandes...</p>
                  </div>
                ) : commandesError ? (
                  <div className="compte-cabinet-commandes-empty">
                    <Package size={48} className="text-gray-400" />
                    <h3>Erreur de chargement</h3>
                    <p>
                      Une erreur est survenue lors du chargement des commandes.
                    </p>
                  </div>
                ) : filteredCommandes.length === 0 ? (
                  <div className="compte-cabinet-commandes-empty">
                    <Package size={48} className="text-gray-400" />
                    <h3>Aucune commande trouvée</h3>
                    <p>
                      Vos commandes apparaîtront ici une fois créées par le
                      laboratoire.
                    </p>
                  </div>
                ) : (
                  <div className="compte-cabinet-commandes-grid">
                    {filteredCommandes.map((commande) => (
                      <CommandeCard key={commande.id} commande={commande} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompteCabinet;
