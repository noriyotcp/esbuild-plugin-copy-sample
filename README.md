# esbuild-plugin-copy-sample
This is the sample for esbuild-plugin-copy

```
 ❯ gh repo clone noriyotcp/esbuild-plugin-copy-sample
 ❯ cd esbuild-plugin-copy-sample
 ❯ ls
assets            lib               package-lock.json src
esbuild.mjs       node_modules      package.json      tsconfig.json

 ❯ tree assets
assets
├── javascript
│   └── test-in-dir.ts
└── test.ts

❯ npm install
❯ npm run build

> esbuild-plugin-copy-sample@1.0.0 build
> node ./esbuild.mjs

 ❯ ls
assets            lib               package-lock.json src               tsconfig.json
esbuild.mjs       node_modules      package.json      tmp-assets

 ❯ tree tmp-assets
tmp-assets
├── javascript
│   └── test-in-dir.ts
└── test.ts
```
