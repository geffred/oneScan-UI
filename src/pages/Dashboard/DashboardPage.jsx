import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Dashboard from "../../components/DashboardCard/DashboardCard";
import Commandes from "../../components/Commandes/Commandes";
import Socles from "../../components/Socles/socle";
import "./DashboardPage.css";
import Platform from "../../components/Platform/Platform";
import Cabinets from "../../components/Cabinets/Cabinets";
import SuiviCommandes from "../../components/SuiviCommandes/SuiviCommandes";

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeComponent: urlComponent } = useParams();
  const navigate = useNavigate();

  // Liste des composants valides
  const validComponents = [
    "platform",
    "commandes",
    "cabinets",
    "socles",
    "analytique",
    "suivi-commandes",
  ];

  // État initial avec vérification du paramètre URL
  const [activeComponent, setActiveComponent] = useState(
    validComponents.includes(urlComponent) ? urlComponent : "platform"
  );

  // Synchronisation quand l'URL change
  useEffect(() => {
    if (urlComponent && validComponents.includes(urlComponent)) {
      setActiveComponent(urlComponent);
    }
  }, [urlComponent]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fonction pour changer de composant
  const handleComponentChange = (newComponent) => {
    if (!validComponents.includes(newComponent)) return;

    setActiveComponent(newComponent);
    navigate(`/dashboard/${newComponent}`, { replace: true });
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "commandes":
        return <Commandes />;
      case "socles":
        return <Socles />;
      case "platform":
        return <Platform />;
      case "analytique":
        return <Dashboard />;
      case "cabinets":
        return <Cabinets />;
      case "suivi-commandes":
        return <SuiviCommandes />;
      default:
        return <Platform />;
    }
  };

  return (
    <div className="dashboardpage-app-container">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="dashboardpage-main-layout">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeComponent={activeComponent}
          setActiveComponent={handleComponentChange} // On utilise maintenant handleComponentChange
        />

        <div className="dashboardpage-main-content">
          <main className="dashboardpage-content-area">
            {renderActiveComponent()}
          </main>

          <footer className="dashboardpage-footer">
            <div className="dashboardpage-footer-content">
              <p className="dashboardpage-footer-text">
                &copy; IA Lab
                <label>Tous les droits sont réservés.</label>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
