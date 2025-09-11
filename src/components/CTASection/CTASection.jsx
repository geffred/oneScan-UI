import React from "react";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
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
          <Link to="/contact" className="btn-secondary btn-large">
            <MessageSquare size={20} /> Contacter un expert
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
