import React from "react";
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./TermsPage.css";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="terms-page-wrapper">
      {/* Header */}
      <div className="terms-header-section">
        <div className="terms-header-container">
          <Link to="/" className="terms-back-link">
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>
          <div className="terms-logo-area">
            <div className="terms-logo-icon">
              <span className="terms-logo-text">IA</span>
            </div>
            <h1 className="terms-brand-name">IA Lab</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="terms-main-container">
        <div className="terms-content-wrapper">
          {/* Hero Section */}
          <div className="terms-hero-section">
            <div className="terms-hero-icon">
              <FileText size={48} />
            </div>
            <h1 className="terms-main-title">
              Conditions Générales d'Utilisation
            </h1>
            <p className="terms-main-subtitle">
              Dernière mise à jour : 15 janvier 2025
            </p>
            <div className="terms-summary-card">
              <h3 className="terms-summary-title">En résumé</h3>
              <p className="terms-summary-text">
                Ces conditions régissent l'utilisation de la plateforme IA Lab,
                dédiée à l'intelligence artificielle pour les laboratoires
                dentaires. En utilisant nos services, vous acceptez ces termes.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="terms-toc-section">
            <h2 className="terms-toc-title">Sommaire</h2>
            <nav className="terms-toc-nav">
              <a href="#definitions" className="terms-toc-link">
                1. Définitions
              </a>
              <a href="#acceptance" className="terms-toc-link">
                2. Acceptation des conditions
              </a>
              <a href="#services" className="terms-toc-link">
                3. Description des services
              </a>
              <a href="#account" className="terms-toc-link">
                4. Compte utilisateur
              </a>
              <a href="#usage" className="terms-toc-link">
                5. Utilisation des services
              </a>
              <a href="#data" className="terms-toc-link">
                6. Protection des données
              </a>
              <a href="#intellectual" className="terms-toc-link">
                7. Propriété intellectuelle
              </a>
              <a href="#liability" className="terms-toc-link">
                8. Responsabilité
              </a>
              <a href="#pricing" className="terms-toc-link">
                9. Tarification
              </a>
              <a href="#termination" className="terms-toc-link">
                10. Résiliation
              </a>
              <a href="#modifications" className="terms-toc-link">
                11. Modifications
              </a>
              <a href="#contact" className="terms-toc-link">
                12. Contact
              </a>
            </nav>
          </div>

          {/* Content Sections */}
          <div className="terms-content-sections">
            {/* Section 1 */}
            <section id="definitions" className="terms-content-section">
              <div className="terms-section-header">
                <Shield className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">1. Définitions</h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  <strong>IA Lab :</strong> Désigne la société IA Lab SAS,
                  éditrice de la plateforme logicielle d'intelligence
                  artificielle dédiée aux laboratoires dentaires.
                </p>
                <p className="terms-paragraph">
                  <strong>Plateforme :</strong> Ensemble des services numériques
                  proposés par IA Lab, incluant l'interface web, les API et les
                  outils d'intelligence artificielle.
                </p>
                <p className="terms-paragraph">
                  <strong>Utilisateur :</strong> Toute personne physique ou
                  morale utilisant les services IA Lab, incluant les
                  laboratoires dentaires, dentistes, prothésistes et
                  institutions d'enseignement.
                </p>
                <p className="terms-paragraph">
                  <strong>Données Client :</strong> Ensemble des informations,
                  fichiers et données transmises par l'Utilisateur via la
                  Plateforme, incluant les scans dentaires, commandes et
                  informations patients.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="acceptance" className="terms-content-section">
              <div className="terms-section-header">
                <Users className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  2. Acceptation des Conditions
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  L'utilisation des services IA Lab implique l'acceptation
                  pleine et entière des présentes conditions générales
                  d'utilisation. Cette acceptation est matérialisée par la
                  création d'un compte utilisateur ou l'utilisation de nos
                  services.
                </p>
                <p className="terms-paragraph">
                  Si vous utilisez nos services au nom d'une organisation, vous
                  déclarez avoir l'autorité nécessaire pour engager cette
                  organisation aux présentes conditions.
                </p>
                <div className="terms-highlight-box">
                  <AlertTriangle className="terms-highlight-icon" size={20} />
                  <p className="terms-highlight-text">
                    <strong>Important :</strong> L'utilisation de nos services à
                    des fins médicales doit respecter la réglementation en
                    vigueur dans votre pays.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="services" className="terms-content-section">
              <div className="terms-section-header">
                <FileText className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  3. Description des Services
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  IA Lab propose une plateforme SaaS (Software as a Service)
                  destinée aux professionnels du secteur dentaire, comprenant :
                </p>
                <ul className="terms-list">
                  <li>
                    Centralisation des commandes provenant de plateformes
                    tierces (Itero, 3Shape, MedditLink, Dexis)
                  </li>
                  <li>
                    Génération automatique de bons de commande via intelligence
                    artificielle
                  </li>
                  <li>
                    Création automatisée de socles dentaires à partir de scans
                    intra-oraux
                  </li>
                  <li>Outils d'analyse et de reporting avancés</li>
                  <li>API pour intégration avec systèmes existants</li>
                </ul>
                <p className="terms-paragraph">
                  Nos services sont fournis en l'état, avec une disponibilité
                  cible de 99,5%. Des maintenances programmées peuvent
                  occasionner des interruptions temporaires, communiquées à
                  l'avance.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="account" className="terms-content-section">
              <div className="terms-section-header">
                <Users className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">4. Compte Utilisateur</h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  La création d'un compte utilisateur est obligatoire pour
                  accéder aux services. Vous vous engagez à fournir des
                  informations exactes, complètes et à jour.
                </p>
                <p className="terms-paragraph">
                  Vous êtes responsable de la confidentialité de vos
                  identifiants de connexion et de toutes les activités
                  effectuées sous votre compte. Vous devez nous informer
                  immédiatement de toute utilisation non autorisée.
                </p>
                <div className="terms-requirements-box">
                  <h4 className="terms-requirements-title">
                    Exigences du compte :
                  </h4>
                  <ul className="terms-requirements-list">
                    <li>Âge minimum de 18 ans</li>
                    <li>Adresse email professionnelle valide</li>
                    <li>Informations d'identification vérifiables</li>
                    <li>Respect des conditions d'utilisation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="usage" className="terms-content-section">
              <div className="terms-section-header">
                <Shield className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  5. Utilisation des Services
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  L'utilisation de nos services est strictement réservée aux
                  fins professionnelles dans le domaine dentaire. Vous vous
                  engagez à :
                </p>
                <ul className="terms-list">
                  <li>
                    Respecter toutes les lois et réglementations applicables
                  </li>
                  <li>
                    Ne pas utiliser les services à des fins illégales ou
                    frauduleuses
                  </li>
                  <li>
                    Ne pas tenter d'accéder aux systèmes de manière non
                    autorisée
                  </li>
                  <li>Ne pas perturber le fonctionnement de la plateforme</li>
                  <li>Respecter les droits de propriété intellectuelle</li>
                </ul>
                <div className="terms-prohibited-box">
                  <h4 className="terms-prohibited-title">
                    Utilisations interdites :
                  </h4>
                  <p className="terms-prohibited-text">
                    Transmission de malwares, spam, contenu illégal, violation
                    de la vie privée, ingénierie inverse, tentatives de piratage
                    ou toute activité nuisant à l'intégrité de nos services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="data" className="terms-content-section">
              <div className="terms-section-header">
                <Shield className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  6. Protection des Données
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  IA Lab s'engage à protéger vos données conformément au RGPD et
                  aux réglementations applicables. Nous traitons vos données
                  uniquement pour la fourniture de nos services.
                </p>
                <div className="terms-data-principles">
                  <h4 className="terms-data-title">Nos principes :</h4>
                  <ul className="terms-data-list">
                    <li>
                      <strong>Confidentialité :</strong> Chiffrement AES-256 de
                      toutes les données
                    </li>
                    <li>
                      <strong>Intégrité :</strong> Sauvegardes automatiques et
                      redondance
                    </li>
                    <li>
                      <strong>Disponibilité :</strong> Accès sécurisé 24h/24,
                      7j/7
                    </li>
                    <li>
                      <strong>Transparence :</strong> Droit d'accès,
                      rectification et suppression
                    </li>
                  </ul>
                </div>
                <p className="terms-paragraph">
                  Vous conservez la propriété de vos données. IA Lab agit en
                  qualité de sous-traitant et s'engage à ne pas utiliser vos
                  données à d'autres fins que la fourniture de nos services.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="intellectual" className="terms-content-section">
              <div className="terms-section-header">
                <FileText className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  7. Propriété Intellectuelle
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  IA Lab détient tous les droits de propriété intellectuelle sur
                  la plateforme, incluant les algorithmes d'IA, l'interface
                  utilisateur, la documentation et les marques associées.
                </p>
                <p className="terms-paragraph">
                  L'utilisation de nos services vous confère une licence
                  limitée, non-exclusive et révocable d'utilisation, sans droit
                  de reproduction, modification ou distribution.
                </p>
                <p className="terms-paragraph">
                  Vous conservez la propriété de vos données et contenus. En
                  utilisant nos services, vous nous accordez une licence limitée
                  pour traiter ces données dans le cadre de la fourniture de nos
                  services.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="liability" className="terms-content-section">
              <div className="terms-section-header">
                <AlertTriangle className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">8. Responsabilité</h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  IA Lab s'efforce de fournir des services de qualité mais ne
                  peut garantir une disponibilité absolue ou l'absence
                  d'erreurs. Notre responsabilité est limitée au montant des
                  sommes versées au cours des 12 derniers mois.
                </p>
                <div className="terms-liability-box">
                  <h4 className="terms-liability-title">
                    Limitations importantes :
                  </h4>
                  <ul className="terms-liability-list">
                    <li>
                      Les résultats générés par l'IA sont des suggestions et non
                      des prescriptions médicales
                    </li>
                    <li>
                      L'utilisateur reste responsable de la validation finale
                      des résultats
                    </li>
                    <li>
                      IA Lab ne peut être tenu responsable des décisions
                      médicales prises
                    </li>
                    <li>
                      Force majeure et cas fortuits exemptent IA Lab de
                      responsabilité
                    </li>
                  </ul>
                </div>
                <p className="terms-paragraph">
                  Vous vous engagez à indemniser IA Lab contre toute réclamation
                  résultant de votre utilisation non conforme des services.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="pricing" className="terms-content-section">
              <div className="terms-section-header">
                <FileText className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  9. Tarification et Facturation
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  Nos tarifs sont disponibles sur notre site web et peuvent être
                  modifiés moyennant un préavis de 30 jours. La facturation
                  s'effectue selon la périodicité choisie lors de l'abonnement.
                </p>
                <p className="terms-paragraph">
                  Les paiements sont exigibles d'avance. En cas de retard de
                  paiement, l'accès aux services peut être suspendu après mise
                  en demeure restée sans effet pendant 15 jours.
                </p>
                <p className="terms-paragraph">
                  Une période d'essai gratuite de 30 jours peut être proposée
                  aux nouveaux utilisateurs, sans engagement d'abonnement
                  ultérieur.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="termination" className="terms-content-section">
              <div className="terms-section-header">
                <AlertTriangle className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">10. Résiliation</h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  Vous pouvez résilier votre abonnement à tout moment depuis
                  votre espace utilisateur. La résiliation prend effet à la fin
                  de la période de facturation en cours.
                </p>
                <p className="terms-paragraph">
                  IA Lab se réserve le droit de suspendre ou résilier votre
                  accès en cas de violation des présentes conditions, avec un
                  préavis de 15 jours sauf urgence justifiée.
                </p>
                <p className="terms-paragraph">
                  Après résiliation, vos données seront conservées 90 jours puis
                  supprimées définitivement, sauf obligation légale contraire.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="modifications" className="terms-content-section">
              <div className="terms-section-header">
                <FileText className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  11. Modifications des Conditions
                </h2>
              </div>
              <div className="terms-section-content">
                <p className="terms-paragraph">
                  IA Lab se réserve le droit de modifier les présentes
                  conditions générales. Les modifications majeures seront
                  notifiées par email avec un préavis minimum de 30 jours.
                </p>
                <p className="terms-paragraph">
                  Votre utilisation continue des services après notification
                  constitue une acceptation des nouvelles conditions. En cas de
                  désaccord, vous pouvez résilier votre abonnement.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="contact" className="terms-content-section">
              <div className="terms-section-header">
                <Users className="terms-section-icon" size={24} />
                <h2 className="terms-section-title">
                  12. Contact et Juridiction
                </h2>
              </div>
              <div className="terms-section-content">
                <div className="terms-contact-info">
                  <h4 className="terms-contact-title">IA Lab SAS</h4>
                  <p className="terms-contact-item">
                    Boulevard Roosevelt 23 7060 Soignies
                  </p>
                  <p className="terms-contact-item">TAV : BE BE0794998835</p>
                  <p className="terms-contact-item">Email : legal@ia-lab.be</p>
                  <p className="terms-contact-item">
                    Téléphone : +32(0) 493 35 73 28
                  </p>
                </div>
                <p className="terms-paragraph">
                  Pour toute question concernant ces conditions générales, vous
                  pouvez nous contacter à l'adresse : legal@ia-lab.be
                </p>
                <p className="terms-paragraph">
                  Les présentes conditions sont régies par le droit français.
                  Tout litige sera soumis à la compétence exclusive des
                  tribunaux de Paris, après tentative de résolution amiable.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="terms-footer-section">
            <div className="terms-footer-content">
              <p className="terms-footer-text">
                Document généré automatiquement le 15 janvier 2025
              </p>
              <div className="terms-footer-links">
                <Link to="/privacy" className="terms-footer-link">
                  Politique de confidentialité
                </Link>
                <Link to="/cookies" className="terms-footer-link">
                  Politique des cookies
                </Link>
                <Link to="/contact" className="terms-footer-link">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
