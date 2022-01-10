#!/usr/bin/env node

const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')

esbuild.build({
  bundle: true,
  entryPoints: ['./extension/options.js'],
  outfile: './extension/options.build.js',
  plugins: [
    alias({
      stream: require.resolve('readable-stream')
    })
  ]
})

esbuild.build({
  bundle: true,
  entryPoints: ['./extension/background.js'],
  outfile: './extension/background.build.js',
  plugins: [
    alias({
      stream: require.resolve('readable-stream')
    })
  ]
})
