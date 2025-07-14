import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <a href="#" className="header-logo">
          <div className="header-logo-icon">
            <span className="header-logo-text">IA</span>
          </div>
          <span className="header-brand">IA Lab</span>
        </a>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <a href="#features" className="nav-link">
                Fonctionnalités
              </a>
            </li>
            <li>
              <a href="#platforms" className="nav-link">
                Plateformes
              </a>
            </li>
            <li>
              <a href="#process" className="nav-link">
                Comment ça marche
              </a>
            </li>
            <li>
              <a href="#pricing" className="nav-link">
                Tarifs
              </a>
            </li>
            <li>
              <a href="#support" className="nav-link">
                Support
              </a>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <a href="#login" className="btn-login">
            Connexion
          </a>
          <a href="#signup" className="btn-signup">
            Essai gratuit
          </a>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <a href="#features" className="mobile-nav-link">
            Fonctionnalités
          </a>
          <a href="#platforms" className="mobile-nav-link">
            Plateformes
          </a>
          <a href="#process" className="mobile-nav-link">
            Comment ça marche
          </a>
          <a href="#pricing" className="mobile-nav-link">
            Tarifs
          </a>
          <a href="#support" className="mobile-nav-link">
            Support
          </a>
          <a href="#login" className="mobile-nav-link">
            Connexion
          </a>
          <a href="#signup" className="mobile-nav-link">
            Essai gratuit
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
