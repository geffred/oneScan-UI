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
          <div className="platform-logo">
            <img
              src="https://lh4.googleusercontent.com/proxy/WXifjBIARWfpE0JjrLPqYzsI0xlrecyi6pURhnwGuJ9oToIKpU3Mj_R6eWg1fXwUrffxuTqX1vDC1OK92c_qCq1lXOqJ8kwMDZwTVO_d863OAZu3iMYlRqVibPSMTpmk6w"
              width={100}
              height={100}
              alt="Itero logo"
            />
          </div>
          <h3 className="platform-name">Itero</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>

        <div className="platform-card">
          <div className="platform-logo">
            <img
              src="https://www.medit.com/wp-content/uploads/2023/12/Medit-Link.png"
              alt="MeditLink logo"
              width={80}
              height={80}
            />
          </div>
          <h3 className="platform-name">MedditLink</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>

        <div className="platform-card">
          <div className="platform-logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwJz4SAclzjRyyLnHw747rJ4agBbMdPqJy8Ja9KxLVAH8ZYunh36CKH2QDIjhI2yhBbe4&usqp=CAU"
              alt="3Shape logo"
              width={100}
              height={100}
            />
          </div>
          <h3 className="platform-name">3Shape</h3>
          <span className="platform-status">
            <CheckCircle size={16} /> Connecté
          </span>
        </div>

        <div className="platform-card">
          <div className="platform-logo">
            <img
              src="https://static.stocktitan.net/company-logo/nvst-lg.webp"
              alt="Dexis logo"
              width={80}
              height={80}
              style={{ borderRadius: "12px" }}
            />
          </div>
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
