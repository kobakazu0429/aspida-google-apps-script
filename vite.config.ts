import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";

const decoder = new TextDecoder();

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["cjs"],
      fileName: () => "code.js",
    },
    rollupOptions: {
      treeshake: false,
    },
    watch: {
      include: "src/**",
    },
    outDir: ".",
    minify: false,
  },
  plugins: [
    {
      name: "clasp-push",
      closeBundle: () => {
        const result = execFileSync("pnpm", ["run", "push"]);
        console.log(decoder.decode(result));
      },
    },
  ],
});
