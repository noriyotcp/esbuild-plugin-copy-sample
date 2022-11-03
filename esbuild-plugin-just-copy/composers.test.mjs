import {
  sourceDirectories,
  sourceFiles,
  pairsOfDirectories,
} from "./composers.mjs";

test("sourceDirectories", () => {
  const directories = ["assets", "assets/javascript", "assets/no-file"];

  expect(sourceDirectories("assets/**/*")).toEqual(directories);
});

test("pairsOfDirectories", () => {
  const sourceDirs = ["assets", "assets/javascript", "assets/no-file"];
  const distDir = "public/subdir";

  const expected = [
    {
      source: "assets",
      dist: "public/subdir",
    },
    {
      source: "assets/javascript",
      dist: "public/subdir/javascript",
    },
    {
      source: "assets/no-file",
      dist: "public/subdir/no-file",
    },
  ];

  expect(pairsOfDirectories({ sourceDirs, distDir })).toEqual(expected);
});

test("sourceFiles()", () => {
  const sourceDir = "assets";

  const expected = {
    dir: "assets",
    files: ["assets/no-ext", "assets/test.ts", "assets/test2.ts"],
  };

  expect(sourceFiles(sourceDir)).toEqual(expected);
});

test("sourceFiles() with subdirectories", () => {
  const sourceDir = "assets/javascript";

  const expected = {
    dir: "assets/javascript",
    files: ["assets/javascript/test-in-dir.ts"],
  };

  expect(sourceFiles(sourceDir)).toEqual(expected);
});
