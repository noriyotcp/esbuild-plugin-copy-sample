import { build } from 'esbuild';
import glob from "glob";
import { copy } from "esbuild-plugin-copy";
import { justCopy } from "./esbuild-plugin-just-copy/index.mjs";

const entryPoints = glob.sync('src/**/*.ts');

const options = {
  entryPoints,
  outbase: "./src",
  outdir: "./lib",
  platform: "node",
  sourcemap: true,
  bundle: true,
  // watch: true,
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./assets/**/*"],
        to: ["./tmp-assets"],
        keepStructure: true,
      },
    }),
    justCopy(),
  ],
};

(async () => {
  try {
    await build(options)
  } catch (error) {
    process.exit(1);
  }
})();
