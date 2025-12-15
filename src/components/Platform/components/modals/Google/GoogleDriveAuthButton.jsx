// src/components/GoogleDrive/GoogleDriveAuthButton.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Cloud, CheckCircle, Loader } from "lucide-react";

const GoogleDriveAuthButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authPopupRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Fonction pour vérifier le statut d'authentification
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/drive/status`,
        { withCredentials: true }
      );

      const nowAuthenticated = response.data.authenticated;

      setIsAuthenticated((prevAuth) => {
        // Si l'authentification vient de réussir, afficher un toast
        if (!prevAuth && nowAuthenticated) {
          toast.success("Connecté à Google Drive avec succès");
        }
        return nowAuthenticated;
      });

      return nowAuthenticated;
    } catch (error) {
      console.error("Erreur statut Google Drive:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances car on utilise setIsAuthenticated en mode callback

  // Vérification initiale au montage
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listener pour les messages postMessage du callback
  useEffect(() => {
    const handleAuthMessage = async (event) => {
      // Sécurité : vérifier l'origine
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type } = event.data;

      if (type === "GOOGLE_DRIVE_AUTH_SUCCESS") {
        console.log("Message de succès reçu du callback");

        // Arrêter la vérification périodique si active
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // Attendre que le backend finalise (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Vérifier immédiatement le nouveau statut
        const authenticated = await checkAuthStatus();

        if (authenticated) {
          setIsAuthenticating(false);
        } else {
          // Si pas encore authentifié, réessayer après 1 seconde
          console.log("Pas encore authentifié, nouvelle tentative...");
          setTimeout(async () => {
            await checkAuthStatus();
            setIsAuthenticating(false);
          }, 1000);
        }

        // Fermer la popup si elle existe
        if (authPopupRef.current && !authPopupRef.current.closed) {
          authPopupRef.current.close();
          authPopupRef.current = null;
        }
      } else if (type === "GOOGLE_DRIVE_AUTH_ERROR") {
        console.error("Erreur d'authentification reçue:", event.data.error);
        toast.error(`Erreur : ${event.data.error}`);
        setIsAuthenticating(false);

        // Fermer la popup si elle existe
        if (authPopupRef.current && !authPopupRef.current.closed) {
          authPopupRef.current.close();
          authPopupRef.current = null;
        }

        // Re-vérifier le statut
        await checkAuthStatus();
      }
    };

    window.addEventListener("message", handleAuthMessage);

    return () => {
      window.removeEventListener("message", handleAuthMessage);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkAuthStatus]);

  // Ouvrir la popup d'authentification
  const handleAuthClick = useCallback(async () => {
    try {
      setIsAuthenticating(true);

      // Récupérer l'URL d'authentification
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/drive/auth`,
        { withCredentials: true }
      );

      if (!response.data.authUrl) {
        toast.warn("Aucune URL d'authentification trouvée");
        setIsAuthenticating(false);
        return;
      }

      // Ouvrir dans une popup centrée
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      authPopupRef.current = window.open(
        response.data.authUrl,
        "GoogleDriveAuth",
        `width=${width},height=${height},left=${left},top=${top},popup=yes,toolbar=no,menubar=no`
      );

      if (!authPopupRef.current) {
        toast.error(
          "Impossible d'ouvrir la popup. Autorisez les popups pour ce site."
        );
        setIsAuthenticating(false);
        return;
      }

      // Vérification périodique en backup (au cas où postMessage échoue)
      checkIntervalRef.current = setInterval(async () => {
        // Vérifier si la popup est fermée
        if (authPopupRef.current && authPopupRef.current.closed) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;

          console.log("Popup fermée, vérification du statut...");

          // Attendre un peu pour que le backend finalise
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Vérifier le statut après fermeture de la popup
          const authenticated = await checkAuthStatus();

          if (!authenticated) {
            toast.info("Authentification annulée ou échouée");
          }

          setIsAuthenticating(false);
          authPopupRef.current = null;
        }
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      toast.error("Erreur lors de la connexion à Google Drive");
      setIsAuthenticating(false);
    }
  }, [checkAuthStatus]);

  // Déconnexion
  const handleLogout = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/drive/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsAuthenticated(false);
        toast.success("Déconnecté de Google Drive");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader className="animate-spin" size={20} />
        <span>Vérification de la connexion Google Drive...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2 rounded-lg shadow-md border border-green-200">
            <CheckCircle size={20} />
            <span className="font-medium">Connecté à Google Drive</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-all"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <button
          onClick={handleAuthClick}
          disabled={isAuthenticating}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <Cloud size={20} />
              <span>Se connecter à Google Drive</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default GoogleDriveAuthButton;
