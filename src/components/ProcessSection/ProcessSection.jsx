import React from "react";
import { Download, Bot, FileText, CheckCircle } from "lucide-react";
import "./ProcessSection.css";

const ProcessSection = () => (
  <section className="process-section">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">Comment ça fonctionne</h2>
        <p className="section-subtitle">
          Un processus simplifié en 4 étapes pour maximiser votre efficacité
        </p>
      </div>
      <div className="process-grid">
        <div className="process-step">
          <div className="step-number">1</div>
          <div className="process-icon">
            <Download size={28} />
          </div>
          <h3 className="process-title">Réception automatique</h3>
          <p className="process-description">
            Les commandes arrivent automatiquement depuis vos plateformes
            connectées
          </p>
        </div>
        <div className="process-step">
          <div className="step-number">2</div>
          <div className="process-icon">
            <Bot size={28} />
          </div>
          <h3 className="process-title">Analyse IA</h3>
          <p className="process-description">
            L'IA analyse les scans et génère les spécifications optimales
          </p>
        </div>
        <div className="process-step">
          <div className="step-number">3</div>
          <div className="process-icon">
            <FileText size={28} />
          </div>
          <h3 className="process-title">Génération automatique</h3>
          <p className="process-description">
            Création des bons de commande et socles dentaires personnalisés
          </p>
        </div>
        <div className="process-step">
          <div className="step-number">4</div>
          <div className="process-icon">
            <CheckCircle size={28} />
          </div>
          <h3 className="process-title">Validation et production</h3>
          <p className="process-description">
            Validation rapide et lancement de la production optimisée
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default ProcessSection;
