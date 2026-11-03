/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-Cadbos-BSL-1.1
 *
 * Cadbos Interior Design AI is licensed under the Business Source License 1.1.
 * Access is limited to automated analysis tools for analysis of this repository.
 * This code is not open for contribution or usage except under a separate
 * written agreement with Cadbos company.
 *
 * Commercial use in Interior Design & AEC Generative AI Services is prohibited
 * before the Change Date. See LICENSE for complete terms.
 */

import { resolve } from 'node:path';
import { build, defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createManifest } from './src/manifest.ts';
import pkg from './package.json' with { type: 'json' };

function manifest(mode: string): Plugin {
	return {
		name: 'ai-design-signer-manifest',
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'manifest.json',
				source: JSON.stringify(createManifest(mode, pkg.version), null, '\t')
			});
		}
	};
}

// Content scripts load as classic scripts, so each is bundled on its own into
// a self-contained IIFE with no shared chunks or `import` statements.
const contentScripts = ['provider', 'bridge'];

function contentScriptBundles(mode: string): Plugin {
	return {
		name: 'ai-design-signer-content-scripts',
		async writeBundle() {
			for (const name of contentScripts) {
				await build({
					configFile: false,
					mode,
					logLevel: 'warn',
					publicDir: false,
					build: {
						outDir: resolve(import.meta.dirname, 'dist/content'),
						emptyOutDir: false,
						sourcemap: mode === 'development' ? 'inline' : false,
						minify: mode !== 'development',
						lib: {
							entry: resolve(import.meta.dirname, `src/content/${name}.ts`),
							formats: ['iife'],
							name: `aiDesignSigner_${name}`,
							fileName: () => `${name}.js`
						}
					}
				});
			}
		}
	};
}

export default defineConfig(({ mode }) => ({
	root: resolve(import.meta.dirname, 'src'),
	publicDir: resolve(import.meta.dirname, 'public'),
	base: '',
	plugins: [svelte(), manifest(mode), contentScriptBundles(mode)],
	build: {
		outDir: resolve(import.meta.dirname, 'dist'),
		emptyOutDir: true,
		sourcemap: mode === 'development' ? 'inline' : false,
		minify: mode !== 'development',
		rolldownOptions: {
			input: {
				background: resolve(import.meta.dirname, 'src/background/index.ts')
			},
			output: {
				entryFileNames: (chunk) =>
					chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js'
			}
		}
	}
}));
