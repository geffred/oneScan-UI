import React from "react";
import { Building2, FileCheck, BrainCircuit, Zap } from "lucide-react";
import "./StatsSection.css";

const stats = [
  {
    id: 1,
    value: "50+",
    label: "Cabinets partenaires",
    icon: <Building2 size={24} />,
    delay: "0.1s",
  },
  {
    id: 2,
    value: "10k+",
    label: "Commandes traitées",
    icon: <FileCheck size={24} />,
    delay: "0.2s",
  },
  {
    id: 3,
    value: "98.5%",
    label: "Précision IA",
    icon: <BrainCircuit size={24} />,
    delay: "0.3s",
  },
  {
    id: 4,
    value: "92%",
    label: "Temps gagné",
    icon: <Zap size={24} />,
    delay: "0.4s",
  },
];

const StatsSection = () => (
  <section className="sts-section">
    {/* Background Pattern décoratif */}
    <div className="sts-bg-pattern"></div>

    <div className="sts-container">
      <div className="sts-grid">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="sts-card"
            style={{ animationDelay: stat.delay }}
          >
            <div className="sts-icon-wrapper">{stat.icon}</div>
            <div className="sts-content">
              <div className="sts-value">{stat.value}</div>
              <div className="sts-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
