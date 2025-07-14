/* eslint-disable react/prop-types */
import { Menu, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-custom-content">
        <div className="navbar-custom-left">
          <button
            onClick={toggleSidebar}
            className="navbar-custom-mobile-menu-btn"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div
            className="navbar-custom-logo-container"
            onClick={handleLogoClick}
          >
            <div className="navbar-custom-logo-icon">
              <span className="navbar-custom-logo-text">IA</span>
            </div>
            <span className="navbar-custom-app-title">IA Lab</span>
          </div>
        </div>

        <div className="navbar-custom-account-section">
          <User size={20} className="navbar-custom-account-icon" />
          <span className="navbar-custom-account-text">Compte</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
