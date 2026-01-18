import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production";
  
  return {
    base: "./",
    build: {
      outDir: "dist-demo",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "demo/index.html")
        }
      },
      minify: isProduction ? "terser" : false,
      sourcemap: !isProduction
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@demo": resolve(__dirname, "./demo")
      }
    },
    server: {
      port: 5173,
      open: true
    }
  };
});