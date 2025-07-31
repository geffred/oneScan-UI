import React, { useState, useContext } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../Config/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Nettoyage côté client
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      // Redirection vers la page de login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Fonctionnalités
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/#platforms"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Plateformes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/#process"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Comment ça marche
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Tarifs
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/support"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                Support
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
            <Link to="/dashboard/Platform" className="btn-signup">
              Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn-signup">
              Essai gratuit
            </Link>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <NavLink
            to="/#features"
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? " active" : ""}`
            }
            onClick={toggleMobileMenu}
          >
            Fonctionnalités
          </NavLink>
          <NavLink
            to="/#platforms"
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? " active" : ""}`
            }
            onClick={toggleMobileMenu}
          >
            Plateformes
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
                Connexion
              </Link>
            )}
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
