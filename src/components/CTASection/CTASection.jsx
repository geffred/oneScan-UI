import React from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import "./CTASection.css";

const CTASection = () => (
  <section className="cta-section">
    <div className="container">
      <div className="cta-content">
        <h2 className="cta-title">Prêt à transformer votre laboratoire ?</h2>
        <p className="cta-description">
          Rejoignez les centaines de laboratoires dentaires qui ont déjà adopté
          Mysmilelab pour optimiser leur production.
        </p>
        <div className="cta-buttons">
          <button className="btn-primary btn-large">
            Commencer maintenant <ArrowRight size={20} />
          </button>
          <button className="btn-secondary btn-large">
            <MessageSquare size={20} /> Contacter un expert
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
