import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Optional: You can create an alias for your images directory
      "@images": "/src/imgs",
    },
  },
});
