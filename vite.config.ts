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
      external: [
        // Only externalize Node.js built-ins - Templater has these
        "fs",
        "path",
        "util",
        "assert",
        "constants",
        "stream",
        /^node:/, // All node: prefixed modules
        // Bundle npm packages like lowdb, fs-extra, etc.
      ],
      // output: {
      //   exports: "default",
      // },
    },
  },
});
