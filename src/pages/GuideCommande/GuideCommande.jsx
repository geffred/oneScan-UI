import React, { useRef } from "react";
import {
  AlertCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Info,
  Download,
  Printer,
  Shield,
  FileText,
  Users,
  Settings,
  Send,
  Cpu,
  Truck,
} from "lucide-react";
import { usePDF } from "react-to-pdf";
import "./GuideCommande.css";
import { HashLink } from "react-router-hash-link";

const GuideCommande = () => {
  const { toPDF, targetRef } = usePDF({
    filename: "guide-commande-mysmilelab.pdf",
  });

  const steps = [
    {
      id: 1,
      title: "Création ou migration de votre compte",
      icon: <Users size={24} />,
      summary:
        "Accédez à MySmileLab avec votre compte existant ou créez-en un nouveau",
      content: {
        description:
          "Si vous avez déjà un compte chez nous sur smilelabortho.be, vous serez automatiquement ajouté sur MySmileLab.",
        points: [
          "Vous serez ajouté avec votre email de smilelabortho.be ou celui de votre compte de scan",
          "Un mot de passe de réinitialisation vous sera envoyé par email",
          "Vos adresses de livraison et facturation seront conservées",
          "Si vous n'avez pas de compte, rendez-vous sur mysmilelab.be et cliquez sur 'Créer un compte'",
        ],
        note: {
          type: "info",
          text: "Les clients existants de smilelabortho.be n'ont pas besoin de créer un nouveau compte.",
        },
      },
    },
    {
      id: 2,
      title: "Configuration de votre plateforme de scan",
      icon: <Settings size={24} />,
      summary: "Ajoutez MySmileLab comme laboratoire dans votre logiciel",
      content: {
        description:
          "Configurez votre plateforme de scan (Itero, MeditLink, Dexis, etc.) pour envoyer vos commandes directement à MySmileLab.",
        points: [
          "Accédez aux paramètres de votre plateforme",
          "Ajoutez MySmileLab comme nouveau laboratoire",
          "Utilisez l'adresse email fournie lors de votre inscription",
          "Testez l'envoi avec une commande fictive",
        ],
        note: {
          type: "warning",
          text: "Besoin d'aide pour la configuration ? Contactez notre support technique.",
        },
      },
    },
    {
      id: 3,
      title: "Passation de commande - élément crucial ",
      icon: <Send size={24} />,
      summary: "Envoyez votre commande avec tous les détails nécessaires",
      content: {
        description:
          "Envoyez votre commande via votre plateforme de scan. L'élément le plus important est le type d'appareil et ses détails techniques.",
        important:
          "Dans le commentaire de la commande, vous devez obligatoirement préciser :",
        mainPoints: [
          {
            title: "Type d'appareil",
            description: "Le nom complet et précis de l'appareil souhaité",
            priority: "PRIORITÉ ABSOLUE",
          },
          {
            title: "Détails techniques",
            description:
              "Matériaux, épaisseur, spécifications particulières, couleur, etc.",
            priority: "ESSENTIEL",
          },
        ],
        secondaryPoints: [
          "Nom du cabinet (si différent du compte)",
          "Email du cabinet (si différent du compte)",
          "Téléphone du cabinet (si différent du compte)",
          "Adresse de livraison (uniquement si différente de celle enregistrée ou pour une commande spécifique)",
          "Adresse de facturation (uniquement si différente de celle enregistrée ou pour une commande spécifique)",
        ],
        deliveryNote:
          "La date de livraison souhaitée doit être définie directement sur votre logiciel de scan (pas dans le commentaire).",
        example: {
          title: "Exemple de commentaire complet :",
          text: `Type d'appareil : Gouttière occlusale rigide
Détails : Matériau transparent, épaisseur 3mm, surface lisse, arcades supérieure et inférieure
Nom cabinet : Cabinet Dr. Martin
Email : dr.martin@cabinet.be
Téléphone : +32 2 123 45 67
Adresse de livraison : Cabinet Dr. Martin, 45 Rue de la Santé, 1000 Bruxelles
Adresse de facturation : Même adresse`,
        },
        note: {
          type: "error",
          text: "ATTENTION : Seules les commandes avec un commentaire détaillé contenant AU MINIMUM le type d'appareil et ses détails seront traitées.",
        },
      },
    },
    {
      id: 4,
      title: "Traitement automatique par IA",
      icon: <Cpu size={24} />,
      summary:
        "Notre système analyse et extrait les informations de votre commande",
      content: {
        description:
          "Une fois votre commande envoyée, notre système IA DeepSeek analyse automatiquement votre commentaire et extrait les informations clés.",
        points: [
          "Type d'appareil (typeAppareil) - élément principal",
          "Détails techniques complets (details)",
          "Nom du cabinet (nomCabinet)",
          "Email du cabinet (emailCabinet)",
          "Téléphone du cabinet (telephoneCabinet)",
          "Adresse de livraison (adresseLivraison)",
          "Adresse de facturation (adresseFacturation)",
        ],
        process:
          "Si une donnée n'est pas mentionnée dans le commentaire, elle sera récupérée depuis votre compte existant ou marquée comme manquante.",
        note: {
          type: "info",
          text: "Une fois la commande reçue par nos services, nous vous enverrons un email avec les détails de la commande ainsi que le code de suivi.",
        },
      },
    },
    {
      id: 5,
      title: "Confirmation et suivi",
      icon: <Truck size={24} />,
      summary: "Recevez la confirmation et suivez votre commande en temps réel",
      content: {
        description:
          "Après le traitement de votre commande, vous recevrez un email de confirmation détaillé.",
        points: [
          "Email de confirmation avec récapitulatif complet de la commande",
          "Code de suivi unique pour votre commande",
          "Accès à votre espace MySmileLab pour le suivi en temps réel",
          "Notifications à chaque étape de production",
          "Téléchargement des factures disponible",
        ],
        note: {
          type: "success",
          text: "Conservez votre code de suivi pour toute communication avec notre équipe.",
        },
      },
    },
  ];

  const renderNote = (note) => {
    const icons = {
      info: <Info size={18} />,
      warning: <AlertCircle size={18} />,
      error: <AlertCircle size={18} />,
      success: <CheckCircle size={18} />,
    };

    return (
      <div className={`msl-guide-note-box msl-guide-note-${note.type}`}>
        {icons[note.type]}
        <span>{note.text}</span>
      </div>
    );
  };

  const stats = [
    { label: "Étapes", value: "5", description: "pour passer commande" },
    { label: "Support", value: "24/7", description: "disponible" },
    { label: "Traitement", value: "IA", description: "automatisé" },
    { label: "Livraison", value: "Rapide", description: "partout en Belgique" },
  ];

  return (
    <div className="msl-guide-container">
      {/* Header avec bouton PDF */}
      <div className="msl-guide-header">
        <div className="msl-guide-header-content">
          <div className="msl-guide-header-text">
            <h1 className="msl-guide-title">
              GUIDE COMPLET{" "}
              <HashLink
                smooth
                to={"/#header"}
                style={{
                  textDecoration: "none",
                  color: "#007AFF",
                }}
              >
                MYSMILELAB
              </HashLink>
            </h1>
            <p className="msl-guide-subtitle">Comment passer une commande ?</p>
          </div>
          <div className="msl-guide-header-actions">
            <button onClick={() => toPDF()} className="msl-guide-pdf-button">
              <Download size={20} />
              Télécharger PDF
            </button>
            <button
              onClick={() => window.print()}
              className="msl-guide-print-button"
            >
              <Printer size={20} />
              Imprimer
            </button>
          </div>
        </div>
        <div className="msl-guide-decoration">
          <div className="msl-guide-dot"></div>
          <div className="msl-guide-dot"></div>
          <div className="msl-guide-dot"></div>
        </div>
      </div>

      {/* Contenu principal avec ref pour PDF */}
      <div ref={targetRef} className="msl-guide-content">
        {/* Introduction */}
        <div className="msl-guide-intro">
          <div className="msl-guide-intro-content">
            <h2 className="msl-guide-intro-title">Bienvenue sur MySmileLab</h2>
            <p className="msl-guide-intro-text">
              Ce guide vous accompagne pas à pas dans l'utilisation de notre
              plateforme. Découvrez comment passer vos commandes rapidement et
              efficacement grâce à notre système automatisé et intelligent.
            </p>
          </div>
        </div>

        {/* Étapes détaillées - TOUTES VISIBLES */}
        <div className="msl-guide-steps-container">
          <div className="msl-guide-steps-header">
            <h3 className="msl-guide-steps-title"> Processus de Commande</h3>
            <p className="msl-guide-steps-subtitle">
              Suivez ces 5 étapes pour une expérience optimale
            </p>
          </div>

          {steps.map((step) => (
            <div
              key={step.id}
              className="msl-guide-step-card msl-guide-step-expanded"
            >
              <div className="msl-guide-step-header">
                <div className="msl-guide-step-number-container">
                  <div className="msl-guide-step-number">{step.id}</div>
                  <div className="msl-guide-step-icon">{step.icon}</div>
                </div>
                <div className="msl-guide-step-header-content">
                  <h3 className="msl-guide-step-title">{step.title}</h3>
                  <p className="msl-guide-step-summary">{step.summary}</p>
                </div>
              </div>

              <div className="msl-guide-step-details">
                <p className="msl-guide-step-description">
                  {step.content.description}
                </p>

                {step.content.important && (
                  <p className="msl-guide-step-important">
                    {step.content.important}
                  </p>
                )}

                {step.content.mainPoints && (
                  <div className="msl-guide-main-points">
                    {step.content.mainPoints.map((point, idx) => (
                      <div key={idx} className="msl-guide-main-point-card">
                        <div className="msl-guide-main-point-header">
                          <strong>{point.title}</strong>
                          <span className="msl-guide-priority-badge">
                            {point.priority}
                          </span>
                        </div>
                        <p>{point.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {step.content.secondaryPoints && (
                  <>
                    <p className="msl-guide-secondary-points-title">
                      Informations complémentaires (optionnelles si déjà
                      enregistrées) :
                    </p>
                    <ul className="msl-guide-secondary-points-list">
                      {step.content.secondaryPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}

                {step.content.deliveryNote && (
                  <div className="msl-guide-delivery-note">
                    <strong>Date de livraison :</strong>{" "}
                    {step.content.deliveryNote}
                  </div>
                )}

                {step.content.points && (
                  <ul className="msl-guide-points-list">
                    {step.content.points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}

                {step.content.example && (
                  <div className="msl-guide-example-box">
                    <h4 className="msl-guide-example-title">
                      {step.content.example.title}
                    </h4>
                    <pre className="msl-guide-example-text">
                      {step.content.example.text}
                    </pre>
                  </div>
                )}

                {step.content.process && (
                  <p className="msl-guide-process-info">
                    {step.content.process}
                  </p>
                )}

                {step.content.note && renderNote(step.content.note)}
              </div>
            </div>
          ))}
        </div>

        {/* Section de rappel */}
        <div className="msl-guide-reminder-section">
          <h4 className="msl-guide-reminder-title"> Points Clés à Retenir</h4>
          <div className="msl-guide-reminder-grid">
            <div className="msl-guide-reminder-item">
              <CheckCircle size={20} color="#10B981" />
              <span>
                Le type d'appareil est obligatoire dans chaque commande
              </span>
            </div>
            <div className="msl-guide-reminder-item">
              <CheckCircle size={20} color="#10B981" />
              <span>
                Les détails techniques assurent une fabrication précise
              </span>
            </div>
            <div className="msl-guide-reminder-item">
              <CheckCircle size={20} color="#10B981" />
              <span>Vérifiez vos informations de contact avant envoi</span>
            </div>
            <div className="msl-guide-reminder-item">
              <CheckCircle size={20} color="#10B981" />
              <span>Conservez votre code de suivi pour tout échange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer amélioré */}
      <div className="msl-guide-footer">
        <div className="msl-guide-footer-content">
          <div className="msl-guide-footer-logo">
            <HashLink smooth to={"/#header"}>
              MySmileLab
            </HashLink>
            <span>Votre partenaire dentaire de confiance</span>
          </div>
          <div className="msl-guide-footer-info">
            <p>
              © {new Date().getFullYear()} MySmileLab - Tous droits réservés
            </p>
            <p>www.mysmilelab.be | Soignies , Belgique</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCommande;
