// src/components/PrivateRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ requiredUserType = null }) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  // Pendant le chargement, affichez un loader ou null
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si un type d'utilisateur spécifique est requis, le vérifier
  if (requiredUserType && userType !== requiredUserType) {
    // Rediriger vers le dashboard approprié selon le type d'utilisateur
    if (userType === "laboratoire") {
      return <Navigate to="/dashboard/Platform" replace />;
    } else if (userType === "cabinet") {
      return <Navigate to="/dashboard/cabinet" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Composants pour des routes spécifiques
export const LaboratoryPrivateRoute = () => {
  return <PrivateRoute requiredUserType="laboratoire" />;
};

export const CabinetPrivateRoute = () => {
  return <PrivateRoute requiredUserType="cabinet" />;
};

export default PrivateRoute;
