import React from "react";
import "./StatsSection.css";

const StatsSection = () => (
  <section className="stats-section">
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">50+</div>
          <div className="stat-text">Laboratoires partenaires</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">1k+</div>
          <div className="stat-text">Commandes traitées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">98.5%</div>
          <div className="stat-text">Précision IA</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">75%</div>
          <div className="stat-text">Temps gagné</div>
        </div>
      </div>
    </div>
  </section>
);

export default StatsSection;
