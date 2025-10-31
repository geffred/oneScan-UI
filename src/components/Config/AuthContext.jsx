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
  const APP_VERSION = "v1.0.0.2"; // Change à chaque release

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(() => {
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");

    if (!token || !storedUserType) return false;

    try {
      const decoded = jwtDecode(token);
      setIsAuthenticated(true);
      setUserType(storedUserType);

      if (storedUserType === "laboratoire") {
        setUserData({ email: decoded.sub, role: "laboratoire" });
      } else if (storedUserType === "cabinet") {
        setUserData({
          id: decoded.cabinetId,
          email: decoded.sub,
          nom: decoded.cabinetNom,
          role: "cabinet",
        });
      }
      return true;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      return false;
    }
  }, []);

  useEffect(() => {
    restoreSession();
    setIsLoading(false);
  }, [restoreSession]);

  // ⚙️ Gestion de version (ne supprime plus tout localStorage)
  useEffect(() => {
    const storedVersion = localStorage.getItem("app_version");
    if (storedVersion !== APP_VERSION) {
      console.log("Nouvelle version détectée — réinitialisation sécurisée");
      localStorage.setItem("app_version", APP_VERSION);
    }
  }, [APP_VERSION]);

  const login = useCallback((type, cabinetData = null, token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      localStorage.setItem("userType", type);

      setIsAuthenticated(true);
      setUserType(type);
      setUserData({
        id: decoded.cabinetId || cabinetData?.id,
        email: decoded.sub,
        nom: decoded.cabinetNom || cabinetData?.nom,
        role: type,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        userData,
        isLoading,
        login,
        logout,
        checkTokenValidity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
