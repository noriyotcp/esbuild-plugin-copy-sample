import { sourceDirectories, pairsOfDirectories } from "./composers.mjs";

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
