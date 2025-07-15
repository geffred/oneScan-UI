// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// src/context/AuthContext.js
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(""); // Ajoutez cet état

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")); // Supposons que vous stockez les infos utilisateur
    setIsAuthenticated(!!token);
    if (user) setUserName(user.name); // Mettez à jour le nom
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userName,
        setUserName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
