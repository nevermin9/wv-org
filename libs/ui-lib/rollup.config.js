import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
import { resolve } from "node:path";

const dist = (modulePath) => {
  return resolve(import.meta.dirname, ...pkg.files, modulePath);
};

export default [
  // browser-friendly UMD build
  {
    input: "src/main.ts",
    output: {
      name: "uiLib",
      file: dist(pkg.browser),
      format: "umd",
    },
    plugins: [
      typescript(), // so Rollup can convert TypeScript to JavaScript
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "src/main.ts",
    plugins: [
      typescript(), // so Rollup can convert TypeScript to JavaScript
    ],
    output: [
      { file: dist(pkg.main), format: "cjs" },
      { file: dist(pkg.module), format: "es" },
    ],
  },
];
