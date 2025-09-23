import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  // Charger les variables d'environnement dans tous les modes
  const env = loadEnv(mode, process.cwd(), "");
  const API_BASE_URL = env.VITE_API_BASE_URL || "http://localhost:8080";

  // Configuration de base
  const config = {
    plugins: [react()],
    // Configuration spécifique au build
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    // Server configuration pour le dev
    server: {
      proxy: {},
    },
  };

  // En développement, configurer le proxy
  if (!isProduction) {
    config.server.proxy = {
      // Routes publiques commandes
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
      "/deepseek": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    };
  }

  return config;
});
