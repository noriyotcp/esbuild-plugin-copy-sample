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

  const isGlob = (_path) => {
    const { dir } = path.parse(_path);

    return dir.endsWith("/**");
  }

  const composeToDirs = (rawFrom, rawTo) => {
    if (!isGlob(rawFrom)) {
      return; // TODO: throw error
    }

    const parsedReplacedPaths = composeReplacedTo(rawFrom, rawTo);
    return parsedReplacedPaths.map((parsedPath) => {
      if (parsedPath.ext === "") {
        return path.join(parsedPath.dir, parsedPath.base);
      }
    }).filter((dir) => dir !== undefined);
  };

  const composeToFiles = (rawFrom, rawTo) => {
    if (isGlob(rawFrom)) {
      return; // TODO: throw error
    }

    const parsedReplacedPaths = composeReplacedTo(rawFrom, rawTo);
    console.log(parsedReplacedPaths);
    return parsedReplacedPaths.map((parsedPath) => {
      if (parsedPath.ext.startsWith(".")) {
        return path.join(parsedPath.dir, parsedPath.base);
      }
    }).filter((path) => path !== undefined);
  };

  const composeReplacedTo = (rawFrom, rawTo) => {
    let replaced;

    if (isGlob(rawFrom)) {
      const { dir } = path.parse(rawFrom);

      const startFragment = dir.replace(`/**`, "");
      const fromPaths = glob.sync(from);
      replaced = fromPaths.map((fromPath) => {
        return fromPath.replace(startFragment, rawTo);
      });
    } else {
      replaced = [rawTo];
    }
    return replacedPathsMapping(replaced);
  }

  const replacedPathsMapping = (replaced) => {
    return replaced.map((_path) => path.parse(_path));
  };

  const absoluteDirs = (absPaths) => {
    return absPaths.map((p) => path.dirname(p));
  }

  const copySingleFile = async (from, to) => {
    await fs.promises.copyFile(from, to, 0, (err) => {
      errors.push({ text: err.message });
      return { errors };
    });
  }

  return {
    name: 'just-copy',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (isGlob(from)) {
          for (const path of composeToDirs(from, to)) {
            try {
              const createDir = await mkdir(path, { recursive: true });
              console.log(`created ${createDir}`);
            } catch (err) {
              console.error(err.message);
            }
          }
        } else {
          if (!isFile(from)) {
            errors.push({ text: `${from} is not a file` });
            return {
              errors,
            };
          } else {
            composeToFiles(from, to).forEach(async (toPath) => {
              try {
                const createDir = await mkdir(path.dirname(toPath), { recursive: true });
                console.log(`created ${createDir}`);
              } catch (err) {
                console.error(err.message);
              }
              return await copySingleFile(from, toPath);
            });
          }
        }
      });

      build.onEnd(result => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  }
};
