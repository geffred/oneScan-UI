// src/components/GoogleDrive/GoogleDriveAuthButton.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const GoogleDriveAuthButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/drive/status`,
          {
            withCredentials: true,
          }
        );

        if (response.data.authenticated) {
          setIsAuthenticated(true);
          toast.success("Connecté à Google Drive ✅");
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur statut Google Drive:", error);
        toast.error("Erreur de connexion avec Google Drive ❌");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthClick = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/drive/auth`
      );
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        toast.warn("Aucune URL d'authentification trouvée");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'URL d'authentification:",
        error
      );
      toast.error("Erreur lors de la connexion à Google Drive ❌");
    }
  };

  if (loading) return <p>Vérification de la connexion à Google Drive...</p>;

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {isAuthenticated ? (
        <button
          disabled
          className="bg-green-500 text-white px-5 py-2 rounded-lg shadow-md cursor-not-allowed"
        >
          ✅ Connecté à Google Drive
        </button>
      ) : (
        <button
          onClick={handleAuthClick}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          🔗 Se connecter à Google Drive
        </button>
      )}
    </div>
  );
};

export default GoogleDriveAuthButton;
