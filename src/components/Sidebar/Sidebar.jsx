/* eslint-disable react/prop-types */
import {
  ChartLine,
  Package,
  Database,
  LoaderCircle,
  TvMinimal,
} from "lucide-react";
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
            setActiveComponent("platform");
            toggleSidebar();
          }}
          className={`sidebar-item ${
            activeComponent === "platform" ? "active" : ""
          }`}
        >
          <TvMinimal className="sidebar-icon" />
          Platformes
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

        <button
          onClick={() => {
            setActiveComponent("analytique");
            toggleSidebar();
          }}
          className={`sidebar-item ${
            activeComponent === "analytique" ? "active" : ""
          }`}
        >
          <ChartLine className="sidebar-icon" />
          Analytique
        </button>

        <button className="sidebar-item">
          <LoaderCircle className="sidebar-icon" /> À propos
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
