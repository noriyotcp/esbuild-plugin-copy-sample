import fs from "node:fs";

export const justCopy = (options) => {
  const from = options.assets.from;
  const to = options.assets.to;

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
        if (!isFile(from[0])) {
          return {
            errors: [{ text: `${from[0]} or ${to[0]} is not a file` }],
          };
        } else {
          await fs.promises.copyFile(from[0], to[0], 0, (err) => {
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
