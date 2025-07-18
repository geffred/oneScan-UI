import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Dashboard from "../../components/DashboardCard/DashboardCard";
import Commandes from "../../components/Commandes/Commandes";
import Socles from "../../components/Socles/socle";
import "./DashboardPage.css"; // Assuming you have a CSS file for styling
import Platform from "../../components/Platform/Platform";

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "commandes":
        return <Commandes />;
      case "socles":
        return <Socles />;
      case "platform":
        return <Platform />;
      default:
        return <Dashboard />;
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
          setActiveComponent={setActiveComponent}
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
