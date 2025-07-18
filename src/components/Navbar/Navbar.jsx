/* eslint-disable react/prop-types */
import { Menu, X, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ sidebarOpen, toggleSidebar, showBackButton = false }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackClick = () => {
    navigate(-1); // Retour à la page précédente
  };

  return (
    <nav className="navbar-component-main">
      <div className="navbar-component-content-wrapper">
        <div className="navbar-component-left-section">
          <button
            onClick={toggleSidebar}
            className="navbar-component-mobile-toggle-btn"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button
            onClick={handleBackClick}
            className="navbar-component-back-navigation-btn"
            title="Retour"
          >
            <ArrowLeft size={20} />
          </button>

          <div
            className="navbar-component-brand-container"
            onClick={handleLogoClick}
          >
            <div className="navbar-component-logo-icon-wrapper">
              <span className="navbar-component-logo-text-content">IA</span>
            </div>
            <span className="navbar-component-app-title-text">IA Lab</span>
          </div>
        </div>

        <div
          className="navbar-component-account-profile-section"
          onClick={() => navigate("/compte")}
        >
          <User size={20} className="navbar-component-account-user-icon" />
          <span className="navbar-component-account-label-text">Compte</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
