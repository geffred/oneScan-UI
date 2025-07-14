import "./commandes.css";

const Commandes = () => {
  return (
    <div className="commandes-card">
      <h2 className="commandes-card-title">Gestion des Commandes</h2>
      <div className="commandes-grid commandes-grid-3">
        <div className="commandes-stat-card commandes-stat-card-blue">
          <h3 className="commandes-stat-title commandes-stat-title-blue">
            Commandes en cours
          </h3>
          <p className="commandes-stat-value commandes-stat-value-blue">24</p>
        </div>
        <div className="commandes-stat-card commandes-stat-card-green">
          <h3 className="commandes-stat-title commandes-stat-title-green">
            Commandes terminées
          </h3>
          <p className="commandes-stat-value commandes-stat-value-green">156</p>
        </div>
        <div className="commandes-stat-card commandes-stat-card-yellow">
          <h3 className="commandes-stat-title commandes-stat-title-yellow">
            En attente
          </h3>
          <p className="commandes-stat-value commandes-stat-value-yellow">8</p>
        </div>
      </div>
      <div className="commandes-mt-6">
        <button className="commandes-btn commandes-btn-primary">
          Nouvelle Commande
        </button>
      </div>
    </div>
  );
};

export default Commandes;
