import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Dashboard from "../../components/DashboardCard/DashboardCard";
import Commandes from "../../components/Commandes/Commandes";
import Socles from "../../components/Socles/socle";
import "./app.css"; // Assuming you have a CSS file for styling

const App = () => {
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-layout">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />

        <div
          className={`overlay ${sidebarOpen ? "show" : ""}`}
          onClick={toggleSidebar}
        ></div>

        <div className="main-content">
          <main className="content-area">{renderActiveComponent()}</main>

          <footer className="footer">
            <div className="footer-content">
              <p className="footer-text">OneScaN v1.2.3</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
