/* eslint-disable react/prop-types */
import { Menu, X, User } from "lucide-react";
import "./navbar.css";

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button onClick={toggleSidebar} className="mobile-menu-btn">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="logo-container">
            <div className="logo-icon">
              <span className="logo-text">OS</span>
            </div>
            <span className="app-title">OneScaN</span>
          </div>
        </div>

        <div className="account-section">
          <User size={20} className="account-icon" />
          <span className="account-text">Compte</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
