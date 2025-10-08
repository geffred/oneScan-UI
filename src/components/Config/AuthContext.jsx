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
  // 🆕 version de l'app — change-la à chaque déploiement sur Railway
  const APP_VERSION = "v1.0.0.1";

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
          console.warn("Token expiré mais session maintenue");
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

  // 🧩 Vérifie la version de l'application (Railway update)
  useEffect(() => {
    const storedVersion = localStorage.getItem("app_version");

    // Si aucune version ou version différente => déconnexion
    if (storedVersion !== APP_VERSION) {
      console.log("Nouvelle version détectée — déconnexion automatique");
      localStorage.clear();
      localStorage.setItem("app_version", APP_VERSION);
      window.location.href = "/";
    } else {
      // Si même version => rien à faire
      localStorage.setItem("app_version", APP_VERSION);
    }
  }, [APP_VERSION]);

  // 🔄 Synchronisation entre onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userType") {
        if (e.newValue === null) {
          setIsAuthenticated(false);
          setUserType(null);
          setUserData(null);
          window.location.href = "/";
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

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
  }, []);

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

  // ⏰ Auto-déconnexion après 24h
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 86400000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, logout]);

  // 🚨 Vérifie régulièrement la présence du token
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token && isAuthenticated) {
        console.warn("Token manquant — déconnexion forcée");
        logout();
        window.location.href = "/";
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

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
