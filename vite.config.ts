/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsInlineLimit(filePath: string) {
      return filePath.includes(".mp4");
    },
  },
  plugins: [
    {
      name: "Patch @ffmpeg packages",
      buildStart: () => {
        const filesToPatch = [
          path.resolve(__dirname, "node_modules/@ffmpeg/ffmpeg/package.json"),
          path.resolve(__dirname, "node_modules/@ffmpeg/core-mt/package.json"),
        ];
        filesToPatch.forEach((p) => {
          const packageJson = JSON.parse(fs.readFileSync(p, "utf-8"));
          if (packageJson.exports) {
            Reflect.deleteProperty(packageJson, "exports");
            fs.writeFileSync(p, JSON.stringify(packageJson, null, 2), "utf-8");
          }
        });
      },
    },
    react(),
    {
      name: "CrossOriginIsolationPlugin",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          next();
        });
      },
    },
  ],
  test: {
    environment: "happy-dom",
    alias: {
      "@/": path.resolve(__dirname, "src/"),
    },
  },
});
