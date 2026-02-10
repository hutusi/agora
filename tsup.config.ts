import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      incremental: false,
    },
  },
  tsconfig: "tsconfig.lib.json",
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "next", "swr"],
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
