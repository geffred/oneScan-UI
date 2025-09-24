import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // ton backend Spring Boot en local
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
