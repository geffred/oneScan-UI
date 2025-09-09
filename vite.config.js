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

      // Routes d'authentification laboratoire
      "/api/auth/register": "http://localhost:8080",
      "/api/auth/login": "http://localhost:8080",
      "/api/auth/logout": "http://localhost:8080",
      "/api/auth/user": "http://localhost:8080",
      "/api/auth/update": "http://localhost:8080",
      "/api/auth/delete": "http://localhost:8080",
      "/api/auth/me": "http://localhost:8080",

      // Routes Cabinet - CRUD
      "/api/cabinet": "http://localhost:8080",
      "/api/cabinet/": "http://localhost:8080", // Pour les routes avec ID
      "/api/cabinet/nom": "http://localhost:8080",
      "/api/cabinet/*/mark-password-sent": "http://localhost:8080",

      // Routes Cabinet - Authentification
      "/api/cabinet/auth/login": "http://localhost:8080",
      "/api/cabinet/auth/logout": "http://localhost:8080",
      "/api/cabinet/auth/profile": "http://localhost:8080",
      "/api/cabinet/auth/change-password": "http://localhost:8080",

      // Routes Cabinet - Gestion mot de passe
      "/api/cabinet/*/regenerate-password": "http://localhost:8080",

      // Routes plateforme
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

      // Intelligence artificielle
      "/deepseek": "http://localhost:8080",

      // Cases
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

      // Routes pour les vues
      "/api/public/commandes/*/notification": "http://localhost:8080",
      "/api/public/commandes/*/notification/sent": "http://localhost:8080",
      "/api/public/commandes/*/vu": "http://localhost:8080",

      // ==================== ROUTES APPAREILS ====================

      // Routes Appareil - CRUD
      "/api/appareils": "http://localhost:8080",
      "/api/appareils/": "http://localhost:8080", // Pour les routes avec ID
      "/api/appareils/user/": "http://localhost:8080", // Appareils par utilisateur
      "/api/appareils/count": "http://localhost:8080", // Comptage total
      "/api/appareils/count/user/": "http://localhost:8080", // Comptage par utilisateur
      "/api/appareils/*/exists": "http://localhost:8080", // Vérifier existence

      // Routes Images - Upload et gestion
      "/api/images": "http://localhost:8080",
      "/api/images/": "http://localhost:8080", // Pour récupérer une image spécifique
      "/api/images/upload/": "http://localhost:8080", // Upload simple
      "/api/images/upload-multiple/": "http://localhost:8080", // Upload multiple
      "/api/images/appareil/": "http://localhost:8080", // Images par appareil

      // ==================== ROUTES MEDITLINK OAUTH2 ====================

      // Authentification OAuth2
      "/api/meditlink/auth/login": "http://localhost:8080", // Initiation OAuth2 MeditLink
      "/api/meditlink/auth/callback": "http://localhost:8080", // Callback OAuth2 MeditLink
      "/api/meditlink/auth/status": "http://localhost:8080", // Statut authentification MeditLink
      "/api/meditlink/auth/refresh": "http://localhost:8080", // Rafraîchissement token MeditLink
      "/api/meditlink/auth/logout": "http://localhost:8080", // Déconnexion MeditLink
      "/api/meditlink/auth/token-debug": "http://localhost:8080", // Debug token MeditLink

      // Routes utilisateur
      "/api/meditlink/user/me": "http://localhost:8080", // Infos utilisateur connecté

      // ==================== ROUTES CAS MEDITLINK ====================

      "/api/meditlink/cases": "http://localhost:8080", // Liste des cas
      "/api/meditlink/cases/save": "http://localhost:8080", // Sauvegarde des cas
      "/api/meditlink/orders/": "http://localhost:8080", // Commande spécifique par numéro
      "/api/meditlink/files/": "http://localhost:8080", // Fichier spécifique par UUID
    },
  },
});
