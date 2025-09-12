import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../Config/AuthContext";
import { Plus } from "lucide-react";
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

  return (
    <header className="header-base">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <span className="header-logo-text">s</span>
          </div>
          <span className="header-brand">
            <span className="lab">My</span>smilelab
          </span>
        </Link>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <NavLink
                to="/Appareils"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Appareils
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
              <HashLink
                smooth
                to="/#process"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Comment ça marche
              </HashLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Contact
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
            <Link to="/login" className="btn-login">
              Connexion
            </Link>
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
            <Link
              to="/contact"
              className="mobile-btn-signup"
              onClick={toggleMobileMenu}
            >
              <Plus size={16} style={{ marginRight: "6px" }} />
              Ajouter mon cabinet
            </Link>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <NavLink
            to="/Appareils"
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? " active" : ""}`
            }
            onClick={toggleMobileMenu}
          >
            Appareils
          </NavLink>
          <NavLink
            to="/suivi-commandes"
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? " active" : ""}`
            }
            onClick={toggleMobileMenu}
          >
            Suivi des commandes
          </NavLink>
          <NavLink
            to="/#process"
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? " active" : ""}`
            }
            onClick={toggleMobileMenu}
          >
            Comment ça marche
          </NavLink>
          {/*
              <Link
                  to="/pricing"
                  className="mobile-nav-link"
                  onClick={toggleMobileMenu}
                >
                Tarifs
              </Link>
              */}
          <Link
            to="/contact"
            className="mobile-nav-link"
            onClick={toggleMobileMenu}
          >
            Contact
          </Link>

          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="mobile-btn-login"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                to="/login"
                className="mobile-btn-login"
                onClick={toggleMobileMenu}
              >
                Se Connecter
              </Link>
            )}
            <Link
              to="/contact"
              className="mobile-btn-signup"
              onClick={toggleMobileMenu}
            >
              <Plus size={16} style={{ marginRight: "6px" }} />
              Ajouter mon cabinet
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
