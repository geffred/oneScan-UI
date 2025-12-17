import React from "react";
import { CheckCircle2 } from "lucide-react"; // J'utilise CheckCircle2 pour un look plus moderne
import "./PlatformsSection.css";

const platforms = [
  {
    id: 1,
    name: "Itero",
    logo: "https://lh3.googleusercontent.com/d/123...placeholder", // Remplace par tes vrais assets locaux si possible
    // Note: J'utilise une image placeholder générique pour l'exemple si les liens cassent
    fallbackText: "IT",
    src: "https://lh4.googleusercontent.com/proxy/WXifjBIARWfpE0JjrLPqYzsI0xlrecyi6pURhnwGuJ9oToIKpU3Mj_R6eWg1fXwUrffxuTqX1vDC1OK92c_qCq1lXOqJ8kwMDZwTVO_d863OAZu3iMYlRqVibPSMTpmk6w",
  },
  {
    id: 2,
    name: "Medit Link",
    src: "https://www.medit.com/wp-content/uploads/2023/12/Medit-Link.png",
  },
  {
    id: 3,
    name: "3Shape",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwJz4SAclzjRyyLnHw747rJ4agBbMdPqJy8Ja9KxLVAH8ZYunh36CKH2QDIjhI2yhBbe4&usqp=CAU",
  },
  {
    id: 4,
    name: "Dexis IS Connect",
    src: "https://static.stocktitan.net/company-logo/nvst-lg.webp",
  },
];

const PlatformsSection = () => (
  <section className="ip-section">
    <div className="ip-container">
      <div className="ip-header">
        <h2 className="ip-title">Plateformes intégrées</h2>
        <p className="ip-subtitle">
          Centralisez vos flux de travail. Connectez vos scanners et logiciels
          préférés en un clic.
        </p>
      </div>

      <div className="ip-grid">
        {platforms.map((platform) => (
          <div key={platform.id} className="ip-card">
            <div className="ip-card-content">
              <div className="ip-logo-wrapper">
                <img
                  src={platform.src}
                  alt={`Logo ${platform.name}`}
                  className="ip-logo-img"
                  loading="lazy"
                />
              </div>
              <h3 className="ip-name">{platform.name}</h3>
              <div className="ip-status">
                <CheckCircle2 size={14} strokeWidth={3} />
                <span>Connecté</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PlatformsSection;
