import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <span className="header-logo-text">IA</span>
          </div>
          <span className="header-brand">IA Lab</span>
        </Link>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <NavLink
                to="/#features"
                className="nav-link"
                activeClassName="active"
              >
                Fonctionnalités
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/#platforms"
                className="nav-link"
                activeClassName="active"
              >
                Plateformes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/#process"
                className="nav-link"
                activeClassName="active"
              >
                Comment ça marche
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pricing"
                className="nav-link"
                activeClassName="active"
              >
                Tarifs
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/support"
                className="nav-link"
                activeClassName="active"
              >
                Support
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="btn-login">
            Connexion
          </Link>
          <Link to="/register" className="btn-signup">
            Essai gratuit
          </Link>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <NavLink
            to="/#features"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Fonctionnalités
          </NavLink>
          <NavLink
            to="/#platforms"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Plateformes
          </NavLink>
          <NavLink
            to="/#process"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Comment ça marche
          </NavLink>
          <Link
            to="/pricing"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Tarifs
          </Link>
          <Link
            to="/support"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Support
          </Link>

          <div className="mobile-menu-actions">
            <Link
              to="/login"
              className="mobile-btn-login"
              onClick={toggleMobileMenu}
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="mobile-btn-signup"
              onClick={toggleMobileMenu}
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
