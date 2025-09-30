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
              <NavLink
                to="/Appareils"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Nos appareils
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/suivi-commandes"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Suivi des commandes
              </NavLink>
            </li>
            <li className="lien">
              <HashLink smooth to="/#process" className="nav-link">
                Guide d'utilisation
              </HashLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Nous contacter
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `btn-login${isActive ? " active" : ""}`
              }
            >
              Connexion
            </NavLink>
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
            <NavLink
              to="/cabinet/register"
              className={({ isActive }) =>
                `btn-signup${isActive ? " active" : ""}`
              }
            >
              Inscription
            </NavLink>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <NavLink
            to="/Appareils"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nos Appareils
          </NavLink>
          <NavLink
            to="/suivi-commandes"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Suivi des commandes
          </NavLink>
          <HashLink
            smooth
            to="/#process"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Guide d'utilisation
          </HashLink>
          <NavLink
            to="/contact"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nous contacter
          </NavLink>

          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-logout">
                Déconnexion
              </button>
            ) : (
              <NavLink
                to="/login"
                className="btn-login"
                onClick={closeMobileMenu}
              >
                Connexion
              </NavLink>
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
                onClick={closeMobileMenu}
              >
                {userType === "cabinet" ? "Mon Compte" : "Dashboard"}
              </Link>
            ) : (
              <NavLink
                to="/cabinet/register"
                className="btn-signup"
                onClick={closeMobileMenu}
              >
                Inscription
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
