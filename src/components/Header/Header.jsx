import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../Config/AuthContext";
import { HashLink } from "react-router-hash-link";

// Composant wrapper pour résoudre le warning
const CustomHashLink = ({
  to,
  children,
  className,
  activeClassName,
  ...props
}) => {
  return (
    <HashLink
      to={to}
      {...props}
      className={typeof className === "function" ? undefined : className}
    >
      {children}
    </HashLink>
  );
};

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
        <CustomHashLink smooth to="/#home" className="header-logo">
          <div className="header-logo-icon">
            <span className="header-logo-text">s</span>
          </div>
          <span className="header-brand">
            <span className="lab">My</span>smilelab
          </span>
        </CustomHashLink>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <CustomHashLink
                smooth
                to="/Appareils#header-appareils"
                className="nav-link"
              >
                Nos appareils
              </CustomHashLink>
            </li>
            <li>
              <CustomHashLink
                smooth
                to="/suivi-commandes#suivi-header"
                className="nav-link"
              >
                Suivi des commandes
              </CustomHashLink>
            </li>
            <li className="lien">
              <CustomHashLink smooth to="/#process" className="nav-link">
                Guide d'utilisation
              </CustomHashLink>
            </li>
            <li>
              <CustomHashLink
                smooth
                to="/contact#header-contact"
                className="nav-link"
              >
                Nous contacter
              </CustomHashLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          ) : (
            <CustomHashLink
              smooth
              to="/login#header-login"
              className="btn-login"
            >
              Connexion
            </CustomHashLink>
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
            <CustomHashLink
              smooth
              to="/cabinet/register#header-register"
              className="btn-signup"
            >
              Inscription
            </CustomHashLink>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <CustomHashLink
            smooth
            to="/Appareils#header-appareils"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nos Appareils
          </CustomHashLink>
          <CustomHashLink
            smooth
            id="suivi-header"
            to="/suivi-commandes#suivi-header"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Suivi des commandes
          </CustomHashLink>
          <CustomHashLink
            smooth
            to="/#process"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Guide d'utilisation
          </CustomHashLink>
          <CustomHashLink
            smooth
            to="/contact#header-contact"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            Nous contacter
          </CustomHashLink>

          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-logout">
                Déconnexion
              </button>
            ) : (
              <CustomHashLink
                smooth
                to="/login#header-login"
                className="btn-login"
              >
                Connexion
              </CustomHashLink>
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
              <CustomHashLink
                smooth
                to="/cabinet/register#header-register"
                className="btn-signup"
              >
                Inscription
              </CustomHashLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
