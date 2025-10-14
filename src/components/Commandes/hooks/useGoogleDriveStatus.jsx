import { useState, useCallback, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGoogleDriveStatus = (isAuthenticated) => {
  const [googleDriveStatus, setGoogleDriveStatus] = useState({
    authenticated: false,
    loading: false,
    error: null,
  });

  const checkGoogleDriveStatus = useCallback(async () => {
    try {
      setGoogleDriveStatus((prev) => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem("token");
      if (!token) {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/drive/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleDriveStatus({
          authenticated: data.authenticated || false,
          loading: false,
          error: null,
        });
      } else if (response.status === 401) {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: null,
        });
      } else {
        setGoogleDriveStatus({
          authenticated: false,
          loading: false,
          error: "Erreur de vérification",
        });
      }
    } catch (error) {
      setGoogleDriveStatus({
        authenticated: false,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  // Vérifier le statut Google Drive au chargement
  useEffect(() => {
    if (isAuthenticated) {
      checkGoogleDriveStatus();
    }
  }, [isAuthenticated, checkGoogleDriveStatus]);

  return googleDriveStatus;
};

export default useGoogleDriveStatus;
