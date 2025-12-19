/* eslint-disable react/prop-types */
import React, { useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import AppareilCatalogue from "./AppareilCatalogue";
import CommandeForm from "./CommandeForm";
import "./PasserCommande.css";

const PasserCommande = ({ onCommandeCreated, onError, onSuccess }) => {
  const [selectedAppareil, setSelectedAppareil] = useState(null);

  const handleSelectAppareil = useCallback((appareil) => {
    setSelectedAppareil(appareil);
    // Scroll vers le formulaire
    setTimeout(() => {
      document
        .querySelector(".form-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleCommandeCreated = useCallback(
    (commande) => {
      setSelectedAppareil(null);
      if (onCommandeCreated) onCommandeCreated(commande);
    },
    [onCommandeCreated]
  );

  return (
    <div className="commande-container">
      <header className="commande-header">
        <h1>
          <ShoppingCart size={28} />
          Nouvelle Commande
        </h1>
        <p>
          Sélectionnez un appareil, téléchargez vos fichiers 3D et finalisez
          votre commande
        </p>
      </header>

      <div className="commande-layout">
        <AppareilCatalogue
          selectedAppareil={selectedAppareil}
          onSelectAppareil={handleSelectAppareil}
        />

        <CommandeForm
          selectedAppareil={selectedAppareil}
          onCommandeCreated={handleCommandeCreated}
          onError={onError}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
};

export default PasserCommande;
