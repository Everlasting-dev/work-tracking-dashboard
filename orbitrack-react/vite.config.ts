import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Executive Black React desktop. Relative assets are required for Electron file:// loads.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, "/");
          if (!normalized.includes("/node_modules/")) return undefined;
          if (
            normalized.includes("/node_modules/react/") ||
            normalized.includes("/node_modules/react-dom/") ||
            normalized.includes("/node_modules/react-router-dom/")
          ) return "react";
          if (normalized.includes("/node_modules/@mantine/")) return "mantine";
          if (normalized.includes("/node_modules/@supabase/")) return "supabase";
          if (normalized.includes("/node_modules/@tanstack/")) return "tanstack";
          if (normalized.includes("/node_modules/@radix-ui/")) return "radix";
          if (normalized.includes("/node_modules/lucide-react/")) return "icons";
          if (normalized.includes("/node_modules/dexie")) return "dexie";
          if (
            normalized.includes("/node_modules/@dnd-kit/") ||
            normalized.includes("/node_modules/react-resizable-panels/") ||
            normalized.includes("/node_modules/motion/")
          ) return "workspace-ui";
          if (
            normalized.includes("/node_modules/cmdk/") ||
            normalized.includes("/node_modules/fuse.js/") ||
            normalized.includes("/node_modules/react-hotkeys-hook/")
          ) return "command-ui";
          return "vendor";
        },
      },
    },
  },
});
