import { build } from 'esbuild';
import glob from "glob";

const entryPoints = glob.sync('src/**/*.ts');

const options = {
  entryPoints,
  outbase: "./src",
  outdir: "./lib",
  platform: "node",
  sourcemap: true,
  bundle: true,
  watch: true,
};

(async () => {
  try {
    const res = await build(options)
  } catch (error) {
    process.exit(1);
  }
})();
