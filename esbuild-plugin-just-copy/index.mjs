import fs from "node:fs";
import { dirname, join } from "node:path";
import {
  isGlob,
  sourceDirectories,
  pairsOfDirectories,
  sourceFiles,
  pairOfFiles,
} from "./composers.mjs";
import glob from "glob";

export const justCopy = (options) => {
  const errors = [];
  const from = options.assets.from[0];
  const to = options.assets.to[0];

  console.log(options);

  return {
    name: "just-copy",
    setup(build) {
      const esbuildOptions = build.initialOptions;
      glob(join(to, "**/*"), (err, files) => {
        if (err) {
          console.log(err);
        } else {
          console.log(files);
        }
      })

      if (!esbuildOptions.outdir) {
        console.log(
          "[esbuild cleanup] Not outdir configured - skipping the cleanup"
        );
        return;
      }
      if (!esbuildOptions.metafile) {
        console.log(
          "[esbuild cleanup] Metafile is not enabled - skipping the cleanup"
        );
        return;
      }
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (/\/$/.test(from)) {
          errors.push({ text: "`from` must not end with `/`" });
          return { errors };
        } else if (/\/$/.test(to)) {
          errors.push({ text: "`to` must not end with `/`" });
          return { errors };
        }

        if (isGlob(from)) {
          const sourceDirs = sourceDirectories(from);
          try {
            // create dirs
            pairsOfDirectories({ sourceDirs, distDir: to }).forEach(
              ({ dist }) => {
                fs.mkdirSync(dist, { recursive: true });
              }
            );
            // copy files
            sourceDirs.forEach((sourceDir) => {
              pairOfFiles(sourceFiles(sourceDir), to).forEach(
                ({ source, dist }) => {
                  fs.copyFileSync(source, dist);
                }
              );
            });
          } catch (err) {
            errors.push({ text: err.message });
          }
        } else {
          // copy a single file
          try {
            if (!fs.statSync(from).isFile()) {
              errors.push({ text: `${from} is not a file` });
              return { errors };
            }
          } catch (err) {
            errors.push({ text: err.message });
            return { errors };
          }

          try {
            fs.mkdirSync(dirname(to), { recursive: true });
            fs.copyFileSync(from, to);
          } catch (error) {
            errors.push({ text: error.message });
          }
        }
        // return aggregated errors
        return { errors };
      });

      build.onEnd((result) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
