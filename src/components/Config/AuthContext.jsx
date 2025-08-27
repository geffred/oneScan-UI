// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'laboratoire' ou 'cabinet'
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Vérifier s'il y a un token (laboratoire) ou des données cabinet
    const token = localStorage.getItem("token");
    const cabinetData = localStorage.getItem("cabinetData");
    const storedUserType = localStorage.getItem("userType");

    if (token && storedUserType === "laboratoire") {
      setIsAuthenticated(true);
      setUserType("laboratoire");
      // Décoder le JWT pour récupérer les infos utilisateur
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          email: payload.sub,
          // Ajouter d'autres données du payload si nécessaire
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else if (cabinetData && storedUserType === "cabinet") {
      setIsAuthenticated(true);
      setUserType("cabinet");
      setUserData(JSON.parse(cabinetData));
    }
  }, []);

  const login = (type, data, token = null) => {
    setIsAuthenticated(true);
    setUserType(type);
    localStorage.setItem("userType", type);

    if (type === "laboratoire" && token) {
      localStorage.setItem("token", token);
      // Décoder le token pour récupérer les infos utilisateur
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          email: payload.sub,
          // Ajouter d'autres données du payload si nécessaire
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else if (type === "cabinet" && data) {
      localStorage.setItem("cabinetData", JSON.stringify(data));
      setUserData(data);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("cabinetData");
    localStorage.removeItem("userType");
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userType,
    userData,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
