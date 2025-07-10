import "./commandes.css";

const Commandes = () => {
  return (
    <div className="card">
      <h2 className="card-title">Gestion des Commandes</h2>
      <div className="grid grid-3">
        <div className="stat-card blue">
          <h3 className="stat-title blue">Commandes en cours</h3>
          <p className="stat-value blue">24</p>
        </div>
        <div className="stat-card green">
          <h3 className="stat-title green">Commandes terminées</h3>
          <p className="stat-value green">156</p>
        </div>
        <div className="stat-card yellow">
          <h3 className="stat-title yellow">En attente</h3>
          <p className="stat-value yellow">8</p>
        </div>
      </div>
      <div className="mt-6">
        <button className="btn btn-primary">Nouvelle Commande</button>
      </div>
    </div>
  );
};

export default Commandes;
