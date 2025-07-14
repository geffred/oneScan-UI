import React from "react";
import { CheckCircle } from "lucide-react";
import "./PlatformsSection.css";

const PlatformsSection = () => (
  <section className="platforms-section">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">Plateformes intégrées</h2>
        <p className="section-subtitle">
          Connectez-vous à tous vos outils existants en un clic
        </p>
      </div>
      <div className="platforms-grid">
        <div className="platform-card">
          <div className="platform-logo">ITR</div>
          <h3 className="platform-name">Itero</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>
        <div className="platform-card">
          <div className="platform-logo">MDL</div>
          <h3 className="platform-name">MedditLink</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>
        <div className="platform-card">
          <div className="platform-logo">3S</div>
          <h3 className="platform-name">3Shape</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>
        <div className="platform-card">
          <div className="platform-logo">DXS</div>
          <h3 className="platform-name">Dexis Is Connect</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default PlatformsSection;
