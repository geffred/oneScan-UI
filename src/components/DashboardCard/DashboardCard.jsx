import { Package, Database, BarChart3, User } from "lucide-react";
import "./DashboardCard.css";

const DashboardCard = () => {
  return (
    <div className="dashboard-card-space-y-6">
      <div className="dashboard-card-grid dashboard-card-grid-4">
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-blue">
            <Package className="dashboard-card-stat-icon dashboard-card-stat-icon-blue" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Total Commandes</p>
            <p className="dashboard-card-stat-number">188</p>
          </div>
        </div>
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-green">
            <Database className="dashboard-card-stat-icon dashboard-card-stat-icon-green" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Socles Actifs</p>
            <p className="dashboard-card-stat-number">20</p>
          </div>
        </div>
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-yellow">
            <BarChart3 className="dashboard-card-stat-icon dashboard-card-stat-icon-yellow" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Efficacité</p>
            <p className="dashboard-card-stat-number">94%</p>
          </div>
        </div>
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-purple">
            <User className="dashboard-card-stat-icon dashboard-card-stat-icon-purple" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Utilisateurs</p>
            <p className="dashboard-card-stat-number">12</p>
          </div>
        </div>
      </div>

      <div className="dashboard-card-activity-section">
        <h3 className="dashboard-card-activity-title">Activité récente</h3>
        <div className="dashboard-card-space-y-3">
          <div className="dashboard-card-activity-item">
            <div className="dashboard-card-activity-dot dashboard-card-activity-dot-blue"></div>
            <span className="dashboard-card-activity-text">
              Nouvelle commande créée - CMD-2024-001
            </span>
          </div>
          <div className="dashboard-card-activity-item">
            <div className="dashboard-card-activity-dot dashboard-card-activity-dot-green"></div>
            <span className="dashboard-card-activity-text">
              Socle Premium ajouté à l'inventaire
            </span>
          </div>
          <div className="dashboard-card-activity-item">
            <div className="dashboard-card-activity-dot dashboard-card-activity-dot-yellow"></div>
            <span className="dashboard-card-activity-text">
              Commande CMD-2024-002 terminée
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
