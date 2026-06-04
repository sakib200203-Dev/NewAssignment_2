import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: false,
  sourcemap: true,
  target: "esnext",
});