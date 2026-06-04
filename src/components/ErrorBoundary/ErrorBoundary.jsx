/* eslint-disable react/prop-types */
import React from "react";

/**
 * ErrorBoundary global : empêche qu'une erreur de rendu (ex. donnée plateforme
 * inattendue après un retour OAuth) ne blanchisse toute l'application.
 *
 * IMPORTANT : ce composant NE touche PAS à l'authentification (il ne supprime
 * jamais le token). L'utilisateur reste connecté ; on lui propose simplement de
 * recharger ou de revenir au tableau de bord.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log pour le diagnostic ; pas de déconnexion.
    console.error("Erreur de rendu interceptée par ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard/platform";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#1e293b",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
          Une erreur inattendue est survenue
        </h1>
        <p style={{ color: "#64748b", maxWidth: 480 }}>
          {
            "L'affichage a rencontré un problème, mais vous restez connecté. Vous pouvez recharger la page ou revenir au tableau de bord."
          }
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={this.handleReload}
            style={{
              background: "#007AFF",
              color: "white",
              border: "none",
              padding: "0.75rem 1.25rem",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recharger la page
          </button>
          <button
            onClick={this.handleHome}
            style={{
              background: "white",
              color: "#007AFF",
              border: "1px solid #007AFF",
              padding: "0.75rem 1.25rem",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tableau de bord
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
