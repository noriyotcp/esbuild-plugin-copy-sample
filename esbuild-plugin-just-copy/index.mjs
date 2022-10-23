import fs from "node:fs";

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

  return {
    name: 'just-copy',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
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
