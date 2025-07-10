import "./socles.css";

const Socles = () => {
  return (
    <div className="card">
      <h2 className="card-title">Gestion des Socles</h2>
      <div className="socles-grid">
        <div className="socles-section">
          <h3 className="socles-title">Socles disponibles</h3>
          <div className="space-y-2">
            <div className="socles-item">
              <span>Socle Standard</span>
              <span className="socles-badge">12 disponibles</span>
            </div>
            <div className="socles-item">
              <span>Socle Premium</span>
              <span className="socles-badge">8 disponibles</span>
            </div>
          </div>
        </div>
        <div className="socles-section">
          <h3 className="socles-title">Actions rapides</h3>
          <div>
            <button className="btn btn-primary btn-full">
              Créer un nouveau socle
            </button>
            <button className="btn btn-secondary btn-full">
              Gérer l'inventaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Socles;
