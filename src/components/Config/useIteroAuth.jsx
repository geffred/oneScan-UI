// src/hooks/useIteroAuth.js
import { useState, useEffect, useCallback } from "react";

const useIteroAuth = () => {
  const [authStatus, setAuthStatus] = useState({
    authenticated: false,
    loading: true,
    error: null,
  });

  const [userInfo, setUserInfo] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthStatus({ authenticated: false, loading: false, error: null });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itero/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const status = await response.text();
        const authenticated = status === "Connecté";

        setAuthStatus({
          authenticated,
          loading: false,
          error: null,
        });

        if (authenticated) {
          setUserInfo({
            name: "Utilisateur Itero",
            platform: "ITERO",
          });
        }
      } else {
        setAuthStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de statut",
        });
      }
    } catch (error) {
      setAuthStatus({
        authenticated: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setAuthStatus((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itero/login`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.text();
        await checkAuthStatus();
        return { success: true, message: result };
      } else {
        const error = await response.text();
        setAuthStatus((prev) => ({ ...prev, loading: false, error }));
        return { success: false, message: error };
      }
    } catch (error) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      return { success: false, message: error.message };
    }
  }, [checkAuthStatus]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/itero/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAuthStatus({ authenticated: false, loading: false, error: null });
      setUserInfo(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion Itero:", error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    authStatus,
    userInfo,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: authStatus.authenticated,
    isLoading: authStatus.loading,
  };
};

export default useIteroAuth; // Assurez-vous que c'est bien exporté par défaut
