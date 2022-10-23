import fs from "node:fs";
import glob from "glob";
import { mkdir } from "node:fs/promises";
import { parse, join, dirname } from "node:path";

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
    const { dir } = parse(_path);

    return dir.endsWith("/**");
  };

  const composeToDirs = (rawFrom, rawTo) => {
    if (!isGlob(rawFrom)) {
      return; // TODO: throw error
    }

    const parsedReplacedPaths = composeToObject(rawFrom, rawTo);
    return parsedReplacedPaths
      .map((parsedPath) => {
        if (parsedPath.ext === "") {
          return join(parsedPath.dir, parsedPath.base);
        }
      })
      .filter((dir) => dir !== undefined);
  };

  const composeToObject = (rawFrom, rawTo) => {
    let replaced;

    if (isGlob(rawFrom)) {
      const { dir } = parse(rawFrom);

      const startFragment = dir.replace(`/**`, "");
      const fromPaths = glob.sync(from);
      replaced = fromPaths.map((fromPath) => {
        return fromPath.replace(startFragment, rawTo);
      });
    } else {
      replaced = [rawTo];
    }
    return replacedPathsMapping(replaced);
  };

  // compose object from `from` paths (globbed or not)
  const composeFromObject = (rawFrom) => {
    if (isGlob(rawFrom)) {
      const filePaths = glob.sync(rawFrom);
      return filePaths.map((_path) => parse(_path));
    } else {
      return [rawFrom].map((_path) => parse(_path));
    }
  };

  // merge composed objects
  const mergeComposedObjects = ({ fromObject, toObject, mode = "all" }) => {
    let fromPaths, toPaths;

    if (mode === "files") {
      // with extension
      fromPaths = fromObject
        .filter((fo) => fo.ext.startsWith("."))
        .flatMap((fo) => join(fo.dir, fo.base));
      toPaths = toObject
        .filter((fo) => fo.ext.startsWith("."))
        .flatMap((to) => join(to.dir, to.base));
    } else if (mode === "dirs") {
      // without extension
      fromPaths = fromObject
        .filter((fo) => fo.ext === "")
        .flatMap((fo) => join(fo.dir, fo.base));
      toPaths = toObject
        .filter((fo) => fo.ext === "")
        .flatMap((to) => join(to.dir, to.base));
    } else if (mode === "all") {
      fromPaths = fromObject.flatMap((fo) => join(fo.dir, fo.base));
      toPaths = toObject.flatMap((to) => join(to.dir, to.base));
    }

    return fromPaths.map((fo, i) => {
      return { from: fromPaths[i], to: toPaths[i] };
    });
  };

  // Rename to composedPaths
  const replacedPathsMapping = (replaced) => {
    return replaced.map((_path) => parse(_path));
  };

  const copySingleFile = async (from, to) => {
    await fs.promises.copyFile(from, to, 0, (err) => {
      errors.push({ text: err.message });
      return { errors };
    });
  };

  // for testing
  const consoleForcomposingObjects = (from, to) => {
    console.log("composeFromObject: ", composeFromObject(from));
    console.log("composeToObject", composeToObject(from, to));
    console.log(
      "mergeComposedObjects",
      mergeComposedObjects({
        fromObject: composeFromObject(from),
        toObject: composeToObject(from, to),
        mode: "files",
      })
    );
    console.log(
      "mergeComposedObjects",
      mergeComposedObjects({
        fromObject: composeFromObject(from),
        toObject: composeToObject(from, to),
        mode: "dirs",
      })
    );
    console.log(
      "mergeComposedObjects",
      mergeComposedObjects({
        fromObject: composeFromObject(from),
        toObject: composeToObject(from, to),
      })
    );
  };

  return {
    name: "just-copy",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (isGlob(from)) {
          // create dirs
          for (const path of composeToDirs(from, to)) {
            try {
              await mkdir(path, { recursive: true });
              consoleForcomposingObjects(from, to);
            } catch (err) {
              console.error(err.message);
            }
          }
          const filePaths = mergeComposedObjects({
            fromObject: composeFromObject(from),
            toObject: composeToObject(from, to),
            mode: "files",
          });
          filePaths.forEach(async (path) => {
            return await copySingleFile(path.from, path.to);
          });
        } else {
          consoleForcomposingObjects(from, to);

          if (!isFile(from)) {
            errors.push({ text: `${from} is not a file` });
            return {
              errors,
            };
          } else {
            const filePaths = mergeComposedObjects({
              fromObject: composeFromObject(from),
              toObject: composeToObject(from, to),
              mode: "files",
            });
            filePaths.forEach(async (path) => {
              try {
                await mkdir(dirname(path.to), {
                  recursive: true,
                });
              } catch (err) {
                console.error(err.message);
              }

              return await copySingleFile(path.from, path.to);
            });
          }
        }
      });

      build.onEnd((result) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
