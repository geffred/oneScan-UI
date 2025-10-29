/* eslint-disable no-unused-vars */
import { Users, Package, LogOut, PlusCircle } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/Config/AuthContext";
import useSWR from "swr";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProfileCabinet from "./ProfileCabinet";
import CommandesCabinet from "./CommandesCabinet";
import PasserCommande from "./PasserCommande";
import { cabinetApi, apiGet } from "../../components/Config/apiUtils";
import { ToastContainer } from "react-toastify";
import "./CompteCabinet.css";

// Fetcher function for SWR avec JWT
const fetcher = (url) => apiGet(url);

const CompteCabinet = () => {
  const { isAuthenticated, userData, userType, logout } =
    useContext(AuthContext);
  const [cabinetData, setCabinetData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // SWR pour récupérer le profil du cabinet
  const {
    data: profileData,
    error: profileError,
    isLoading: loadingProfile,
    mutate: mutateProfile,
  } = useSWR(
    isAuthenticated && userType === "cabinet" ? "/cabinet/auth/profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setCabinetData(data);
      },
    }
  );

  // SWR pour récupérer les commandes
  const {
    data: commandes,
    error: commandesError,
    isLoading: loadingCommandes,
    mutate: mutateCommandes,
  } = useSWR(cabinetData?.id ? `/public/commandes` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateInterval: 30000,
  });

  // Filtrer les commandes pour ce cabinet
  const filteredCommandes =
    commandes?.filter((commande) => commande.cabinetId === cabinetData?.id) ||
    [];

  useEffect(() => {
    if (!isAuthenticated || userType !== "cabinet") {
      navigate("/");
      return;
    }

    if (userData) {
      setCabinetData(userData);
    }
  }, [isAuthenticated, userType, userData, navigate]);

  useEffect(() => {
    if (profileError) {
      setError("Erreur lors du chargement du profil");
    }
  }, [profileError]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileUpdate = (updatedData) => {
    setCabinetData(updatedData);
    mutateProfile(updatedData);
    setSuccess("Vos informations ont été mises à jour avec succès");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (successMessage) => {
    setSuccess(successMessage);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Callback après création d'une commande
  const handleCommandeCreated = () => {
    // Recharger les commandes
    mutateCommandes();
    // Afficher un message de succès
    setSuccess("Commande créée avec succès !");
    setTimeout(() => setSuccess(null), 3000);
    // Changer d'onglet pour voir les commandes
    setTimeout(() => {
      setActiveTab("commandes");
    }, 1500);
  };

  if (loadingProfile || !cabinetData) {
    return (
      <div className="compte-cabinet-initial-loading">
        <div className="compte-cabinet-loading-spinner"></div>
        <p>Chargement de vos informations...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
                  activeTab === "nouvelle-commande" ? "active" : ""
                }`}
                onClick={() => setActiveTab("nouvelle-commande")}
              >
                <PlusCircle size={18} />
                Nouvelle Commande
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

            {/* Contenu des onglets */}
            {activeTab === "profile" && (
              <ProfileCabinet
                cabinetData={cabinetData}
                onUpdate={handleProfileUpdate}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}

            {activeTab === "nouvelle-commande" && (
              <PasserCommande
                cabinetData={cabinetData}
                onCommandeCreated={handleCommandeCreated}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}

            {activeTab === "commandes" && (
              <CommandesCabinet
                commandes={filteredCommandes}
                loading={loadingCommandes}
                error={commandesError}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompteCabinet;
