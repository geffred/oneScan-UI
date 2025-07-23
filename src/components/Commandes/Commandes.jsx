import React, { useState, useEffect, useContext } from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Server,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./commandes.css";

// Fonction fetcher pour SWR
const fetcher = (url) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

const Commandes = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlateforme, setSelectedPlateforme] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userPlatforms, setUserPlatforms] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Mapping des plateformes vers leurs endpoints
  const platformEndpoints = {
    MEDITLINK: "/api/meditlink/commandes",
    ITERO: "/api/itero/commandes",
    THREESHAPE: "/api/threeshape/commandes",
    DEXIS: "/api/dexis-isconnect/commandes",
  };

  // Récupération des données utilisateur
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userEmail = JSON.parse(atob(token.split(".")[1])).sub;

        const response = await fetch(`/api/auth/user/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          err
        );
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Récupération des plateformes de l'utilisateur
  useEffect(() => {
    if (!userData?.id) return;

    const fetchUserPlatforms = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/platforms/user/${userData.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const platforms = await response.json();
          setUserPlatforms(platforms);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des plateformes:", err);
      }
    };

    fetchUserPlatforms();
  }, [userData]);

  // Récupération des données avec SWR
  const {
    data: commandes,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/public/commandes", fetcher);

  // Fonction pour synchroniser les commandes d'une plateforme spécifique
  const syncPlatformCommandes = async (platformName) => {
    const endpoint = platformEndpoints[platformName];
    if (!endpoint) {
      console.error(`Endpoint non trouvé pour la plateforme: ${platformName}`);
      return;
    }

    setSyncStatus((prev) => ({
      ...prev,
      [platformName]: {
        status: "loading",
        message: "Synchronisation en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newCommandes = await response.json();

        // Actualiser les données après synchronisation
        mutate();

        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: {
            status: "success",
            message: `${newCommandes.length || 0} commande(s) récupérée(s)`,
          },
        }));
      } else {
        const errorText = await response.text();
        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: {
            status: "error",
            message:
              response.status === 204
                ? "Aucune nouvelle commande"
                : "Erreur de synchronisation",
          },
        }));
      }
    } catch (err) {
      console.error(`Erreur lors de la synchronisation ${platformName}:`, err);
      setSyncStatus((prev) => ({
        ...prev,
        [platformName]: {
          status: "error",
          message: "Erreur de connexion",
        },
      }));
    }

    // Effacer le statut après 3 secondes
    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[platformName];
        return newStatus;
      });
    }, 3000);
  };

  // Fonction pour synchroniser toutes les plateformes
  const syncAllPlatforms = async () => {
    if (userPlatforms.length === 0) return;

    setIsSyncing(true);

    const syncPromises = userPlatforms.map((platform) =>
      syncPlatformCommandes(platform.name)
    );

    await Promise.all(syncPromises);
    setIsSyncing(false);
  };

  // Gestion des états d'erreur et de chargement
  if (error) {
    return (
      <div className="commandes-card">
        <div className="commandes-error-state">
          <AlertCircle className="commandes-error-icon" size={48} />
          <h3 className="commandes-error-title">Erreur de chargement</h3>
          <p className="commandes-error-message">
            Impossible de récupérer les commandes. Veuillez réessayer.
          </p>
          <button
            className="commandes-btn commandes-btn-primary"
            onClick={() => mutate()}
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="commandes-card">
        <div className="commandes-loading-state">
          <div className="commandes-loading-spinner"></div>
          <p className="commandes-loading-text">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  // Calcul des statistiques
  const totalCommandes = commandes?.length || 0;
  const commandesNonVues = commandes?.filter((cmd) => !cmd.vu).length || 0;
  const commandesEchues =
    commandes?.filter((cmd) => {
      const today = new Date();
      const echeance = new Date(cmd.dateEcheance);
      return echeance < today;
    }).length || 0;

  // Filtrage des commandes
  const filteredCommandes =
    commandes?.filter((commande) => {
      const matchesSearch =
        commande.refPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.cabinet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.externalId?.toString().includes(searchTerm);

      const matchesPlateforme =
        selectedPlateforme === "" || commande.plateforme === selectedPlateforme;
      const matchesUnread = !showOnlyUnread || !commande.vu;

      return matchesSearch && matchesPlateforme && matchesUnread;
    }) || [];

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fonction pour obtenir le statut d'échéance
  const getEcheanceStatus = (dateEcheance) => {
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", label: "Échue", class: "red" };
    if (diffDays <= 3)
      return {
        status: "urgent",
        label: `${diffDays}j restant`,
        class: "yellow",
      };
    return { status: "normal", label: `${diffDays}j restant`, class: "green" };
  };

  // Fonction pour obtenir la couleur de la plateforme
  const getPlateformeColor = (plateforme) => {
    const colors = {
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
    };
    return colors[plateforme] || "gray";
  };

  // Fonction pour obtenir le statut de synchronisation
  const getSyncStatusIcon = (platformName) => {
    const status = syncStatus[platformName];
    if (!status) return null;

    switch (status.status) {
      case "loading":
        return <div className="commandes-sync-spinner"></div>;
      case "success":
        return <CheckCircle size={14} className="commandes-sync-success" />;
      case "error":
        return <AlertCircle size={14} className="commandes-sync-error" />;
      default:
        return null;
    }
  };

  // Fonction pour télécharger une commande
  const handleDownload = async (commande) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/commandes/${commande.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `commande-${commande.externalId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  return (
    <div className="commandes-card">
      <div className="commandes-header">
        <h2 className="commandes-card-title">Gestion des Commandes</h2>
        <div className="commandes-header-actions">
          {userPlatforms.length > 0 && (
            <button
              className="commandes-btn commandes-btn-primary"
              onClick={syncAllPlatforms}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <div className="commandes-loading-spinner commandes-btn-spinner"></div>
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Synchroniser tout
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Section des plateformes utilisateur */}
      {userPlatforms.length > 0 && (
        <div className="commandes-platforms-section">
          <h3 className="commandes-platforms-title">
            <Server size={20} />
            Vos Plateformes
          </h3>
          <div className="commandes-platforms-grid">
            {userPlatforms.map((platform) => {
              const statusInfo = syncStatus[platform.name];
              return (
                <div key={platform.id} className="commandes-platform-card">
                  <div className="commandes-platform-info">
                    <h4 className="commandes-platform-name">{platform.name}</h4>
                    <p className="commandes-platform-email">{platform.email}</p>
                  </div>
                  <div className="commandes-platform-actions">
                    {statusInfo && (
                      <div
                        className={`commandes-sync-status commandes-sync-${statusInfo.status}`}
                      >
                        {getSyncStatusIcon(platform.name)}
                        <span>{statusInfo.message}</span>
                      </div>
                    )}
                    <button
                      className="commandes-btn commandes-btn-secondary"
                      onClick={() => syncPlatformCommandes(platform.name)}
                      disabled={syncStatus[platform.name]?.status === "loading"}
                    >
                      {syncStatus[platform.name]?.status === "loading" ? (
                        <>
                          <Loader2
                            size={14}
                            className="commandes-sync-loading"
                          />
                          Sync...
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Récupérer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="commandes-filters-section">
        <div className="commandes-search-bar">
          <Search className="commandes-search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher par patient, cabinet ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="commandes-search-input"
          />
        </div>

        <div className="commandes-filters">
          <select
            value={selectedPlateforme}
            onChange={(e) => setSelectedPlateforme(e.target.value)}
            className="commandes-filter-select"
          >
            <option value="">Toutes les plateformes</option>
            <option value="MEDITLINK">MeditLink</option>
            <option value="ITERO">Itero</option>
            <option value="THREESHAPE">3Shape</option>
            <option value="DEXIS">Dexis</option>
          </select>

          <label className="commandes-checkbox-filter">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="commandes-checkbox"
            />
            <span>Non vues seulement</span>
          </label>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="commandes-list-section">
        {filteredCommandes.length === 0 ? (
          <div className="commandes-empty-state">
            <FileText className="commandes-empty-icon" size={48} />
            <h3 className="commandes-empty-title">Aucune commande trouvée</h3>
            <p className="commandes-empty-message">
              {commandes?.length === 0
                ? "Aucune commande n'a été créée pour le moment. Utilisez les boutons ci-dessus pour synchroniser vos plateformes."
                : "Aucune commande ne correspond à vos filtres."}
            </p>
          </div>
        ) : (
          <div className="commandes-table">
            <div className="commandes-table-header">
              <div className="commandes-table-cell">ID</div>
              <div className="commandes-table-cell">Patient</div>
              <div className="commandes-table-cell">Cabinet</div>
              <div className="commandes-table-cell">Plateforme</div>
              <div className="commandes-table-cell">Réception</div>
              <div className="commandes-table-cell">Échéance</div>
              <div className="commandes-table-cell">Statut</div>
              <div className="commandes-table-cell">Actions</div>
            </div>

            <div className="commandes-table-body">
              {filteredCommandes.map((commande) => {
                const echeanceStatus = getEcheanceStatus(commande.dateEcheance);
                const plateformeColor = getPlateformeColor(commande.plateforme);

                return (
                  <div
                    key={commande.id}
                    className={`commandes-table-row ${
                      !commande.vu ? "commandes-row-unread" : ""
                    }`}
                  >
                    <div className="commandes-table-cell">
                      <span className="commandes-external-id">
                        #{commande.externalId}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-patient-info">
                        {!commande.vu && (
                          <span className="commandes-unread-badge"></span>
                        )}
                        <span className="commandes-patient-name">
                          {commande.refPatient || "Non spécifié"}
                        </span>
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <span className="commandes-cabinet-name">
                        {commande.cabinet}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <span
                        className={`commandes-plateforme-badge commandes-plateforme-${plateformeColor}`}
                      >
                        {commande.plateforme}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-date-info">
                        <Calendar size={14} />
                        <span>{formatDate(commande.dateReception)}</span>
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-date-info">
                        <Clock size={14} />
                        <span>
                          {commande.dateEcheance != null
                            ? formatDate(commande.dateEcheance)
                            : "Non spécifiée"}
                        </span>
                      </div>
                    </div>

                    <div className="commandes-table-cell">
                      <span
                        className={`commandes-status-badge commandes-status-${echeanceStatus.class}`}
                      >
                        {echeanceStatus.label}
                      </span>
                    </div>

                    <div className="commandes-table-cell">
                      <div className="commandes-actions">
                        <button
                          className="commandes-action-btn commandes-action-download"
                          title="Télécharger la commande"
                          onClick={() => handleDownload(commande)}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="commandes-action-btn commandes-action-view"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination ou résumé */}
      {filteredCommandes.length > 0 && (
        <div className="commandes-footer">
          <p className="commandes-results-count">
            {filteredCommandes.length} commande
            {filteredCommandes.length > 1 ? "s" : ""} affichée
            {filteredCommandes.length > 1 ? "s" : ""}
            {filteredCommandes.length !== totalCommandes &&
              ` sur ${totalCommandes} au total`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Commandes;
