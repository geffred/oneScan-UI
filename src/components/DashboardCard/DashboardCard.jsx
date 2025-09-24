import React, { useContext, useMemo } from "react";
import {
  Package,
  Database,
  BarChart3,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  Server,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import useSWR from "swr";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./DashboardCard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Fonction de fetch pour SWR
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonction pour récupérer les commandes
const getCommandes = async () => {
  return fetchWithAuth(`${API_BASE_URL}/public/commandes`);
};

// Fonction pour récupérer les cabinets
const getCabinets = async () => {
  return fetchWithAuth(`${API_BASE_URL}/cabinet`);
};

// Fonction pour récupérer les plateformes
const getPlatforms = async () => {
  return fetchWithAuth(`${API_BASE_URL}/platforms`);
};

// Fonction pour récupérer les données utilisateur
const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const userEmail = JSON.parse(atob(token.split(".")[1])).sub;
  return fetchWithAuth(`${API_BASE_URL}/auth/user/${userEmail}`);
};

const DashboardCard = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // SWR hooks pour les données
  const { data: commandes = [] } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/public/commandes` : null,
    getCommandes,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000,
    }
  );

  const { data: cabinets = [] } = useSWR(
    isAuthenticated ? "cabinets" : null,
    getCabinets,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  );

  const { data: platforms = [] } = useSWR(
    isAuthenticated ? "platforms" : null,
    getPlatforms,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  );

  const { data: userData } = useSWR(
    isAuthenticated ? "user-data" : null,
    getUserData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Calcul des statistiques
  const stats = useMemo(() => {
    // Commandes non vues
    const commandesNonVues = commandes.filter((cmd) => !cmd.vu).length;

    // Commandes échues
    const commandesEchues = commandes.filter((cmd) => {
      if (!cmd.dateEcheance) return false;
      const today = new Date();
      const echeance = new Date(cmd.dateEcheance);
      return echeance < today;
    }).length;

    // Commandes urgentes (échéance dans moins de 3 jours)
    const commandesUrgentes = commandes.filter((cmd) => {
      if (!cmd.dateEcheance) return false;
      const today = new Date();
      const echeance = new Date(cmd.dateEcheance);
      const diffTime = echeance - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length;

    // Taux d'efficacité (basé sur les commandes non échues)
    const efficacite =
      commandes.length > 0
        ? Math.round(
            ((commandes.length - commandesEchues) / commandes.length) * 100
          )
        : 0;

    return {
      totalCommandes: commandes.length,
      commandesNonVues,
      commandesEchues,
      commandesUrgentes,
      totalCabinets: cabinets.length,
      totalPlatforms: platforms.length,
      efficacite,
    };
  }, [commandes, cabinets, platforms]);

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    // Données pour le graphique linéaire (commandes par mois)
    const currentDate = new Date();
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const monthlyData = new Array(6).fill(0);
    commandes.forEach((cmd) => {
      if (cmd.dateReception) {
        const date = new Date(cmd.dateReception);
        const monthDiff =
          currentDate.getMonth() -
          date.getMonth() +
          12 * (currentDate.getFullYear() - date.getFullYear());

        if (monthDiff >= 0 && monthDiff < 6) {
          monthlyData[5 - monthDiff]++;
        }
      }
    });

    const lineChartData = {
      labels: months.slice(-6),
      datasets: [
        {
          label: "Commandes par mois",
          data: monthlyData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    // Données pour le graphique en barres (statut des commandes)
    const statusData = {
      labels: ["Total", "Non vues", "Échues", "Urgentes"],
      datasets: [
        {
          label: "Commandes",
          data: [
            stats.totalCommandes,
            stats.commandesNonVues,
            stats.commandesEchues,
            stats.commandesUrgentes,
          ],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(96, 165, 250, 0.7)",
            "rgba(239, 68, 68, 0.7)",
            "rgba(245, 158, 11, 0.7)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(96, 165, 250)",
            "rgb(239, 68, 68)",
            "rgb(245, 158, 11)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Données pour le graphique en anneau (répartition)
    const doughnutData = {
      labels: ["Cabinets", "Plateformes"],
      datasets: [
        {
          label: "Répartition",
          data: [stats.totalCabinets, stats.totalPlatforms],
          backgroundColor: [
            "rgba(139, 92, 246, 0.7)",
            "rgba(249, 115, 22, 0.7)",
          ],
          borderColor: ["rgb(139, 92, 246)", "rgb(249, 115, 22)"],
          borderWidth: 1,
        },
      ],
    };

    return { lineChartData, statusData, doughnutData };
  }, [commandes, stats]);

  // Options communes pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Activité récente (5 dernières commandes)
  const recentActivity = useMemo(() => {
    return commandes
      .sort(
        (a, b) =>
          new Date(b.dateReception || 0) - new Date(a.dateReception || 0)
      )
      .slice(0, 5)
      .map((commande) => ({
        id: commande.externalId,
        type: "commande",
        text: `Nouvelle commande - ${commande.refPatient || "Sans nom"}`,
        date: commande.dateReception,
        status: !commande.vu
          ? "new"
          : new Date(commande.dateEcheance) < new Date()
          ? "late"
          : "normal",
      }));
  }, [commandes]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="dashboard-card-space-y-6">
      <div className="dashboard-card-grid dashboard-card-grid-4">
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-blue">
            <Package className="dashboard-card-stat-icon dashboard-card-stat-icon-blue" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Total Commandes</p>
            <p className="dashboard-card-stat-number">{stats.totalCommandes}</p>
          </div>
        </div>

        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-red">
            <AlertTriangle className="dashboard-card-stat-icon dashboard-card-stat-icon-red" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Commandes Échues</p>
            <p className="dashboard-card-stat-number">
              {stats.commandesEchues}
            </p>
          </div>
        </div>

        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-yellow">
            <Clock className="dashboard-card-stat-icon dashboard-card-stat-icon-yellow" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Commandes Urgentes</p>
            <p className="dashboard-card-stat-number">
              {stats.commandesUrgentes}
            </p>
          </div>
        </div>

        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-green">
            <BarChart3 className="dashboard-card-stat-icon dashboard-card-stat-icon-green" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Efficacité</p>
            <p className="dashboard-card-stat-number">{stats.efficacite}%</p>
          </div>
        </div>
      </div>

      <div className="dashboard-card-grid dashboard-card-grid-3">
        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-purple">
            <Database className="dashboard-card-stat-icon dashboard-card-stat-icon-purple" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Cabinets</p>
            <p className="dashboard-card-stat-number">{stats.totalCabinets}</p>
          </div>
        </div>

        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-orange">
            <Server className="dashboard-card-stat-icon dashboard-card-stat-icon-orange" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Plateformes</p>
            <p className="dashboard-card-stat-number">{stats.totalPlatforms}</p>
          </div>
        </div>

        <div className="dashboard-card-stat">
          <div className="dashboard-card-stat-icon-container dashboard-card-stat-icon-container-pink">
            <User className="dashboard-card-stat-icon dashboard-card-stat-icon-pink" />
          </div>
          <div className="dashboard-card-stat-info">
            <p className="dashboard-card-stat-label">Utilisateurs</p>
            <p className="dashboard-card-stat-number">1</p>
          </div>
        </div>
      </div>

      {/* Section des graphiques */}
      <div className="dashboard-card-grid dashboard-card-grid-2">
        <div className="dashboard-card-chart-container">
          <h3 className="dashboard-card-chart-title">
            Évolution des commandes
          </h3>
          <div className="dashboard-card-chart">
            <Line data={chartData.lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="dashboard-card-chart-container">
          <h3 className="dashboard-card-chart-title">Statut des commandes</h3>
          <div className="dashboard-card-chart">
            <Bar data={chartData.statusData} options={chartOptions} />
          </div>
        </div>

        <div className="dashboard-card-chart-container">
          <h3 className="dashboard-card-chart-title">Répartition</h3>
          <div className="dashboard-card-chart">
            <Doughnut data={chartData.doughnutData} options={chartOptions} />
          </div>
        </div>

        <div className="dashboard-card-activity-section">
          <h3 className="dashboard-card-activity-title">Activité récente</h3>
          <div className="dashboard-card-space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="dashboard-card-activity-item">
                  <div
                    className={`dashboard-card-activity-dot ${
                      activity.status === "new"
                        ? "dashboard-card-activity-dot-blue"
                        : activity.status === "late"
                        ? "dashboard-card-activity-dot-red"
                        : "dashboard-card-activity-dot-green"
                    }`}
                  ></div>
                  <div className="dashboard-card-activity-content">
                    <span className="dashboard-card-activity-text">
                      {activity.text}
                    </span>
                    <span className="dashboard-card-activity-date">
                      <Calendar size={12} />
                      {formatDate(activity.date)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-card-activity-item">
                <div className="dashboard-card-activity-dot dashboard-card-activity-dot-gray"></div>
                <span className="dashboard-card-activity-text">
                  Aucune activité récente
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
