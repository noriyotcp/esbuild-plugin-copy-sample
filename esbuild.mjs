import { build } from 'esbuild';
import glob from "glob";
import { copy } from "esbuild-plugin-copy";
import { justCopy } from "./esbuild-plugin-just-copy/index.mjs";

// import { justCopy } from "esbuild-plugin-just-copy";

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
    // copy({
    //   resolveFrom: "cwd",
    //   assets: {
    //     from: ["./assets/**/*"],
    //     to: ["./tmp-assets"],
    //     keepStructure: true,
    //   },
    // }),
    justCopy({
      resolveFrom: "cwd",
      assets: {
        // from: ["./assets/javascript/test-in-dir.ts"],
        // to: ["./just-copy-assets/javascripts/test-in-dir.ts"],
        from: ["./assets/**/*"],
        to: ["./just-copy-assets"],
        keepStructure: true,
      },
    }),
  ],
};

(async () => {
  try {
    await build(options)
  } catch (error) {
    process.exit(1);
  }
})();
