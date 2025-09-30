import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const storedUserType = localStorage.getItem("userType");

      if (token && storedUserType) {
        try {
          const decoded = jwtDecode(token);

          // Vérifier si le token n'est pas expiré
          if (decoded.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            setUserType(storedUserType);

            // Extraire les données selon le type d'utilisateur
            if (storedUserType === "laboratoire") {
              setUserData({
                email: decoded.sub,
                role: "laboratoire",
              });
            } else if (storedUserType === "cabinet") {
              setUserData({
                id: decoded.cabinetId,
                email: decoded.sub,
                nom: decoded.cabinetNom,
                role: "cabinet",
              });
            }
          } else {
            // Token expiré
            console.log("Token expiré");
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (type, cabinetData = null, token) => {
    if (!token) {
      console.error("Token manquant lors de la connexion");
      return;
    }

    setIsAuthenticated(true);
    setUserType(type);
    localStorage.setItem("userType", type);
    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);

      if (type === "laboratoire") {
        setUserData({
          email: decoded.sub,
          role: "laboratoire",
        });
      } else if (type === "cabinet") {
        setUserData({
          id: decoded.cabinetId || cabinetData?.id,
          email: decoded.sub,
          nom: decoded.cabinetNom || cabinetData?.nom,
          role: "cabinet",
        });
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
  };

  // Fonction pour vérifier si le token est toujours valide
  const checkTokenValidity = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userType,
    userData,
    isLoading,
    login,
    logout,
    checkTokenValidity,
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
