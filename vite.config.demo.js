import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  publicDir: "../public",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    sourcemap: false,
    minify: true
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@demo": resolve(__dirname, "./demo")
    }
  },
  server: {
    proxy: {
      "/api/jsonbin": {
        target: "https://api.jsonbin.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jsonbin/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
        }
      }
    },
    open: true,
    port: 5173
  }
});