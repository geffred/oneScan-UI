import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode (dev, prod, etc.)
  const env = loadEnv(mode, process.cwd());

  // Déterminer l'URL de base de l'API selon l'environnement
  const isProduction = mode === "production";
  const API_BASE_URL = isProduction
    ? env.production.VITE_API_BASE_URL
    : env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Routes publiques commandes
        "/api/public/commandes": API_BASE_URL,
        "/api/public/suivi/": API_BASE_URL,
        "/api/public/commandes/commentaire/": API_BASE_URL,
        "/api/public/commandes/statut/": API_BASE_URL,
        "/api/public/commandes/cabinet/": API_BASE_URL,

        // Routes d'authentification laboratoire
        "/api/auth/register": API_BASE_URL,
        "/api/auth/login": API_BASE_URL,
        "/api/auth/logout": API_BASE_URL,
        "/api/auth/user/": API_BASE_URL,
        "/api/auth/update": API_BASE_URL,
        "/api/auth/delete": API_BASE_URL,
        "/api/auth/me": API_BASE_URL,

        // Routes Cabinet - CRUD
        "/api/cabinet": API_BASE_URL,
        "/api/cabinet/": API_BASE_URL,
        "/api/cabinet/nom": API_BASE_URL,
        "/api/cabinet/*/mark-password-sent": API_BASE_URL,

        // Routes Cabinet - Authentification
        "/api/cabinet/auth/login": API_BASE_URL,
        "/api/cabinet/auth/logout": API_BASE_URL,
        "/api/cabinet/auth/profile": API_BASE_URL,
        "/api/cabinet/auth/change-password": API_BASE_URL,

        // Routes Cabinet - Gestion mot de passe
        "/api/cabinet/*/regenerate-password": API_BASE_URL,

        // Routes plateformes
        "/api/platforms": API_BASE_URL,
        "/api/meditlink/commandes": API_BASE_URL,
        "/api/itero/commandes": API_BASE_URL,
        "/api/threeshape/commandes": API_BASE_URL,
        "/api/dexis/commandes": API_BASE_URL,
        "/api/meditlink/commentaire": API_BASE_URL,
        "/api/meditlink/download/": API_BASE_URL,
        "/api/itero/download/": API_BASE_URL,
        "/api/threeshape/download/": API_BASE_URL,
        "/api/dexis/download/": API_BASE_URL,
        "/api/itero/commentaire": API_BASE_URL,
        "/api/itero/update-comments": API_BASE_URL,

        // Intelligence artificielle
        "/deepseek": API_BASE_URL,

        // Cases
        "/api/cases/save": API_BASE_URL,

        // Routes 3Shape
        "/api/3shape/statut": API_BASE_URL,
        "/api/3shape/login": API_BASE_URL,
        "/api/3shape/cases": API_BASE_URL,

        // Authentification OAuth 3Shape
        "/api/login": API_BASE_URL,
        "/api/callback": API_BASE_URL,
        "/api/auth/status": API_BASE_URL,

        // Routes 3Shape données
        "/api/cases": API_BASE_URL,
        "/api/cases/": API_BASE_URL,
        "/api/connections": API_BASE_URL,

        // Routes 3Shape recherches
        "/api/cases/search": API_BASE_URL,

        // Routes 3Shape téléchargements
        "/api/cases/*/attachments/*": API_BASE_URL,

        // Routes vues
        "/api/public/commandes/*/notification": API_BASE_URL,
        "/api/public/commandes/*/notification/sent": API_BASE_URL,
        "/api/public/commandes/*/vu": API_BASE_URL,

        // ==================== ROUTES APPAREILS ====================
        "/api/appareils": API_BASE_URL,
        "/api/appareils/": API_BASE_URL,
        "/api/appareils/user/": API_BASE_URL,
        "/api/appareils/count": API_BASE_URL,
        "/api/appareils/count/user/": API_BASE_URL,
        "/api/appareils/*/exists": API_BASE_URL,

        // Routes Images
        "/api/images": API_BASE_URL,
        "/api/images/": API_BASE_URL,
        "/api/images/upload/": API_BASE_URL,
        "/api/images/upload-multiple/": API_BASE_URL,
        "/api/images/appareil/": API_BASE_URL,

        // ==================== ROUTES MEDITLINK OAUTH2 ====================
        "/api/meditlink/auth/login": API_BASE_URL,
        "/api/meditlink/auth/callback": API_BASE_URL,
        "/api/meditlink/auth/status": API_BASE_URL,
        "/api/meditlink/auth/refresh": API_BASE_URL,
        "/api/meditlink/auth/logout": API_BASE_URL,
        "/api/meditlink/auth/token-debug": API_BASE_URL,

        // Routes utilisateur MeditLink
        "/api/meditlink/user/me": API_BASE_URL,

        // ==================== ROUTES CAS MEDITLINK ====================
        "/api/meditlink/cases": API_BASE_URL,
        "/api/meditlink/cases/save": API_BASE_URL,
        "/api/meditlink/orders/": API_BASE_URL,
        "/api/meditlink/files/": API_BASE_URL,
      },
    },
  };
});
