import fs from "node:fs";
import glob from "glob";
import { mkdir } from "node:fs/promises";
import path from "node:path";

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

  const composeToDirs = (rawFrom, rawTo) => {
    const { dir } = path.parse(rawFrom);

    if (!dir.endsWith === "/**") {
      return; // TODO: throw error
    }

    const startFragment = dir.replace(`/**`, "");
    console.log(startFragment);
    // absolute paths include file name
    // const fromPaths = glob.sync(from, { absolute: true });
    const fromPaths = glob.sync(from);
    console.log(fromPaths);
    const replaced = fromPaths.map((fromPath) => {
      return fromPath.replace(startFragment, rawTo);
    });
    // console.log(replaced);
    // objects
    const parsedReplacedPaths = replaced.map((_path) => path.parse(_path));
    return parsedReplacedPaths.map((parsedPath) => {
      if (parsedPath.ext === "") {
        return path.join(parsedPath.dir, parsedPath.base);
      }
    }).filter((dir) => dir !== undefined);
  };

  const absoluteDirs = (absPaths) => {
    return absPaths.map((p) => path.dirname(p));
  }

  return {
    name: 'just-copy',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        for (const path of composeToDirs(from, to)) {
          try {
            const createDir = await mkdir(path, { recursive: true });
            console.log(`created ${createDir}`);
          } catch (err) {
            console.error(err.message);
          }
        }

        if (!isFile(from)) {
          errors.push({ text: `${from} is not a file` });
          return {
            errors,
          };
        } else {
          await fs.promises.copyFile(from, to, 0, (err) => {
            errors.push({ text: err.message });
            return { errors };
          });
        }
      });

      build.onEnd(result => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  }
};
