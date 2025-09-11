import React, { useState } from "react";
import {
  UserPlus,
  Send,
  Download,
  Bot,
  FileText,
  Bell,
  CheckCircle,
  Truck,
  MessageCircle,
  Phone,
  ClipboardList,
  ShieldCheck,
  Clock,
  Mail,
  AlertCircle,
  LogIn,
} from "lucide-react";
import "./ProcessSection.css";

const ProcessSection = () => {
  const [activeTab, setActiveTab] = useState("process");
  const [expandedStep, setExpandedStep] = useState(1); // Première étape active par défaut

  const toggleStep = (step) => {
    if (expandedStep === step) {
      setExpandedStep(null);
    } else {
      setExpandedStep(step);
    }
  };

  return (
    <section className="process-section" id="process">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Votre processus de commande simplifié
          </h2>
          <p className="section-subtitle">
            Découvrez comment MySmileLab révolutionne votre expérience de
            commande d'appareils dentaires
          </p>
          <div className="decoration">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "process" ? "active" : ""}`}
            onClick={() => setActiveTab("process")}
          >
            <ClipboardList size={18} />
            Processus de commande
          </button>
          <button
            className={`tab-button ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <UserPlus size={18} />
            Création de compte
          </button>
          <button
            className={`tab-button ${activeTab === "support" ? "active" : ""}`}
            onClick={() => setActiveTab("support")}
          >
            <MessageCircle size={18} />
            Support & Contact
          </button>
        </div>

        {activeTab === "process" && (
          <div className="process-container">
            <div className="process-timeline">
              <div className="timeline-line"></div>

              <div
                className={`process-step ${
                  expandedStep === 1 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(1)}
              >
                <div className="step-indicator">
                  <div className="step-number">1</div>
                  <div className="step-icon">
                    <UserPlus size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Création de compte</h3>
                  <p className="step-summary">
                    Demandez la création de votre compte professionnel
                  </p>
                  {expandedStep === 1 && (
                    <div className="step-details">
                      <p>
                        Pour commencer, créez votre compte cabinet dentaire en
                        remplissant notre formulaire de contact ou en nous
                        appelant directement.
                      </p>
                      <ul>
                        <li>
                          Formulaire en ligne avec sujet "Création de compte"
                        </li>
                        <li>
                          Appel direct au +32 0 493 35 73 28 pour accélérer le
                          processus
                        </li>
                        <li>
                          Réception de vos identifiants par email sous 24h
                        </li>
                      </ul>
                      <div className="important-note">
                        <AlertCircle size={16} />
                        <span>
                          Votre nom de compte doit correspondre à celui utilisé
                          sur votre plateforme de scan
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 2 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(2)}
              >
                <div className="step-indicator">
                  <div className="step-number">2</div>
                  <div className="step-icon">
                    <Send size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Passation de commande</h3>
                  <p className="step-summary">
                    Envoyez votre commande via votre plateforme de scan
                  </p>
                  {expandedStep === 2 && (
                    <div className="step-details">
                      <p>
                        Une fois votre compte créé, envoyez vos commandes via
                        votre plateforme de scan habituelle (Itero, MeditLink,
                        Dexis, etc.)
                      </p>
                      <p className="details-title">
                        Dans le commentaire de la commande, précisez :
                      </p>
                      <ul>
                        <li>
                          <strong>Détails de l'appareil</strong> souhaité (type,
                          matériaux, spécifications)
                        </li>
                        <li>
                          <strong>Délai de livraison</strong> si urgent
                          (précisez la date souhaitée)
                        </li>
                        <li>
                          <strong>Adresse de facturation ou livraison</strong>{" "}
                          si différente de celle enregistrée
                        </li>
                      </ul>
                      <div className="warning-note">
                        <AlertCircle size={16} />
                        <span>
                          Seules les commandes avec commentaire détaillé seront
                          traitées
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 3 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(3)}
              >
                <div className="step-indicator">
                  <div className="step-number">3</div>
                  <div className="step-icon">
                    <Download size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Réception de la commande</h3>
                  <p className="step-summary">
                    Nous recevons automatiquement votre commande
                  </p>
                  {expandedStep === 3 && (
                    <div className="step-details">
                      <p>
                        Dès l'envoi, votre commande est automatiquement importée
                        dans notre système. Vous recevrez un accusé de réception
                        automatique.
                      </p>
                      <ul>
                        <li>
                          Import automatique depuis toutes les plateformes
                          compatibles
                        </li>
                        <li>
                          Vérification de l'intégrité des fichiers scannés
                        </li>
                        <li>Attribution d'un numéro de commande unique</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 4 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(4)}
              >
                <div className="step-indicator">
                  <div className="step-number">4</div>
                  <div className="step-icon">
                    <Bot size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Analyse IA et génération</h3>
                  <p className="step-summary">
                    Notre intelligence artificielle analyse votre commande
                  </p>
                  {expandedStep === 4 && (
                    <div className="step-details">
                      <p>
                        Notre système d'IA analyse automatiquement le
                        commentaire de votre commande pour en extraire toutes
                        les spécifications.
                      </p>
                      <ul>
                        <li>Extraction des détails de l'appareil demandé</li>
                        <li>Reconnaissance des demandes de délai urgent</li>
                        <li>Détection des modifications d'adresse</li>
                        <li>Génération automatique du bon de commande</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 5 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(5)}
              >
                <div className="step-indicator">
                  <div className="step-number">5</div>
                  <div className="step-icon">
                    <Bell size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Notification et suivi</h3>
                  <p className="step-summary">
                    Confirmation par email et activation du suivi
                  </p>
                  {expandedStep === 5 && (
                    <div className="step-details">
                      <p>
                        Vous recevez un email de confirmation détaillé avec
                        toutes les informations de votre commande et un lien de
                        suivi.
                      </p>
                      <ul>
                        <li>
                          Récapitulatif de la commande et des spécifications
                        </li>
                        <li>Numéro de suivi unique pour suivre l'avancement</li>
                        <li>Estimation du délai de production et livraison</li>
                        <li>Coordonnées de votre responsable de commande</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 6 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(6)}
              >
                <div className="step-indicator">
                  <div className="step-number">6</div>
                  <div className="step-icon">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Validation et production</h3>
                  <p className="step-summary">
                    Fabrication de votre appareil sur mesure
                  </p>
                  {expandedStep === 6 && (
                    <div className="step-details">
                      <p>
                        Votre appareil entre en production après validation
                        technique. Notre équipe assure un contrôle qualité à
                        chaque étape.
                      </p>
                      <ul>
                        <li>Validation technique par nos experts</li>
                        <li>Fabrication avec des matériaux certifiés</li>
                        <li>Contrôles qualité rigoureux</li>
                        <li>Respect des délais (standards ou urgents)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`process-step ${
                  expandedStep === 7 ? "expanded" : ""
                }`}
                onClick={() => toggleStep(7)}
              >
                <div className="step-indicator">
                  <div className="step-number">7</div>
                  <div className="step-icon">
                    <Truck size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <h3>Expédition et suivi</h3>
                  <p className="step-summary">
                    Livraison et suivi en temps réel
                  </p>
                  {expandedStep === 7 && (
                    <div className="step-details">
                      <p>
                        Votre appareil est emballé avec soin et expédié vers
                        votre cabinet. Vous pouvez suivre l'acheminement en
                        temps réel.
                      </p>
                      <ul>
                        <li>Emballage sécurisé pour protection optimale</li>
                        <li>Expédition avec service de suivi</li>
                        <li>Notification avant livraison</li>
                        <li>Service après-vente inclus</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="account-process">
            <div className="account-header">
              <h3>Création de votre compte professionnel</h3>
              <p>
                Rejoignez les centaines de cabinets dentaires qui utilisent déjà
                nos services
              </p>
            </div>

            <div className="account-steps">
              <div className="account-step">
                <div className="account-step-header">
                  <div className="account-step-icon">
                    <UserPlus size={24} />
                  </div>
                  <div className="account-step-content">
                    <h4>1. Demande de création de compte</h4>
                    <p>Deux méthodes simples pour créer votre compte</p>
                  </div>
                </div>
                <div className="account-step-details">
                  <div className="method-card">
                    <div className="method-icon">
                      <Mail size={20} />
                    </div>
                    <div className="method-content">
                      <h5>Par formulaire en ligne</h5>
                      <p>
                        Remplissez notre formulaire de contact en sélectionnant{" "}
                        <strong>
                          "Création de compte cabinet dentaire d'orthodontie"
                        </strong>{" "}
                        comme sujet.
                      </p>
                    </div>
                  </div>
                  <div className="method-card highlight">
                    <div className="method-icon">
                      <Phone size={20} />
                    </div>
                    <div className="method-content">
                      <h5>Par téléphone (recommandé)</h5>
                      <p>
                        Appelez-nous directement au{" "}
                        <strong className="highlight-text">
                          +32 0 493 35 73 28
                        </strong>{" "}
                        pour une création de compte accélérée.
                      </p>
                      <div className="contact-info">
                        <Clock size={16} />
                        <span>Du lundi au vendredi, 9h-14h et 14h-18h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="account-step">
                <div className="account-step-header">
                  <div className="account-step-icon">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="account-step-content">
                    <h4>2. Réception et activation</h4>
                    <p>Accédez à votre espace client sécurisé</p>
                  </div>
                </div>
                <div className="account-step-details">
                  <div className="activation-info">
                    <p>
                      Après traitement de votre demande, vous recevrez un email
                      contenant :
                    </p>
                    <ul>
                      <li>
                        Vos identifiants de connexion (email et mot de passe
                        temporaire)
                      </li>
                      <li>Un lien d'accès à votre espace client</li>
                      <li>Un guide de prise en main</li>
                    </ul>
                    <div className="important-note">
                      <AlertCircle size={16} />
                      <span>
                        <strong>Important :</strong> Votre nom de compte doit
                        correspondre exactement à celui utilisé sur votre
                        plateforme de scan (Itero, MeditLink, Dexis, etc.) pour
                        assurer une synchronisation parfaite.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="account-step">
                <div className="account-step-header">
                  <div className="account-step-icon">
                    <LogIn size={24} />
                  </div>
                  <div className="account-step-content">
                    <h4>3. Première connexion et configuration</h4>
                    <p>Personnalisez votre compte selon vos besoins</p>
                  </div>
                </div>
                <div className="account-step-details">
                  <ol className="configuration-steps">
                    <li>
                      Connectez-vous avec les identifiants reçus par email
                    </li>
                    <li>Modifiez votre mot de passe pour plus de sécurité</li>
                    <li>Complétez votre profil professionnel</li>
                    <li>
                      Vérifiez vos coordonnées de facturation et livraison
                    </li>
                    <li>Paramétrez vos préférences de communication</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="support-section">
            <div className="support-header">
              <h3>Notre équipe à votre service</h3>
              <p>Nous sommes là pour vous accompagner à chaque étape</p>
            </div>

            <div className="support-options">
              <div className="support-card">
                <div className="support-icon">
                  <Phone size={32} />
                </div>
                <h4>Assistance téléphonique</h4>
                <p>Parlez directement à un conseiller spécialisé</p>
                <div className="support-contact">
                  <strong>+32 0 493 35 73 28</strong>
                  <span>Du lundi au vendredi, 9h-13h et 14h-18h</span>
                </div>
              </div>

              <div className="support-card">
                <div className="support-icon">
                  <Mail size={32} />
                </div>
                <h4>Support email</h4>
                <p>Obtenez une réponse détaillée sous 24h</p>
                <div className="support-contact">
                  <strong>contact@mysmilelab.be</strong>
                  <span>Réponse garantie en 24 heures ouvrables</span>
                </div>
              </div>

              <div className="support-card">
                <div className="support-icon">
                  <MessageCircle size={32} />
                </div>
                <h4>Chat en direct</h4>
                <p>Discutez en direct avec notre équipe </p>
                <div className="support-contact">
                  <strong>Disponible sur whatsapp</strong>
                  <span>Du lundi au vendredi, 9h-13h et de 14h-18h</span>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h4>Questions fréquentes</h4>
              <div className="faq-item">
                <h5>
                  Que dois-je inclure dans le commentaire de ma commande ?
                </h5>
                <p>
                  Il est essentiel de préciser : le type d'appareil souhaité,
                  les matériaux, toute spécification technique, le délai si
                  urgent, et toute modification d'adresse de livraison ou
                  facturation pour cette commande.
                </p>
              </div>
              <div className="faq-item">
                <h5>Comment savoir si ma commande a bien été reçue ?</h5>
                <p>
                  Vous recevrez un email de confirmation automatique dès
                  réception de votre commande. Si vous ne recevez pas cet email
                  sous 2 heures, contactez notre service client.
                </p>
              </div>
              <div className="faq-item">
                <h5>Que faire si j'ai besoin d'une commande urgente ?</h5>
                <p>
                  Précisez "URGENT" dans le commentaire de votre commande avec
                  la date limite de livraison souhaitée. Notre équipe vous
                  contactera pour confirmer la faisabilité.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProcessSection;
