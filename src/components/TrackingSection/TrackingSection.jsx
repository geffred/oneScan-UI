import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  PackageCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import "./TrackingSection.css";

// Données simulées pour le visuel du téléphone
const DEMO_STEPS = [
  {
    status: "done",
    label: "Commande reçue",
    time: "09:00",
    icon: <CheckCircle2 size={16} />,
  },
  {
    status: "done",
    label: "Fabrication terminée",
    time: "14:30",
    icon: <PackageCheck size={16} />,
  },
  {
    status: "active",
    label: "En cours de livraison",
    time: "En cours",
    icon: <Truck size={16} />,
  },
  {
    status: "pending",
    label: "Livraison Cabinet",
    time: "Est. 18:00",
    icon: <MapPin size={16} />,
  },
];

const TrackingSection = () => {
  return (
    <section className="ts-section">
      <div className="ts-container">
        {/* Partie Visuelle (Mockup iPhone) */}
        <div className="ts-visual-wrapper">
          <div className="ts-phone-mockup">
            <div className="ts-phone-notch"></div>
            <div className="ts-app-header">
              <span className="ts-app-title">Commande #892265</span>
              <span className="ts-live-badge">En direct</span>
            </div>

            <div className="ts-app-body">
              <div className="ts-map-placeholder">
                <div className="ts-map-route"></div>
                <div className="ts-map-marker"></div>
              </div>

              <div className="ts-timeline-card">
                <div className="ts-timeline-line"></div>
                {DEMO_STEPS.map((step, index) => (
                  <div key={index} className={`ts-step ${step.status}`}>
                    <div className="ts-step-icon">{step.icon}</div>
                    <div className="ts-step-content">
                      <span className="ts-step-label">{step.label}</span>
                      <span className="ts-step-time">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cercles décoratifs d'arrière-plan */}
          <div className="ts-blob ts-blob-1"></div>
          <div className="ts-blob ts-blob-2"></div>
        </div>

        {/* Partie Contenu Texte */}
        <div className="ts-content">
          <div className="ts-header">
            <div className="ts-badge">Temps réel</div>
            <h2 className="ts-title">Suivez vos commandes à la trace</h2>
            <p className="ts-subtitle">
              Fini l'incertitude. De la réception de l'empreinte à la livraison
              au cabinet, visualisez l'avancement de vos prothèses en temps
              réel.
            </p>
          </div>

          <div className="ts-features-grid">
            <div className="ts-feature">
              <div className="ts-feature-icon">
                <Search size={20} />
              </div>
              <div>
                <h3>Recherche Simple</h3>
                <p>Retrouvez tout via le n° de patient ou de commande.</p>
              </div>
            </div>

            <div className="ts-feature">
              <div className="ts-feature-icon">
                <Clock size={20} />
              </div>
              <div>
                <h3>Délais Garantis</h3>
                <p>Date de livraison estimée dès la validation.</p>
              </div>
            </div>

            <div className="ts-feature">
              <div className="ts-feature-icon">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3>Traçabilité Totale</h3>
                <p>Historique complet des étapes de fabrication.</p>
              </div>
            </div>
          </div>

          <div className="ts-action">
            <Link to="/suivi-commandes" className="ts-btn-primary">
              <Search size={18} />
              Accéder au suivi
              <ArrowRight size={18} className="ts-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
