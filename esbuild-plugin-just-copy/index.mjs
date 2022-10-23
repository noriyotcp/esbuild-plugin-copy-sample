import fs from "node:fs";

export const justCopy = (options) => {
  const from = options.assets.from[0];
  const to = options.assets.to[0];

  console.log(options);

  const isFile = (path) => {
    const stat = fs.statSync(path, (err, stats) => {
      if (err) {
        console.error(err);
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
          return {
            errors: [{ text: `${from} or ${to} is not a file` }],
          };
        } else {
          await fs.promises.copyFile(from, to, 0, (err) => {
            return { errors: [{ text: err.message }] };
          });
        }
      });

      build.onEnd(result => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  }
};
