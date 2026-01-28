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
import useThreeShapeAuth from "../../../Config/useThreeShapeAuth";
import "./ThreeShapeDashboard.css";

const ThreeShapeDashboard = () => {
  const {
    authStatus,
    isAuthenticated,
    isLoading,
    error,
    hasToken,
    initiateAuth,
    logout,
    mutateAuth,
  } = useThreeShapeAuth({ refreshInterval: 5000 });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Handler de Test de connexion
  const handleTestConnection = useCallback(async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: data.authenticated,
          error: data.authenticated ? null : "Non authentifié",
        });
      } else {
        setTestResult({ success: false, error: "Erreur de connexion" });
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Handler de Connexion
  const handleConnect = async () => {
    await initiateAuth();
  };

  // Handler de Déconnexion
  const handleLogout = async () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir vous déconnecter de 3Shape ?")
    ) {
      await logout();
    }
  };

  // Écouter les messages de succès OAuth
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "THREESHAPE_AUTH_SUCCESS") {
        console.log("Message 3Shape reçu - rafraîchissement du statut...");

        // Attendre 1 seconde pour que le backend persiste le token
        setTimeout(() => {
          mutateAuth();
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mutateAuth]);

  return (
    <div className="threeshape-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <Link2 size={28} className="threeshape-icon" />
          <div>
            <h1>Tableau de bord 3Shape</h1>
            <p className="header-subtitle">
              Gestion de la connexion OAuth et synchronisation
            </p>
          </div>
        </div>

        <div
          className={`threeshape-dashboard-status ${isAuthenticated ? "connected" : "disconnected"}`}
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
        <div className="threeshape-dashboard-error">
          <AlertCircle size={20} />
          <span>
            {typeof error === "string" ? error : "Une erreur est survenue"}
          </span>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Carte 1: Statut Auth */}
          <div className="threeshape-dashboard-card">
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
                  <label>Token :</label>
                  <span
                    className={`status-badge ${hasToken ? "has-token" : "no-token"}`}
                  >
                    {hasToken ? "Présent" : "Absent"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 2: Test Connexion */}
          <div className="threeshape-dashboard-card">
            <div className="card-header">
              <Server size={20} />
              <h3>Test de Connexion</h3>
            </div>
            <div className="card-content">
              <div className="test-section">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !isAuthenticated}
                  className="threeshape-btn test-btn"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> Test en
                      cours...
                    </>
                  ) : (
                    <>
                      <Activity size={18} /> Tester l'accès 3Shape
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

          {/* Carte 3: Actions */}
          <div className="threeshape-dashboard-card">
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
                    className="threeshape-btn primary"
                  >
                    <Link2 size={18} /> Se connecter à 3Shape
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="threeshape-btn danger"
                  >
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
              La synchronisation des cas 3Shape se fait automatiquement toutes
              les 10 minutes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeShapeDashboard;
