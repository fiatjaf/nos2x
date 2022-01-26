#!/usr/bin/env node

const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')
const nodeGlobals = require('@esbuild-plugins/node-globals-polyfill').default

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
    plugins: [
      alias({
        stream: require.resolve('readable-stream')
      }),
      nodeGlobals({buffer: true})
    ],
    sourcemap: prod ? false : 'inline',
    define: {
      window: 'self',
      global: 'self'
    }
  })
  .then(() => console.log('build success.'))
