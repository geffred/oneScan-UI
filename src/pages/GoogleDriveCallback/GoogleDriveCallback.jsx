import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const GoogleDriveCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Chargement en cours...");

  useEffect(() => {
    const success = params.get("success");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (success === "true") {
      toast.success("Connexion à Google Drive réussie ✅");
      setStatus("Connexion réussie ! Redirection vers le tableau de bord...");
      // Redirection vers la page souhaitée après succès
      setTimeout(() => navigate("/dashboard/commandes"), 2000);
    } else if (error) {
      // Si une erreur est renvoyée depuis Google
      toast.error(`Erreur Google Drive : ${errorDescription || error}`);
      setStatus("Erreur d'authentification Google Drive ❌");
      setTimeout(() => navigate("/compte"), 2500);
    } else {
      // Cas où le backend n’a pas renvoyé de paramètres (pas de code ou erreur serveur)
      toast.warn("Aucune information d'authentification reçue.");
      setStatus("Redirection vers votre compte...");
      setTimeout(() => navigate("/compte"), 2000);
    }
  }, [params, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3 text-blue-600">
          Authentification Google Drive
        </h2>
        <p>{status}</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveCallback;
