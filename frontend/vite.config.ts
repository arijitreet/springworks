import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, the browser only ever talks to the Vite origin; Vite proxies /api to
// the backend server-side. This avoids CORS and works unchanged in Codespaces,
// where "localhost" inside the browser would not reach the backend otherwise.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
