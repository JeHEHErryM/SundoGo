import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const packages = path.resolve(__dirname, "../../packages");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sundogo/types": path.resolve(packages, "types/src"),
      "@sundogo/validation": path.resolve(packages, "validation/src"),
      "@sundogo/ui": path.resolve(packages, "ui/src"),
      "@sundogo/auth": path.resolve(packages, "auth/src"),
      "@sundogo/config": path.resolve(packages, "config/src"),
    },
  },
  server: {
    port: 5173,
  },
  define: {
    "import.meta.env.VITE_APP_TITLE": JSON.stringify("SundoGo Passenger"),
  },
});
