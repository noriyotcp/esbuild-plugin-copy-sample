export const justCopy = () => {
  return {
    name: 'just-copy',
    setup(build) {
      console.log('just-copy setup');
      // build.onResolve({ filter: /\/assets\// }, (args) => {
      //   return {
      //     path: args.path,
      //     namespace: 'just-copy',
      //   };
      // });
      // build.onLoad({ filter: /.*/, namespace: 'just-copy' }, (args) => {
      //   console.log(args);
      // });
    }
  }
};
