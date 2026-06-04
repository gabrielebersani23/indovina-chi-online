import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/indovina-chi-online/",
  plugins: [react()],
});
