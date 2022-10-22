import { build } from 'esbuild';
import pkg from "glob";
const { glob } = pkg;

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
