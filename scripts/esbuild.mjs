import { build } from 'esbuild';
import { glob } from "glob";

const entryPoints = glob.sync('src/**/*.js');

build({
  entryPoints,
  outbase: './src',
  outdir: './lib',
  platform: 'node',
  bundle: true,
  watch: true,
}).catch(() => process.exit(1))
