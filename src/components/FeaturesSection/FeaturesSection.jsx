import { Workflow, Bot, Scan, BarChart3, Shield, Zap } from "lucide-react";
import "./FeaturesSection.css";

const FeaturesSection = () => (
  <section className="features-unique-section">
    <div className="features-content-container">
      <div className="features-header-wrapper">
        <h2 className="features-main-title">Fonctionnalités intelligentes</h2>
        <p className="features-main-subtitle">
          Découvrez comment IA Lab transforme votre flux de travail quotidien
        </p>
      </div>
      <div className="features-grid-layout">
        <div className="features-item-card">
          <div className="features-item-icon">
            <Workflow size={28} />
          </div>
          <h3 className="features-item-title">Centralisation des commandes</h3>
          <p className="features-item-description">
            Récupérez automatiquement toutes vos commandes depuis Itero,
            MedditLink, 3Shape et Dexis sur une interface unique.
          </p>
        </div>
        <div className="features-item-card">
          <div className="features-item-icon">
            <Bot size={28} />
          </div>
          <h3 className="features-item-title">IA générative</h3>
          <p className="features-item-description">
            Génération automatique de bons de commande intelligents basés sur
            l'analyse des données de scan et l'historique patient.
          </p>
        </div>
        <div className="features-item-card">
          <div className="features-item-icon">
            <Scan size={28} />
          </div>
          <h3 className="features-item-title">
            Socles automatisés ( à venir )
          </h3>
          <p className="features-item-description">
            Création automatique de socles dentaires optimisés à partir de vos
            scans intra-oraux avec précision millimétrique.
          </p>
        </div>
        <div className="features-item-card">
          <div className="features-item-icon">
            <BarChart3 size={28} />
          </div>
          <h3 className="features-item-title">Analytics avancés</h3>
          <p className="features-item-description">
            Tableaux de bord en temps réel pour suivre vos performances, délais
            de production et satisfaction client.
          </p>
        </div>
        <div className="features-item-card">
          <div className="features-item-icon">
            <Shield size={28} />
          </div>
          <h3 className="features-item-title">Sécurité médicale</h3>
          <p className="features-item-description">
            Conformité HIPAA et chiffrement de bout en bout pour protéger les
            données sensibles de vos patients.
          </p>
        </div>
        <div className="features-item-card">
          <div className="features-item-icon">
            <Zap size={28} />
          </div>
          <h3 className="features-item-title">Traitement rapide</h3>
          <p className="features-item-description">
            Réduction de 75% du temps de traitement grâce à l'automatisation
            intelligente des processus répétitifs.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
