import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(() => {
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");

    if (token && storedUserType) {
      try {
        const decoded = jwtDecode(token);

        // Vérifier si le token n'est pas expiré
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserType(storedUserType);

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
          return true;
        } else {
          // Token expiré - NE PAS nettoyer immédiatement
          // Laisser l'utilisateur continuer à naviguer
          // Le backend gérera l'expiration lors des requêtes
          console.warn("Token expiré mais session maintenue");

          // Garder les données de base pour l'UI
          setIsAuthenticated(true);
          setUserType(storedUserType);

          if (storedUserType === "cabinet") {
            setUserData({
              id: decoded.cabinetId,
              email: decoded.sub,
              nom: decoded.cabinetNom,
              role: "cabinet",
            });
          }
          return true;
        }
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        // En cas d'erreur de décodage, nettoyer
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    restoreSession();
    setIsLoading(false);
  }, [restoreSession]);

  // Synchronisation entre onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userType") {
        if (e.newValue === null) {
          setIsAuthenticated(false);
          setUserType(null);
          setUserData(null);
        } else {
          restoreSession();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [restoreSession]);

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
      console.error("Erreur lors du décodage du token:", error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
  };

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  const refreshSession = useCallback(() => {
    return restoreSession();
  }, [restoreSession]);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userType,
    userData,
    isLoading,
    login,
    logout,
    checkTokenValidity,
    refreshSession,
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
