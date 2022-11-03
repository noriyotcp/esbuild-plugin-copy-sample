import glob from "glob";
import { parse } from "node:path";

const sum = (a, b) => {
  return a + b;
}

const composeToObject = (rawFrom, rawTo) => {
  let toPaths;

  if (isGlob(rawFrom)) {
    const { dir } = parse(rawFrom);

    const startFragment = dir.replace(`/**`, "");
    const fromPaths = glob.sync(rawFrom);
    toPaths = fromPaths.map((fromPath) => {
      return fromPath.replace(startFragment, rawTo);
    });
  } else {
    toPaths = [rawTo];
  }
  return toPaths.map((_path) => parse(_path));
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

const isGlob = (_path) => {
  const { dir } = parse(_path);

  return dir.endsWith("/**");
};

export { composeFromObject, composeToObject, isGlob, sum };
