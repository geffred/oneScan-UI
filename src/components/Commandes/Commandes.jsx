import React, { useState, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Search,
  Filter,
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
  CalendarDays,
  X,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import "./Commandes.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configuration mise en cache
const platformEndpoints = {
  MEDITLINK: `${API_BASE_URL}/meditlink/cases/save`,
  ITERO: `${API_BASE_URL}/itero/commandes`,
  THREESHAPE: `${API_BASE_URL}/cases/save`,
  DEXIS: `${API_BASE_URL}/dexis/commandes`,
};

// Fonction fetcher pour SWR
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Fonction pour récupérer les données utilisateur
const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const userEmail = JSON.parse(atob(token.split(".")[1])).sub;
  return fetchWithAuth(`${API_BASE_URL}/auth/user/${userEmail}`);
};

// Fonction pour récupérer les plateformes d'un utilisateur
const getUserPlatforms = async (userId) => {
  if (!userId) return [];
  return fetchWithAuth(`${API_BASE_URL}/platforms/user/${userId}`);
};

// Fonction pour récupérer les commandes
const getCommandes = async () => {
  return fetchWithAuth(`${API_BASE_URL}/public/commandes`);
};

// Composants optimisés avec React.memo
const CommandeRow = React.memo(({ commande, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEcheanceStatus = (dateEcheance) => {
    if (!dateEcheance)
      return { status: "unknown", label: "Non spécifiée", class: "gray" };

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
    return {
      status: "normal",
      label: `${diffDays}j restant`,
      class: "green",
    };
  };

  const getPlateformeColor = (plateforme) => {
    const colors = {
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
    };
    return colors[plateforme] || "gray";
  };

  const echeanceStatus = getEcheanceStatus(commande.dateEcheance);
  const plateformeColor = getPlateformeColor(commande.plateforme);

  return (
    <div
      className={`commandes-table-row ${
        !commande.vu ? "commandes-row-unread" : ""
      }`}
      onClick={() => onViewDetails(commande)}
      style={{ cursor: "pointer" }}
    >
      <div className="commandes-table-cell" data-label="ID">
        <span className="commandes-external-id">
          #{commande.externalId ? commande.externalId.substring(0, 4) : "N/A"}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Patient">
        <div className="commandes-patient-info">
          {!commande.vu && <span className="commandes-unread-badge"></span>}
          <span className="commandes-patient-name">
            {commande.refPatient || "Non spécifié"}
          </span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Cabinet">
        <span className="commandes-cabinet-name">
          {commande.cabinet || "Non spécifié"}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Plateforme">
        <span
          className={`commandes-plateforme-badge commandes-plateforme-${plateformeColor}`}
        >
          {commande.plateforme}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Réception">
        <div className="commandes-date-info">
          <Calendar size={14} />
          <span>{formatDate(commande.dateReception)}</span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Échéance">
        <div className="commandes-date-info">
          <Clock size={14} />
          <span>
            {commande.dateEcheance != null
              ? formatDate(commande.dateEcheance)
              : "Non spécifiée"}
          </span>
        </div>
      </div>

      <div className="commandes-table-cell" data-label="Statut">
        <span
          className={`commandes-status-badge commandes-status-${echeanceStatus.class}`}
        >
          {echeanceStatus.label}
        </span>
      </div>

      <div className="commandes-table-cell" data-label="Actions">
        <div className="commandes-actions">
          <button
            className={`commandes-action-btn  ${
              !commande.vu ? "commandes-action-view" : ""
            }`}
            title="Voir les détails"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(commande);
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

CommandeRow.displayName = "CommandeRow";

const PlatformCard = React.memo(({ platform, syncStatus, onSync }) => {
  const getSyncStatusIcon = () => {
    if (!syncStatus) return null;

    switch (syncStatus.status) {
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

  return (
    <div className="commandes-platform-card">
      <div className="commandes-platform-info">
        <h4 className="commandes-platform-name">{platform.name}</h4>
        <p className="commandes-platform-email">{platform.email}</p>
      </div>
      <div className="commandes-platform-actions">
        {syncStatus && (
          <div
            className={`commandes-sync-status commandes-sync-${syncStatus.status}`}
          >
            {getSyncStatusIcon()}
            <span>{syncStatus.message}</span>
          </div>
        )}
        <button
          className="commandes-btn commandes-btn-secondary"
          onClick={() => onSync(platform.name)}
          disabled={syncStatus?.status === "loading"}
        >
          {syncStatus?.status === "loading" ? (
            <>
              <Loader2 size={14} className="commandes-sync-loading" />
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
});

PlatformCard.displayName = "PlatformCard";

const LoadingState = React.memo(() => (
  <div className="commandes-loading-state">
    <div className="commandes-loading-spinner"></div>
    <p className="commandes-loading-text">Chargement des commandes...</p>
  </div>
));

LoadingState.displayName = "LoadingState";

const ErrorState = React.memo(({ onRetry }) => (
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
));

ErrorState.displayName = "ErrorState";

const Commandes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlateforme, setSelectedPlateforme] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [syncStatus, setSyncStatus] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  // SWR hooks pour les données
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(isAuthenticated ? "user-data" : null, getUserData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
  });

  const {
    data: userPlatforms = [],
    error: platformsError,
    isLoading: platformsLoading,
  } = useSWR(
    userData?.id ? `platforms-${userData.id}` : null,
    () => getUserPlatforms(userData.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  const {
    data: commandes = [],
    error: commandesError,
    isLoading: commandesLoading,
    mutate: mutateCommandes,
  } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/public/commandes` : null,
    getCommandes,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Rafraîchir toutes les minutes
      errorRetryCount: 3,
    }
  );

  // Fonction pour calculer les dates des 5 derniers jours en millisecondes
  const getLast5DaysTimestamps = useCallback(() => {
    const now = new Date();
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 5);
    startDate.setHours(0, 0, 0, 0);

    return {
      start: startDate.getTime(),
      end: endDate.getTime(),
    };
  }, []);

  // Fonction pour synchroniser les commandes MeditLink avec les 5 derniers jours
  const syncMeditLinkCommandes = useCallback(async () => {
    const timestamps = getLast5DaysTimestamps();
    const endpoint = `${API_BASE_URL}/meditlink/cases/save?page=0&size=20&start=${timestamps.start}&end=${timestamps.end}`;

    setSyncStatus((prev) => ({
      ...prev,
      MEDITLINK: {
        status: "loading",
        message: "Synchronisation MeditLink en cours...",
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();

        // Actualiser les données après synchronisation
        mutateCommandes();

        setSyncStatus((prev) => ({
          ...prev,
          MEDITLINK: {
            status: "success",
            message: "Synchronisation MeditLink réussie",
          },
        }));

        // Notification Toastify pour succès
        toast.success("MeditLink synchronisée avec succès (5 derniers jours)", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const errorText = await response.text();
        setSyncStatus((prev) => ({
          ...prev,
          MEDITLINK: {
            status: "error",
            message: "Erreur de synchronisation MeditLink",
          },
        }));

        // Notification Toastify pour erreur
        toast.error("❌ Erreur lors de la synchronisation MeditLink", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation MeditLink:", err);
      setSyncStatus((prev) => ({
        ...prev,
        MEDITLINK: {
          status: "error",
          message: "Erreur de connexion MeditLink",
        },
      }));

      // Notification Toastify pour erreur de connexion
      toast.error(" Erreur de connexion avec MeditLink", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Effacer le statut après 3 secondes
    setTimeout(() => {
      setSyncStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus.MEDITLINK;
        return newStatus;
      });
    }, 3000);
  }, [getLast5DaysTimestamps, mutateCommandes]);

  // Fonction pour synchroniser les autres plateformes (3Shape, Itero, Dexis)
  const syncOtherPlatform = useCallback(
    async (platformName) => {
      const endpoint = platformEndpoints[platformName];
      if (!endpoint) {
        console.error(
          `Endpoint non trouvé pour la plateforme: ${platformName}`
        );
        return;
      }

      setSyncStatus((prev) => ({
        ...prev,
        [platformName]: {
          status: "loading",
          message: `Synchronisation ${platformName} en cours...`,
        },
      }));

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();

          // Actualiser les données après synchronisation
          mutateCommandes();

          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "success",
              message: `Synchronisation ${platformName} réussie`,
            },
          }));

          // Notification Toastify pour succès
          toast.success(`${platformName} synchronisée avec succès`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          const errorText = await response.text();
          setSyncStatus((prev) => ({
            ...prev,
            [platformName]: {
              status: "error",
              message: `Erreur de synchronisation ${platformName}`,
            },
          }));

          // Notification Toastify pour erreur
          toast.error(`❌ Erreur lors de la synchronisation ${platformName}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (err) {
        console.error(
          `Erreur lors de la synchronisation ${platformName}:`,
          err
        );
        setSyncStatus((prev) => ({
          ...prev,
          [platformName]: {
            status: "error",
            message: `Erreur de connexion ${platformName}`,
          },
        }));

        // Notification Toastify pour erreur de connexion
        toast.error(` Erreur de connexion avec ${platformName}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Effacer le statut après 3 secondes
      setTimeout(() => {
        setSyncStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[platformName];
          return newStatus;
        });
      }, 3000);
    },
    [mutateCommandes]
  );

  // Fonction pour synchroniser toutes les plateformes
  const syncAllPlatforms = useCallback(async () => {
    if (userPlatforms.length === 0) return;

    setIsSyncing(true);

    const syncPromises = userPlatforms.map((platform) => {
      if (platform.name === "MEDITLINK") {
        return syncMeditLinkCommandes();
      } else {
        return syncOtherPlatform(platform.name);
      }
    });

    await Promise.all(syncPromises);
    setIsSyncing(false);

    // Notification pour synchronisation globale
    toast.success("Toutes les plateformes synchronisées", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, [userPlatforms, syncMeditLinkCommandes, syncOtherPlatform]);

  // Fonction pour synchroniser une plateforme spécifique
  const syncPlatformCommandes = useCallback(
    (platformName) => {
      if (platformName === "MEDITLINK") {
        return syncMeditLinkCommandes();
      } else {
        return syncOtherPlatform(platformName);
      }
    },
    [syncMeditLinkCommandes, syncOtherPlatform]
  );

  // Fonction pour filtrer par date
  const filterByDate = useCallback(
    (commande) => {
      if (!commande.dateReception) return false;

      const receptionDate = new Date(commande.dateReception);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return receptionDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return receptionDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return receptionDate >= monthAgo;
        case "custom":
          if (!customDateFrom && !customDateTo) return true;
          const fromDate = customDateFrom
            ? new Date(customDateFrom)
            : new Date(0);
          const toDate = customDateTo ? new Date(customDateTo) : new Date();
          return receptionDate >= fromDate && receptionDate <= toDate;
        default:
          return true;
      }
    },
    [dateFilter, customDateFrom, customDateTo]
  );

  // Fonction pour voir les détails d'une commande
  const handleViewDetails = useCallback(
    (commande) => {
      navigate(`/dashboard/commande/${commande.externalId}`, {
        state: { commande },
      });
    },
    [navigate]
  );

  // Handlers pour les filtres
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePlateformeChange = useCallback((e) => {
    setSelectedPlateforme(e.target.value);
  }, []);

  const handleDateFilterChange = useCallback((e) => {
    setDateFilter(e.target.value);
  }, []);

  const handleUnreadToggle = useCallback((e) => {
    setShowOnlyUnread(e.target.checked);
  }, []);

  // Calcul des statistiques mémorisées
  const stats = useMemo(() => {
    const totalCommandes = commandes?.length || 0;
    const commandesNonVues = commandes?.filter((cmd) => !cmd.vu).length || 0;
    const commandesEchues =
      commandes?.filter((cmd) => {
        if (!cmd.dateEcheance) return false;
        const today = new Date();
        const echeance = new Date(cmd.dateEcheance);
        return echeance < today;
      }).length || 0;

    return { totalCommandes, commandesNonVues, commandesEchues };
  }, [commandes]);

  // Filtrage et tri des commandes mémorisés
  const filteredCommandes = useMemo(() => {
    return (
      commandes
        ?.filter((commande) => {
          const matchesSearch =
            commande.refPatient
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            commande.cabinet
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            commande.externalId?.toString().includes(searchTerm);

          const matchesPlateforme =
            selectedPlateforme === "" ||
            commande.plateforme === selectedPlateforme;
          const matchesUnread = !showOnlyUnread || !commande.vu;
          const matchesDate = filterByDate(commande);

          return (
            matchesSearch && matchesPlateforme && matchesUnread && matchesDate
          );
        })
        .sort(
          (a, b) =>
            new Date(b.dateReception || 0) - new Date(a.dateReception || 0)
        ) || []
    );
  }, [commandes, searchTerm, selectedPlateforme, showOnlyUnread, filterByDate]);

  // Redirection si non authentifié
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Gestion des erreurs
  if (commandesError) {
    return (
      <div className="commandes-card">
        <ErrorState onRetry={() => mutateCommandes()} />
      </div>
    );
  }

  if (commandesLoading) {
    return (
      <div className="commandes-card">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="commandes-card">
      {/* Container Toastify pour les notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="commandes-header">
        <div className="commandes-header-content">
          <h2 className="commandes-card-title">Gestion des Commandes</h2>
          <div className="commandes-stats">
            <div className="commandes-stat">
              <span className="commandes-stat-number">
                {stats.totalCommandes}
              </span>
              <span className="commandes-stat-label">Total</span>
            </div>
            <div className="commandes-stat">
              <span className="commandes-stat-number commandes-stat-unread">
                {stats.commandesNonVues}
              </span>
              <span className="commandes-stat-label">Non vues</span>
            </div>
            <div className="commandes-stat">
              <span className="commandes-stat-number commandes-stat-overdue">
                {stats.commandesEchues}
              </span>
              <span className="commandes-stat-label">Échues</span>
            </div>
          </div>
        </div>
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
            {userPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                syncStatus={syncStatus[platform.name]}
                onSync={syncPlatformCommandes}
              />
            ))}
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
            onChange={handleSearchChange}
            className="commandes-search-input"
          />
        </div>

        <div className="commandes-filters">
          <div className="commandes-filter-group">
            <select
              value={selectedPlateforme}
              onChange={handlePlateformeChange}
              className="commandes-filter-select"
            >
              <option value="">Toutes les plateformes</option>
              <option value="MEDITLINK">MeditLink</option>
              <option value="ITERO">Itero</option>
              <option value="THREESHAPE">3Shape</option>
              <option value="DEXIS">Dexis</option>
            </select>
          </div>

          <div className="commandes-filter-group">
            <CalendarDays size={16} />
            <select
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="commandes-filter-select"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div className="commandes-date-range">
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="commandes-date-input"
                placeholder="Du"
              />
              <span className="commandes-date-separator">au</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="commandes-date-input"
                placeholder="Au"
              />
            </div>
          )}

          <label className="commandes-checkbox-filter">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={handleUnreadToggle}
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
              {filteredCommandes.map((commande) => (
                <CommandeRow
                  key={commande.id}
                  commande={commande}
                  onViewDetails={handleViewDetails}
                />
              ))}
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
            {filteredCommandes.length !== stats.totalCommandes &&
              ` sur ${stats.totalCommandes} au total`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Commandes;
