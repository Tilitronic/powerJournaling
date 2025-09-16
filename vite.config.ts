import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/runPowerJournal.ts",
      formats: ["cjs"], // CommonJS for Templater
      fileName: () => "runPowerJournal.js",
    },
    outDir: "dist",
    minify: true,
    rollupOptions: { external: [] },
  },
});
