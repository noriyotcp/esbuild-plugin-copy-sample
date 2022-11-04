import fs from "node:fs";
import { dirname } from "node:path";
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
    try {
      const stat = fs.statSync(path);
      return stat.isFile();
    } catch (err) {
      errors.push({ text: err.message });
    }
  };

  return {
    name: "just-copy",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
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
          if (!isFile(from)) {
            errors.push({ text: `${from} is not a file` });
          } else {
            try {
              fs.mkdirSync(dirname(to), { recursive: true });
              fs.copyFileSync(from, to);
            } catch (error) {
              errors.push({ text: error.message });
            }
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
