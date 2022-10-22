import { build } from 'esbuild';
import glob from "glob";

const entryPoints = glob.sync('src/**/*.ts');

build({
  entryPoints,
  outbase: './src',
  outdir: './lib',
  platform: 'node',
  sourcemap: true,
  bundle: true,
  watch: true,
}).catch(() => process.exit(1))
