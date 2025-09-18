import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: "src/runPowerJournal.ts",
      formats: ["cjs"], // CommonJS for Templater
      fileName: () => "runPowerJournal.js",
    },
    outDir: "dist",
    minify: true,
    rollupOptions: {
      external: ["fs", "path"],
      // output: {
      //   exports: "default",
      // },
    },
  },
});
