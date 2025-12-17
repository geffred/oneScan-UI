import React from "react";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { HashLink } from "react-router-hash-link";
import "./CTASection.css";

const CTASection = () => (
  <section className="cts-section">
    <div className="cts-container">
      <div className="cts-card">
        {/* Décoration d'arrière-plan */}
        <div className="cts-blob cts-blob-left"></div>
        <div className="cts-blob cts-blob-right"></div>

        <div className="cts-content">
          <h2 className="cts-title">
            Prêt à transformer votre <br />
            <span className="cts-highlight">flux de travail ?</span>
          </h2>

          <p className="cts-description">
            Rejoignez les cabinets dentaires et laboratoires qui ont choisi
            l'excellence. Simplifiez vos commandes dès aujourd'hui avec
            MySmileLab.
          </p>

          <div className="cts-actions">
            <HashLink
              smooth
              to="/contact#header-contact"
              className="cts-btn-primary"
            >
              <MessageSquare size={20} />
              <span>Contacter un expert</span>
              <ArrowRight size={18} className="cts-arrow" />
            </HashLink>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
