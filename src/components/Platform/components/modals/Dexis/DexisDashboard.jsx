import React, { useState, useCallback, useEffect } from "react";
import {
  Link2,
  Activity,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogOut,
  Server,
  Info,
} from "lucide-react";
import useDexisAuth from "../../../../../components/Config/useDexisAuth";
import "./DexisDashboard.css";

const DexisDashboard = () => {
  const {
    authStatus,
    isAuthenticated,
    isLoading,
    error,
    initiateAuth,
    logout,
    mutateAuth,
    testConnection,
  } = useDexisAuth({ refreshInterval: 5000 });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Handler de Test
  const handleTestConnection = useCallback(async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await testConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  }, [testConnection]);

  // Handler de Connexion
  const handleConnect = async () => {
    await initiateAuth();
  };

  // Écouter les messages de succès OAuth - UNIQUEMENT pour rafraîchir le statut
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "DEXIS_AUTH_SUCCESS") {
        console.log("Message DEXIS reçu - rafraîchissement du statut...");

        // Attendre 1 seconde pour que le backend persiste le token
        setTimeout(() => {
          mutateAuth(); // Rafraîchir le statut seulement, sans ouvrir de dashboard
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mutateAuth]);

  return (
    <div className="dexis-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <Link2 size={28} className="dexis-icon" />
          <div>
            <h1>Tableau de bord Dexis</h1>
            <p className="header-subtitle">
              Gestion de la connexion API et synchronisation
            </p>
          </div>
        </div>

        <div
          className={`dexis-dashboard-status ${isAuthenticated ? "connected" : "disconnected"}`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={16} /> Vérification...
            </>
          ) : isAuthenticated ? (
            <>
              <CheckCircle size={16} /> Connecté
            </>
          ) : (
            <>
              <AlertCircle size={16} /> Non connecté
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="dexis-dashboard-error">
          <AlertCircle size={20} />
          <span>
            {typeof error === "string" ? error : "Une erreur est survenue"}
          </span>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dexis-dashboard-card">
            <div className="card-header">
              <Activity size={20} />
              <h3>État de l'Authentification</h3>
            </div>
            <div className="card-content">
              <div className="auth-details">
                <div className="auth-field">
                  <label>Session :</label>
                  <span
                    className={`status-badge ${isAuthenticated ? "authenticated" : "not-authenticated"}`}
                  >
                    {isAuthenticated ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="auth-field">
                  <label>API Key :</label>
                  <span className="status-badge has-token">
                    Configurée (Backend)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dexis-dashboard-card">
            <div className="card-header">
              <Server size={20} />
              <h3>Test de Connexion</h3>
            </div>
            <div className="card-content">
              <div className="test-section">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !isAuthenticated}
                  className="dexis-btn test-btn"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> Test en
                      cours...
                    </>
                  ) : (
                    <>
                      <Activity size={18} /> Tester l'accès aux cas
                    </>
                  )}
                </button>
                {testResult && (
                  <div
                    className={`test-result ${testResult.success ? "success" : "error"}`}
                  >
                    {testResult.success ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>
                      {testResult.success
                        ? "Accès API validé"
                        : `Erreur: ${testResult.error}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dexis-dashboard-card">
            <div className="card-header">
              <Database size={20} />
              <h3>Actions</h3>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                {!isAuthenticated ? (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="dexis-btn primary"
                  >
                    <Link2 size={18} /> Se connecter à Dexis
                  </button>
                ) : (
                  <button onClick={logout} className="dexis-btn danger">
                    <LogOut size={18} /> Déconnexion
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="dashboard-footer">
          <div className="footer-info">
            <Info size={16} />
            <span>
              La synchronisation des commandes Dexis se fait automatiquement
              toutes les 10 minutes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DexisDashboard;
