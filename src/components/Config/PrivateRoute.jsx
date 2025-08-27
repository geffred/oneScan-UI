// src/components/PrivateRoute.js
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const isCabinetDataValid = (cabinetData) => {
  try {
    const data = JSON.parse(cabinetData);
    return data && data.id && data.email;
  } catch {
    return false;
  }
};

const PrivateRoute = ({ requiredUserType = null }) => {
  const token = localStorage.getItem("token");
  const cabinetData = localStorage.getItem("cabinetData");
  const userType = localStorage.getItem("userType");

  // Vérifier l'authentification selon le type d'utilisateur
  let isAuthenticated = false;

  if (userType === "laboratoire" && token) {
    isAuthenticated = isTokenValid(token);
  } else if (userType === "cabinet" && cabinetData) {
    isAuthenticated = isCabinetDataValid(cabinetData);
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si un type d'utilisateur spécifique est requis, le vérifier
  if (requiredUserType && userType !== requiredUserType) {
    // Rediriger vers le dashboard approprié selon le type d'utilisateur
    if (userType === "laboratoire") {
      return <Navigate to="/dashboard/platform" replace />;
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
