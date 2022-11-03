import { sourceDirectories } from "./composers.mjs";

test('sourceDirectories', () => {
  const directories = [
    'assets',
    'assets/javascript',
    'assets/no-file',
  ]

  expect(sourceDirectories('assets/**/*')).toEqual(directories)
});
