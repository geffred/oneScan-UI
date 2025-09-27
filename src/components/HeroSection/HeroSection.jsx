import React from "react";
import { ArrowRight, Play, Bot } from "lucide-react";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDemo = () => {
    // Fonction pour gérer le clic sur le bouton de démo
    console.log("Voir la démo");
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-grid">
          <div className="hero-text">
            <h1>Révolutionnez votre laboratoire dentaire avec l'IA</h1>
            <p>
              Actuellement exclusif au laboratoire SmilelabOrtho, Mysmilelab
              centralise toutes vos commandes provenant de plateformes comme
              Itero, MeditLink, 3Shape et Dexis. Générez automatiquement vos
              bons de commande à partir d'un simple commentaire grâce à
              l'intelligence artificielle.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleLogin}>
                Connectez-vous <ArrowRight size={20} />
              </button>

              <button className="btn-secondary" onClick={handleDemo}>
                <Play size={20} /> Voir la démo
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-dashboard">
              <div className="dashboard-header">
                <div className="dashboard-icon">
                  <Bot size={24} />
                </div>
                <div>
                  <h3>Mysmilelab</h3>
                  <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    Gestion intelligente
                  </p>
                </div>
              </div>
              <div className="dashboard-stats">
                <div className="stat-item">
                  <div className="stat-number">1,247</div>
                  <div className="stat-label">Commandes traitées</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Précision IA</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4</div>
                  <div className="stat-label">Plateformes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">-75%</div>
                  <div className="stat-label">Temps gagné</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
