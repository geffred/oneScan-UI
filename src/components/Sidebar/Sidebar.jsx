/* eslint-disable react/prop-types */
import { Home, Package, Database, Settings } from "lucide-react";
import "./sidebar.css";

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  activeComponent,
  setActiveComponent,
}) => {
  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Dashboard</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          onClick={() => {
            setActiveComponent("dashboard");
            toggleSidebar();
          }}
          className={`sidebar-item ${
            activeComponent === "dashboard" ? "active" : ""
          }`}
        >
          <Home className="sidebar-icon" />
          Dashboard
        </button>

        <button
          onClick={() => {
            setActiveComponent("commandes");
            toggleSidebar();
          }}
          className={`sidebar-item ${
            activeComponent === "commandes" ? "active" : ""
          }`}
        >
          <Package className="sidebar-icon" />
          Commandes
        </button>

        <button
          onClick={() => {
            setActiveComponent("socles");
            toggleSidebar();
          }}
          className={`sidebar-item ${
            activeComponent === "socles" ? "active" : ""
          }`}
        >
          <Database className="sidebar-icon" />
          Socles
        </button>

        <button className="sidebar-item">
          <Settings className="sidebar-icon" />
          Paramètres
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
