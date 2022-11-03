import fs from "node:fs";
import glob from "glob";
import { parse } from "node:path";

const sourceDirectories = (globbedPath) => {
  const parentDir = globbedPath.replace(`/**/*`, "");
  const childDirs = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => `${parentDir}/${item.name}`);
  return [parentDir, ...childDirs];
};

const sourceFiles = (dir) => {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((item) => item.isFile())
    .map((item) => `${dir}/${item.name}`);

  return { dir, files };
};

const pairsOfDirectories = ({ sourceDirs, distDir }) => {
  return sourceDirs.map((sourceDir) => {
    const { dir, base } = parse(sourceDir);
    // if dir is "" then it's the root directory
    return {
      source: `${sourceDir}`,
      dist: dir === "" ? `${distDir}` : `${distDir}/${base}`,
    };
  });
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

export {
  composeFromObject,
  composeToObject,
  isGlob,
  sourceDirectories,
  sourceFiles,
  pairsOfDirectories,
};
