import React from "react";
import { MessageSquare } from "lucide-react";
import { HashLink } from "react-router-hash-link";
import "./CTASection.css";

const CTASection = () => (
  <section className="cta-section">
    <div className="container">
      <div className="cta-content">
        <h2 className="cta-title">Prêt à transformer votre laboratoire ?</h2>
        <p className="cta-description">
          Rejoignez les dizaines de laboratoires dentaires qui commandent via
          Mysmilelab chez Smilelab Ortho.
        </p>
        <div className="cta-buttons">
          <HashLink
            smooth
            to="/contact#header-contact"
            className="btn-secondary btn-large"
          >
            <MessageSquare size={20} /> Contacter un expert
          </HashLink>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
