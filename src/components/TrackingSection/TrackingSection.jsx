import React from "react";
import { Search, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./TrackingSection.css";

const TrackingSection = () => {
  return (
    <section className="tracking-section">
      <div className="tracking-container">
        <div className="tracking-visual">
          <div className="tracking-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mockup-title">Suivi de commande</div>
            </div>
            <div className="mockup-content">
              <div className="mockup-search">
                <Search size={16} />
                <span>CMD123456</span>
              </div>
              <div className="mockup-status">
                <div className="status-step active">
                  <div className="status-dot"></div>
                  <span>En cours de fabrication</span>
                </div>
                <div className="status-step">
                  <div className="status-dot"></div>
                  <span>Contrôle qualité</span>
                </div>
                <div className="status-step">
                  <div className="status-dot"></div>
                  <span>Expédition</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tracking-content">
          <div className="tracking-header">
            <h2 className="tracking-title">Suivez votre commande MySmileLab</h2>
            <p className="tracking-subtitle">
              Consultez l'état d'avancement de votre appareil dentaire en temps
              réel. De la réception à la livraison, restez informé à chaque
              étape.
            </p>
          </div>

          <div className="tracking-features">
            <div className="tracking-feature">
              <div className="feature-icon">
                <Search size={24} />
              </div>
              <h3>Recherche instantanée</h3>
              <p>Trouvez votre commande avec votre numéro de suivi</p>
            </div>
            <div className="tracking-feature">
              <div className="feature-icon">
                <div className="pulse-dot"></div>
              </div>
              <h3>Suivi en temps réel</h3>
              <p>Mises à jour automatiques du statut de fabrication</p>
            </div>
          </div>

          <div className="tracking-cta">
            <Link to="/suivi-commandes" className="tracking-button">
              <Search className="tracking-button-icon" size={20} />
              <span>Suivre ma commande</span>
              <ArrowRight className="tracking-button-arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
