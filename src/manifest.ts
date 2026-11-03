/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

// AI design hosts the signer serves: production (app.cadbos.com), staging and the
// Worker preview URLs, which live only under the cadbos Cloudflare account subdomain. Development
// builds also accept the local dev server for `pnpm dev` in cadbos.
const productionMatches = ['https://*.cadbos.com/*', 'https://*.cadbos-cloudflare.workers.dev/*'];
const developmentMatches = ['http://localhost/*', 'http://127.0.0.1/*'];

export function appMatches(mode: string): string[] {
	return mode === 'development' ? [...productionMatches, ...developmentMatches] : productionMatches;
}

export function createManifest(mode: string, version: string): chrome.runtime.ManifestV3 {
	return {
		manifest_version: 3,
		name: '__MSG_extName__',
		short_name: '__MSG_extShortName__',
		description: '__MSG_extDescription__',
		version,
		default_locale: 'en',
		icons: {
			'16': 'icons/16.png',
			'32': 'icons/32.png',
			'48': 'icons/48.png',
			'128': 'icons/128.png'
		},
		options_ui: {
			page: 'pages/settings/index.html',
			open_in_tab: true
		},
		action: {
			default_title: '__MSG_extName__',
			default_popup: 'pages/popup/index.html'
		},
		background: {
			service_worker: 'background.js',
			type: 'module'
		},
		permissions: ['storage'],
		host_permissions: appMatches(mode),
		content_scripts: [
			{
				matches: appMatches(mode),
				js: ['content/provider.js'],
				run_at: 'document_start',
				world: 'MAIN'
			},
			{
				matches: appMatches(mode),
				js: ['content/bridge.js'],
				run_at: 'document_start'
			}
		]
	};
}
