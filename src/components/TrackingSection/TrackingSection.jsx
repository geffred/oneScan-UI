import React, { useState } from "react";
import {
  Search,
  Clock,
  Settings,
  CheckCircle2,
  Truck,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./TrackingSection.css";

const ETAPES_SUIVI = [
  { status: "EN_ATTENTE", label: "En attente", color: "#3b82f6", icon: Clock },
  {
    status: "EN_COURS",
    label: "En cours de fabrication",
    color: "#3b82f6",
    icon: Settings,
  },
  {
    status: "TERMINEE",
    label: "Contrôle qualité",
    color: "#3b82f6",
    icon: CheckCircle2,
  },
  { status: "EXPEDIEE", label: "Expédition", color: "#3b82f6", icon: Truck },
];

const TrackingSection = () => {
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const navigate = useNavigate();

  const handleFollow = () => {
    if (numeroSuivi.trim()) {
      navigate(`/suivi-commandes?numero=${numeroSuivi.trim()}`);
    }
  };

  return (
    <section className="tracking-section">
      <div className="tracking-container">
        {/* Visual mockup */}
        <div className="tracking-visual">
          <div className="tracking-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mockup-title">Suivi de commande</div>
            </div>
            <div className="mockup-content">
              <div className="mockup-search">
                <Search size={16} />
                892265
              </div>
              <div className="mockup-status">
                {ETAPES_SUIVI.map((etape, index) => (
                  <div
                    key={index}
                    className={`status-step ${index === 1 ? "active" : ""}`}
                  >
                    <div
                      className="status-dot"
                      style={{ backgroundColor: etape.color }}
                    />
                    <span>{etape.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="tracking-content">
          <div className="tracking-header">
            <h2 className="tracking-title">Suivez votre commande MySmileLab</h2>
            <p className="tracking-subtitle">
              Consultez l'état d'avancement de votre appareil dentaire en temps
              réel. De la réception à la livraison, restez informé à chaque
              étape.
            </p>
          </div>

          <div className="tracking-features">
            <div className="tracking-feature">
              <div className="feature-icon">
                <Search size={24} />
              </div>
              <h3>Recherche instantanée</h3>
              <p>Trouvez votre commande avec votre numéro de suivi</p>
            </div>

            <div className="tracking-feature">
              <div className="feature-icon">
                <div className="pulse-dot"></div>
              </div>
              <h3>Suivi en temps réel</h3>
              <p>Mises à jour automatiques du statut de fabrication</p>
            </div>

            <div className="tracking-feature">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3>Notification à la réception</h3>
              <p>
                Recevez une alerte dès que votre commande est reçue par le
                laboratoire
              </p>
            </div>

            <div className="tracking-feature">
              <div className="feature-icon">
                <CheckCircle2 size={24} />
              </div>
              <h3>Contrôle qualité garanti</h3>
              <p>
                Suivez les vérifications et validations de vos appareils à
                chaque étape
              </p>
            </div>
          </div>

          <div className="tracking-cta">
            <Link to="/suivi-commandes" className="tracking-button">
              <Search className="tracking-button-icon" size={20} />
              <span>Suivre ma commande</span>
              <ArrowRight className="tracking-button-arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
