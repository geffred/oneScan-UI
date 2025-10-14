/* eslint-disable react/prop-types */
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({ onRetry }) => (
  <div className="commandes-error-state">
    <AlertCircle className="commandes-error-icon" size={48} />
    <h3 className="commandes-error-title">Erreur de chargement</h3>
    <p className="commandes-error-message">
      Impossible de récupérer les commandes. Veuillez réessayer.
    </p>
    <button className="commandes-btn commandes-btn-primary" onClick={onRetry}>
      <RefreshCw size={16} />
      Réessayer
    </button>
  </div>
);

export default React.memo(ErrorState);
