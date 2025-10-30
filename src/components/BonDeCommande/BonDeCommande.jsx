import React, { useRef } from "react";
import { Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import "./BonDeCommande.css";

const BonDeCommande = ({ commande, cabinet, onClose }) => {
  const bonDeCommandeRef = useRef();

  const handleDownloadPDF = useReactToPrint({
    contentRef: bonDeCommandeRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 5mm;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          zoom: 0.9; /* Réduction légère pour tenir sur une page */
        }
        .bon-de-commande-actions {
          display: none !important;
        }
        .bon-de-commande-container {
          page-break-inside: avoid !important;
          page-break-before: avoid !important;
          page-break-after: avoid !important;
          overflow: visible !important;
        }
        .bon-de-commande-section, 
        .bon-de-commande-table, 
        .bon-de-commande-grid {
          page-break-inside: avoid !important;
          page-break-before: avoid !important;
          page-break-after: avoid !important;
        }
      }
    `,
    documentTitle: `Bon_de_commande_${commande.externalId}`,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const adresseLivraison =
    commande.adresseDeLivraison ||
    (cabinet ? cabinet.adresseDeLivraison : "Non spécifiée");

  const adresseFacturation =
    commande.adresseDeFacturation ||
    (cabinet ? cabinet.adresseDeFacturation : "Non spécifiée");

  return (
    <div className="bon-de-commande-modal">
      <div className="bon-de-commande-container">
        <div className="bon-de-commande-actions">
          <button
            className="bon-de-commande-btn bon-de-commande-btn-close"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            className="bon-de-commande-btn bon-de-commande-btn-download"
            onClick={handleDownloadPDF}
          >
            <Download size={16} />
            Télécharger PDF
          </button>
        </div>

        <div className="bon-de-commande-content" ref={bonDeCommandeRef}>
          <header className="bon-de-commande-header">
            <div className="bon-de-commande-logo">
              <h1>smile lab</h1>
              <p>
                LE LABORATOIRE D’ORTHODONTIE OÙ L’ARTISANAT RENCONTRE
                L’INNOVATION.
              </p>
              <section className="bon-de-commande-company-info">
                <p>
                  <strong>Téléphone:</strong> +32(0) 493 35 73 28
                </p>
                <p>
                  <strong>Adresse:</strong> Boulevard Roosevelt 23, 7060
                  Soignies
                </p>
                <p>
                  <strong>IBAN:</strong> BE0794998835
                </p>
              </section>
            </div>
            <div className="bon-de-commande-title">
              <h2>BON DE COMMANDE</h2>
              <div className="bon-de-commande-info">
                <p>
                  <strong>N°:</strong> {commande.externalId}
                </p>
                <p>
                  <strong>Date:</strong> {currentDate}
                </p>
              </div>
            </div>
          </header>

          <section className="bon-de-commande-section">
            <h3>Informations Patient & Cabinet</h3>
            <div className="bon-de-commande-grid">
              <div>
                <p>
                  <strong>Réf. Patient:</strong> {commande.refPatient || "N/A"}
                </p>
                <p>
                  <strong>Cabinet:</strong>{" "}
                  {cabinet ? cabinet.nom : commande.cabinet || "N/A"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Plateforme:</strong> {commande.plateforme || "N/A"}
                </p>
                <p>
                  <strong>Date réception:</strong>{" "}
                  {formatDate(commande.dateReception) || "N/A"}
                </p>
              </div>
            </div>
          </section>

          <section className="bon-de-commande-section">
            <h3>Détails de la Commande</h3>
            <div className="bon-de-commande-commentaire">
              <p>
                <strong>Commentaire:</strong>
              </p>
              <p>{commande.commentaire || "Aucun commentaire"}</p>
            </div>

            <div className="bon-de-commande-appareils">
              <h4>Appareil(s) commandé(s):</h4>
              <table className="bon-de-commande-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{commande.typeAppareil || "N/A"}</td>
                    <td>{commande.details || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bon-de-commande-section">
            <h3>Dates Importantes</h3>
            <div className="bon-de-commande-grid">
              <div>
                <p>
                  <strong>Date de commande:</strong>{" "}
                  {formatDate(commande.dateReception) || "N/A"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Date de livraison souhaitée:</strong>{" "}
                  {formatDate(commande.dateEcheance) || "N/A"}
                </p>
              </div>
            </div>
          </section>

          <section className="bon-de-commande-section bon-de-commande-addresses">
            <div className="bon-de-commande-grid">
              <div>
                <h4>Adresse de Livraison</h4>
                <p>{adresseLivraison}</p>
                {!commande.adresseDeLivraison && cabinet && (
                  <p className="bon-de-commande-note">(Adresse du cabinet)</p>
                )}
              </div>
              <div>
                <h4>Adresse de Facturation</h4>
                <p>{adresseFacturation}</p>
                {!commande.adresseDeFacturation && cabinet && (
                  <p className="bon-de-commande-note">(Adresse du cabinet)</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BonDeCommande;
