import React, { useState } from "react";
import {
  UserPlus,
  Send,
  Download,
  Bot,
  Bell,
  CheckCircle,
  Truck,
  MessageCircle,
  Phone,
  Mail,
  AlertCircle,
  LogIn,
  ClipboardList,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MousePointerClick, // Nouvel icône pour le clic
} from "lucide-react";
import "./ProcessSection.css";

// --- DONNÉES DU PROCESSUS (Mise à jour de l'étape 1) ---
const processSteps = [
  {
    id: 1,
    title: "Création de compte",
    summary: "Inscrivez-vous directement en ligne",
    icon: <UserPlus size={24} />,
    details: (
      <>
        <p>Pour commencer, créez votre compte cabinet dentaire :</p>
        <ul className="ps-list">
          <li>
            Cliquez sur le bouton <strong>"Inscription"</strong> situé en haut à
            droite du site.
          </li>
          <li>Remplissez le formulaire d'adhésion simplifié.</li>
          <li>Réception de vos identifiants par email sous 24h.</li>
        </ul>
        <div className="ps-alert ps-alert-info">
          <AlertCircle size={18} />
          <span>
            Votre nom de compte doit correspondre à celui de votre scanner
            (Itero, Medit, etc.).
          </span>
        </div>
      </>
    ),
  },
  {
    id: 2,
    title: "Passation de commande",
    summary: "Envoyez votre commande via votre scanner",
    icon: <Send size={24} />,
    details: (
      <>
        <p>
          Envoyez vos empreintes via votre plateforme habituelle (Itero,
          MeditLink, Dexis...).
        </p>
        <p>
          <strong>Dans le commentaire, précisez impérativement :</strong>
        </p>
        <ul className="ps-list">
          <li>Détails de l'appareil (type, matériaux)</li>
          <li>Date de livraison souhaitée (si urgent)</li>
          <li>Adresse spécifique si différente du cabinet</li>
        </ul>
        <div className="ps-alert ps-alert-warning">
          <AlertCircle size={18} />
          <span>
            Seules les commandes avec un commentaire complet seront traitées.
          </span>
        </div>
      </>
    ),
  },
  {
    id: 3,
    title: "Réception automatique",
    summary: "Import et sécurisation des données",
    icon: <Download size={24} />,
    details: (
      <>
        <p>Notre système détecte automatiquement votre envoi.</p>
        <ul className="ps-list">
          <li>Import automatique depuis le cloud du scanner</li>
          <li>Vérification de l'intégrité des fichiers 3D</li>
          <li>Attribution d'un numéro de suivi unique</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    title: "Analyse IA & Génération",
    summary: "Traitement intelligent de votre demande",
    icon: <Bot size={24} />,
    details: (
      <>
        <p>
          Notre IA analyse votre commentaire pour générer le bon de production.
        </p>
        <ul className="ps-list">
          <li>Extraction des spécifications techniques</li>
          <li>Détection automatique des demandes "URGENT"</li>
          <li>Génération du bon de commande interne</li>
        </ul>
      </>
    ),
  },
  {
    id: 5,
    title: "Notification & Suivi",
    summary: "Vous restez informé à chaque étape",
    icon: <Bell size={24} />,
    details: (
      <>
        <p>Vous recevez un email de confirmation complet incluant :</p>
        <ul className="ps-list">
          <li>Récapitulatif technique</li>
          <li>Lien de tracking en temps réel</li>
          <li>Date estimée de livraison</li>
        </ul>
      </>
    ),
  },
  {
    id: 6,
    title: "Production",
    summary: "Fabrication sur-mesure et contrôle qualité",
    icon: <CheckCircle size={24} />,
    details: (
      <>
        <p>Votre appareil entre en fabrication après validation technique.</p>
        <ul className="ps-list">
          <li>Impression 3D / Usinage / Finition manuelle</li>
          <li>Double contrôle qualité avant emballage</li>
          <li>Respect strict des délais annoncés</li>
        </ul>
      </>
    ),
  },
  {
    id: 7,
    title: "Expédition",
    summary: "Livraison rapide à votre cabinet",
    icon: <Truck size={24} />,
    details: (
      <>
        <p>Votre commande est expédiée avec soin.</p>
        <ul className="ps-list">
          <li>Emballage sécurisé antichoc</li>
          <li>Notification d'expédition</li>
          <li>Livraison express disponible</li>
        </ul>
      </>
    ),
  },
];

// --- DONNÉES SUPPORT ---
const supportOptions = [
  {
    icon: <Phone size={28} />,
    title: "Téléphone",
    desc: "Parlez à un expert",
    contact: "+32 0 493 35 73 28",
    sub: "Lun-Ven, 9h-18h",
  },
  {
    icon: <Mail size={28} />,
    title: "Email",
    desc: "Réponse sous 24h",
    contact: "contact@smilelabortho.be",
    sub: "Pour les demandes non-urgentes",
  },
  {
    icon: <MessageCircle size={28} />,
    title: "WhatsApp",
    desc: "Chat direct",
    contact: "Disponible",
    sub: "Réponse rapide",
  },
];

const faqs = [
  {
    q: "Que dois-je inclure dans le commentaire ?",
    a: "Précisez le type d'appareil, les matériaux, les spécificités techniques et la date de livraison souhaitée.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Un lien de tracking vous est envoyé par email dès la validation de la commande par notre système.",
  },
  {
    q: "Gérez-vous les urgences ?",
    a: "Oui. Inscrivez 'URGENT' et la date limite dans le commentaire. Nous confirmerons la faisabilité rapidement.",
  },
];

const ProcessSection = () => {
  const [activeTab, setActiveTab] = useState("process");
  const [expandedStep, setExpandedStep] = useState(1);

  const toggleStep = (id) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  // Fonction utilitaire pour scroller vers le haut (si le bouton inscription est dans le header)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="ps-section" id="process">
      <div className="ps-container">
        {/* HEADER */}
        <div className="ps-header">
          <h2 className="ps-title">Votre parcours simplifié</h2>
          <p className="ps-subtitle">
            De l'envoi de l'empreinte à la livraison, nous avons optimisé chaque
            étape pour vous faire gagner du temps.
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div className="ps-tabs-wrapper">
          <div className="ps-tabs">
            <button
              className={`ps-tab-btn ${
                activeTab === "process" ? "active" : ""
              }`}
              onClick={() => setActiveTab("process")}
            >
              <ClipboardList size={18} /> Processus
            </button>
            <button
              className={`ps-tab-btn ${
                activeTab === "account" ? "active" : ""
              }`}
              onClick={() => setActiveTab("account")}
            >
              <UserPlus size={18} /> Compte
            </button>
            <button
              className={`ps-tab-btn ${
                activeTab === "support" ? "active" : ""
              }`}
              onClick={() => setActiveTab("support")}
            >
              <HelpCircle size={18} /> Support
            </button>
          </div>
        </div>

        {/* CONTENT: PROCESS TIMELINE */}
        {activeTab === "process" && (
          <div className="ps-content-wrapper">
            <div className="ps-timeline">
              <div className="ps-timeline-line"></div>
              {processSteps.map((step) => (
                <div
                  key={step.id}
                  className={`ps-step-item ${
                    expandedStep === step.id ? "expanded" : ""
                  }`}
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="ps-step-marker">
                    {expandedStep === step.id ? (
                      <ChevronDown size={20} />
                    ) : (
                      <span className="ps-step-num">{step.id}</span>
                    )}
                  </div>
                  <div className="ps-step-card">
                    <div className="ps-step-header">
                      <div className="ps-step-icon-box">{step.icon}</div>
                      <div className="ps-step-titles">
                        <h3>{step.title}</h3>
                        <p>{step.summary}</p>
                      </div>
                      <div className="ps-step-toggle">
                        {expandedStep === step.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                    <div className="ps-step-body">
                      <div className="ps-step-content">{step.details}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT: ACCOUNT (PARTIE MISE À JOUR) */}
        {activeTab === "account" && (
          <div className="ps-content-wrapper ps-account-layout">
            {/* OPTION 1 : INSCRIPTION (Mise en avant) */}
            <div className="ps-account-card ps-highlight">
              <div className="ps-account-icon">
                <MousePointerClick size={24} />
              </div>
              <div className="ps-account-info">
                <h4>Option 1 : Inscription Directe (Recommandé)</h4>
                <p>
                  Cliquez simplement sur le bouton{" "}
                  <strong>"Inscription"</strong> situé dans la barre de menu en
                  haut de l'écran.
                </p>
                <button className="ps-btn-simulated" onClick={scrollToTop}>
                  Voir le bouton en haut de page
                </button>
              </div>
            </div>

            {/* OPTION 2 : TELEPHONE */}
            <div className="ps-account-card">
              <div className="ps-account-icon">
                <Phone size={24} />
              </div>
              <div className="ps-account-info">
                <h4>Option 2 : Par Téléphone</h4>
                <p>
                  Vous préférez un contact humain ? Appelez le{" "}
                  <a href="tel:+320493357328" className="ps-link">
                    +32 0 493 35 73 28
                  </a>
                  .
                </p>
                <div className="ps-meta">
                  <Clock size={14} /> Lun-Ven, 9h-18h
                </div>
              </div>
            </div>

            <div className="ps-info-block">
              <h3>
                <ShieldCheck size={20} /> Validation & Activation
              </h3>
              <p>
                Une fois votre inscription envoyée, vous recevrez sous 24h :
              </p>
              <ul className="ps-list">
                <li>Vos identifiants provisoires</li>
                <li>Le guide de démarrage</li>
                <li>L'accès au portail client</li>
              </ul>
              <div className="ps-alert ps-alert-info">
                <LogIn size={18} />
                <span>
                  Pensez à modifier votre mot de passe lors de la première
                  connexion.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT: SUPPORT */}
        {activeTab === "support" && (
          <div className="ps-content-wrapper">
            <div className="ps-support-grid">
              {supportOptions.map((opt, index) => (
                <div key={index} className="ps-support-card">
                  <div className="ps-support-icon">{opt.icon}</div>
                  <h4>{opt.title}</h4>
                  <p>{opt.desc}</p>
                  <div className="ps-contact-big">{opt.contact}</div>
                  <span className="ps-contact-sub">{opt.sub}</span>
                </div>
              ))}
            </div>

            <div className="ps-faq-section">
              <h3 className="ps-faq-title">Questions Fréquentes</h3>
              <div className="ps-faq-grid">
                {faqs.map((faq, i) => (
                  <div key={i} className="ps-faq-item">
                    <h5>{faq.q}</h5>
                    <p>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProcessSection;
