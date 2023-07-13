import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
    minify: false,
  },
  resolve: {
    alias: [
      {
        find: "aspida",
        replacement: "aspida-google-apps-script",
      },
    ],
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "./appsscript.json",
          dest: "",
        },
      ],
    }),
  ],
});
