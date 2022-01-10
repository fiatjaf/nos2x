#!/usr/bin/env node

const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')

esbuild.build({
  bundle: true,
  entryPoints: {
    'options.build': './extension/options.js',
    'content-script.build': './extension/content-script.js',
    'background.build': './extension/background.js'
  },
  outdir: './extension',
  plugins: [
    alias({
      stream: require.resolve('readable-stream')
    })
  ],
  sourcemap: 'inline'
})
