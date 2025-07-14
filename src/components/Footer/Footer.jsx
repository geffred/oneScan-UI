import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <span className="footer-logo-text">IA</span>
            </div>
            <span className="footer-brand-name">IA Lab</span>
          </div>
          <p className="footer-description">
            La plateforme IA révolutionnaire pour laboratoires dentaires.
            Centralisez, automatisez et optimisez votre production avec
            l'intelligence artificielle.
          </p>
          <div className="footer-contact">
            <div className="contact-item">
              <Mail size={18} />
              <span>contact@ia-lab.be</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+32 0 493 35 73 28</span>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Soignies, Belgique</span>
            </div>
          </div>
          <div className="social-links">
            <a href="#" className="social-link">
              <Facebook size={20} />
            </a>
            <a href="#" className="social-link">
              <Twitter size={20} />
            </a>
            <a href="#" className="social-link">
              <Linkedin size={20} />
            </a>
            <a href="#" className="social-link">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Produit</h4>
          <ul className="footer-links">
            <li>
              <a href="#" className="footer-link">
                Fonctionnalités
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Intégrations
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                API
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Sécurité
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Tarifs
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Entreprise</h4>
          <ul className="footer-links">
            <li>
              <a href="#" className="footer-link">
                À propos
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Carrières
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Presse
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Partenaires
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li>
              <a href="#" className="footer-link">
                Centre d'aide
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Formation
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Communauté
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Status
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          © {new Date().getFullYear()} IA Lab. Tous droits réservés.
        </div>
        <div className="footer-legal">
          <a href="#" className="legal-link">
            Politique de confidentialité
          </a>
          <a href="#" className="legal-link">
            Conditions d'utilisation
          </a>
          <a href="#" className="legal-link">
            Cookies
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
