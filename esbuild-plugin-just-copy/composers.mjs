import fs from "node:fs";
import glob from "glob";
import { parse } from "node:path";

// It return an array of directories
// ["assets", "assets/javascript", "assets/no-file"];
const sourceDirectories = (globbedPath) => {
  const parentDir = globbedPath.replace(`/**/*`, "");
  const childDirs = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => `${parentDir}/${item.name}`);
  return [parentDir, ...childDirs];
};

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

export { composeFromObject, composeToObject, isGlob, sourceDirectories };
