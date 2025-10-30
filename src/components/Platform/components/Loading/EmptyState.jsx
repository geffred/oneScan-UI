import React from "react";
import { Monitor } from "lucide-react";
import "./EmptyState.css";

const EmptyState = React.memo(({ searchTerm }) => (
  <div className="platform-empty-state">
    <Monitor size={48} />
    <h3>Aucune plateforme trouvée</h3>
    <p>
      {searchTerm
        ? "Aucune plateforme ne correspond à votre recherche."
        : "Commencez par ajouter votre première plateforme."}
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;
