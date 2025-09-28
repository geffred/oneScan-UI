import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../Config/AuthContext";
import { HashLink } from "react-router-hash-link";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, userType, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header-base" id="header">
      <div className="header-content">
        <HashLink smooth to="/#home" className="header-logo">
          <div className="header-logo-icon">
            <span className="header-logo-text">s</span>
          </div>
          <span className="header-brand">
            <span className="lab">My</span>smilelab
          </span>
        </HashLink>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <HashLink
                smooth
                to="/Appareils#header-appareils"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Nos appareils
              </HashLink>
            </li>
            <li>
              <HashLink
                smooth
                to="/suivi-commandes#suivi-header"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Suivi des commandes
              </HashLink>
            </li>
            <li className="lien">
              <HashLink
                smooth
                to="/#process"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Guide d'utilisation
              </HashLink>
            </li>
            <li>
              <HashLink
                smooth
                to="/contact#header-contact"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Nous contacter
              </HashLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          ) : (
            <HashLink smooth to="/login#header-login" className="btn-login">
              Connexion
            </HashLink>
          )}

          {isAuthenticated ? (
            <Link
              to={
                userType === "cabinet"
                  ? "/compte/cabinet"
                  : "/dashboard/Platform"
              }
              className="btn-signup"
            >
              {userType === "cabinet" ? "Mon Compte" : "Dashboard"}
            </Link>
          ) : (
            <HashLink
              smooth
              to="/cabinet/register#header-register"
              className="btn-signup" // Changé de mobile-btn-signup à btn-signup
            >
              Inscription
            </HashLink>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <HashLink
            smooth
            to="/Appareils#header-appareils"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nos Appareils
          </HashLink>
          <HashLink
            smooth
            id="suivi-header"
            to="/suivi-commandes#suivi-header"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Suivi des commandes
          </HashLink>
          <HashLink
            smooth
            to="/#process"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Guide d'utilisation
          </HashLink>
          <HashLink
            smooth
            to="/contact#header-contact"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nous contacter
          </HashLink>

          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-logout">
                Déconnexion
              </button>
            ) : (
              <HashLink smooth to="/login#header-login" className="btn-login">
                Connexion
              </HashLink>
            )}

            {isAuthenticated ? (
              <Link
                style={{ textAlign: "center" }}
                to={
                  userType === "cabinet"
                    ? "/compte/cabinet"
                    : "/dashboard/Platform"
                }
                className="btn-signup"
              >
                {userType === "cabinet" ? "Mon Compte" : "Dashboard"}
              </Link>
            ) : (
              <HashLink
                smooth
                to="/cabinet/register#header-register"
                className="btn-signup" // Changé de mobile-btn-signup à btn-signup
              >
                Inscription
              </HashLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
