import { screenGraphPlugin } from "@animaapp/vite-plugin-screen-graph";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "development" && screenGraphPlugin()],
  test: { setupFiles: ["./src/test/setup.ts"] },
  build: { rollupOptions: { input: { main: "index.html", inviteQr: "invite-qr.html" } } },
  publicDir: "./static",
  //proxy api request to the backend (Django)
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
}));