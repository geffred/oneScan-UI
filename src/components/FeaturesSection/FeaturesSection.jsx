import { Workflow, Bot, Scan, BarChart3, Shield, Zap } from "lucide-react";
import "./FeaturesSection.css";

const FeaturesSection = () => (
  <section className="features-section">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">Fonctionnalités intelligentes</h2>
        <p className="section-subtitle">
          Découvrez comment IA Lab transforme votre flux de travail quotidien
        </p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Workflow size={28} />
          </div>
          <h3 className="feature-title">Centralisation des commandes</h3>
          <p className="feature-description">
            Récupérez automatiquement toutes vos commandes depuis Itero,
            MedditLink, 3Shape et Dexis sur une interface unique.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Bot size={28} />
          </div>
          <h3 className="feature-title">IA générative</h3>
          <p className="feature-description">
            Génération automatique de bons de commande intelligents basés sur
            l'analyse des données de scan et l'historique patient.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Scan size={28} />
          </div>
          <h3 className="feature-title">Socles automatisés ( à venir )</h3>
          <p className="feature-description">
            Création automatique de socles dentaires optimisés à partir de vos
            scans intra-oraux avec précision millimétrique.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <BarChart3 size={28} />
          </div>
          <h3 className="feature-title">Analytics avancés</h3>
          <p className="feature-description">
            Tableaux de bord en temps réel pour suivre vos performances, délais
            de production et satisfaction client.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Shield size={28} />
          </div>
          <h3 className="feature-title">Sécurité médicale</h3>
          <p className="feature-description">
            Conformité HIPAA et chiffrement de bout en bout pour protéger les
            données sensibles de vos patients.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Zap size={28} />
          </div>
          <h3 className="feature-title">Traitement rapide</h3>
          <p className="feature-description">
            Réduction de 75% du temps de traitement grâce à l'automatisation
            intelligente des processus répétitifs.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
