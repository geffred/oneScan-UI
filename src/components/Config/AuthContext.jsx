// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // État de chargement

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const cabinetData = localStorage.getItem("cabinetData");
      const storedUserType = localStorage.getItem("userType");

      if (token && storedUserType === "laboratoire") {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            setUserType("laboratoire");
            setUserData({
              email: decoded.sub,
              // autres données...
            });
          } else {
            // Token expiré
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
        }
      } else if (cabinetData && storedUserType === "cabinet") {
        try {
          const data = JSON.parse(cabinetData);
          if (data && data.id && data.email) {
            setIsAuthenticated(true);
            setUserType("cabinet");
            setUserData(data);
          } else {
            // Données cabinet invalides
            localStorage.removeItem("cabinetData");
            localStorage.removeItem("userType");
          }
        } catch (error) {
          console.error("Error parsing cabinet data:", error);
          localStorage.removeItem("cabinetData");
          localStorage.removeItem("userType");
        }
      }

      setIsLoading(false); // Fin du chargement
    };

    initializeAuth();
  }, []);

  const login = (type, data, token = null) => {
    setIsAuthenticated(true);
    setUserType(type);
    localStorage.setItem("userType", type);

    if (type === "laboratoire" && token) {
      localStorage.setItem("token", token);
      try {
        const decoded = jwtDecode(token);
        setUserData({
          email: decoded.sub,
          // autres données...
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
    isLoading, // Exportez l'état de chargement
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
