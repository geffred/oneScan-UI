import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/public/commandes": "http://localhost:8080",
      "/api/auth/register": "http://localhost:8080",
      "/api/auth/login": "http://localhost:8080",
      "/api/auth/logout": "http://localhost:8080",
    },
  },
});
