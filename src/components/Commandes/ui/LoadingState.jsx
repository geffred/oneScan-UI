import React from "react";

const LoadingState = () => (
  <div className="commandes-loading-state">
    <div className="commandes-loading-spinner"></div>
    <p className="commandes-loading-text">Chargement des commandes...</p>
  </div>
);

export default React.memo(LoadingState);
