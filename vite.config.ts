import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "Patch @ffmpeg/ffmpeg package.json",
      buildStart: () => {
        const ffmpegPackageJsonPath = path.resolve(__dirname, "node_modules/@ffmpeg/ffmpeg/package.json");
        const packageJson = JSON.parse(fs.readFileSync(ffmpegPackageJsonPath, "utf-8"));
        if (packageJson.exports) {
          Reflect.deleteProperty(packageJson, "exports");
          fs.writeFileSync(ffmpegPackageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
        }
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
});
