import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Dev: forwards /api calls to FastAPI so no CORS setup is needed locally.
// changeOrigin:false keeps the browser's Host header, so FastAPI's redirects (e.g. /api/tasks -> /api/tasks/)
// stay on localhost:5173 and keep working through the proxy.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": { target: "http://localhost:8000", changeOrigin: false } } },
});
