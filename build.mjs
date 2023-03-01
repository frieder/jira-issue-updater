#!/usr/bin/env node

import * as esbuild from 'esbuild';

await esbuild.build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    logLevel: 'info',
    minify: true,
    outfile: 'dist/index.js',
    platform: "node"
}).catch(e => {
   console.log(e);
   process.exit(1);
});
