import fs from "node:fs";
import glob from "glob";
import path, { parse } from "node:path";

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

const pairOfFiles = (sourceFiles, distDir) => {
  const { dir, files } = sourceFiles;

  // replace the source directory with the dist directory
  return files.map((file) => {
    return { source: file, dist: file.replace(dir, distDir) };
  });
};

const pairsOfDirectories = ({ sourceDirs, distDir }) => {
  const parent = sourceDirs[0].split("/")[1];
  return sourceDirs.map((sourceDir) => {
    const { dir } = parse(sourceDir);
    // if dir is '.', it's the root directory
    if (dir === '.') {
      return { source: sourceDir, dist: distDir };
    } else {
      const dist = `./${path.join(`${distDir}`, sourceDir.replace(`./${parent}`, ""))}`;
      return { source: sourceDir, dist };
    }
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
  pairOfFiles,
  pairsOfDirectories,
};
