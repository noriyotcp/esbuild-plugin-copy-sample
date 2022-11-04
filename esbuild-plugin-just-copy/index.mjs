import fs, { mkdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import {
  isGlob,
  sourceDirectories,
  pairsOfDirectories,
  sourceFiles,
  pairOfFiles,
} from "./composers.mjs";

export const justCopy = (options) => {
  const errors = [];
  const from = options.assets.from[0];
  const to = options.assets.to[0];

  console.log(options);

  const isFile = (path) => {
    const stat = fs.statSync(path, (err, stats) => {
      if (err) {
        errors.push(err.message);
        return;
      }
    });
    return stat.isFile();
  };

  return {
    name: "just-copy",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (isGlob(from)) {
          // create dirs
          const sourceDirs = sourceDirectories(from);
          pairsOfDirectories({ sourceDirs, distDir: to }).forEach(
              ({ dist }) => {
                mkdirSync(dist, { recursive: true }, (err) => {
                  if (err) {
                    errors.push(err.message);
                  }
                });
              }
            );
          // copy files
          try {
            sourceDirs.forEach((sourceDir) => {
              const { dir, files } = sourceFiles(sourceDir);
              pairOfFiles({ dir, files }, to).forEach(({ source, dist }) => {
                fs.copyFileSync(source, dist);
              });
            });
          } catch (err) {
            errors.push({ text: err.message });
          }
          return { errors: errors };
        } else { // copy file
          if (!isFile(from)) {
            errors.push({ text: `${from} is not a file` });
            return {
              errors,
            };
          } else {
            // mkdir recursive: true

            // copy a single file
          }
        }
      });

      build.onEnd((result) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
