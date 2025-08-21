import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Routes existantes
      "/api/public/commandes": "http://localhost:8080",
      "/api/public/suivi/": "http://localhost:8080",
      "/api/public/commandes/commentaire/": "http://localhost:8080",
      "/api/public/commandes/statut/": "http://localhost:8080",
      "/api/public/commandes/cabinet/": "http://localhost:8080",
      "/api/auth/register": "http://localhost:8080",
      "/api/auth/login": "http://localhost:8080",
      "/api/auth/logout": "http://localhost:8080",
      "/api/auth/user": "http://localhost:8080",
      "/api/auth/update": "http://localhost:8080",
      "/api/auth/delete": "http://localhost:8080",
      "/api/platforms": "http://localhost:8080",
      "/api/meditlink/commandes": "http://localhost:8080",
      "/api/itero/commandes": "http://localhost:8080",
      "/api/threeshape/commandes": "http://localhost:8080",
      "/api/dexis/commandes": "http://localhost:8080",
      "/api/meditlink/commentaire": "http://localhost:8080",
      "/api/meditlink/download/": "http://localhost:8080",
      "/api/itero/download/": "http://localhost:8080",
      "/api/threeshape/download/": "http://localhost:8080",
      "/api/dexis/download/": "http://localhost:8080",
      "/api/itero/commentaire": "http://localhost:8080",
      "/api/itero/update-comments": "http://localhost:8080",
      "/api/cabinet": "http://localhost:8080",
      "/api/cabinet/nom": "http://localhost:8080",
      "/deepseek": "http://localhost:8080",

      "/api/cases/save": "http://localhost:8080",

      // Routes 3Shape existantes (mises à jour)
      "/api/3shape/statut": "http://localhost:8080",
      "/api/3shape/login": "http://localhost:8080",
      "/api/3shape/cases": "http://localhost:8080",

      // Nouvelles routes 3Shape pour l'authentification OAuth
      "/api/login": "http://localhost:8080", // Initiation OAuth 3Shape
      "/api/callback": "http://localhost:8080", // Callback OAuth 3Shape
      "/api/auth/status": "http://localhost:8080", // Statut authentification 3Shape

      // Routes 3Shape pour les données
      "/api/cases": "http://localhost:8080", // Liste des cas
      "/api/cases/": "http://localhost:8080", // Cas spécifique + attachments
      "/api/connections": "http://localhost:8080", // Connexions 3Shape

      // Routes 3Shape pour les recherches
      "/api/cases/search": "http://localhost:8080", // Recherche de cas

      // Routes 3Shape pour les téléchargements
      "/api/cases/*/attachments/*": "http://localhost:8080", // Téléchargement fichiers STL/DCM
    },
  },
});
