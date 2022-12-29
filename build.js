#!/usr/bin/env node

const esbuild = require('esbuild')

const prod = process.argv.indexOf('prod') !== -1

esbuild
  .build({
    bundle: true,
    entryPoints: {
      'popup.build': './extension/popup.jsx',
      'prompt.build': './extension/prompt.jsx',
      'options.build': './extension/options.jsx',
      'background.build': './extension/background.js',
      'content-script.build': './extension/content-script.js'
    },
    outdir: './extension',
    sourcemap: prod ? false : 'inline',
    define: {
      window: 'self',
      global: 'self'
    }
  })
  .then(() => console.log('build success.'))
