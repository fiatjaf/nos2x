/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { describe, expect, it } from 'vitest';
import { appMatches, createManifest } from './manifest';
import { isAppOrigin } from './lib/policy';

describe('manifest', () => {
	it('limits production builds to AI design hosts', () => {
		const manifest = createManifest('production', '1.0.0');
		expect(manifest.host_permissions).toEqual([
			'https://*.cadbos.com/*',
			'https://*.cadbos-cloudflare.workers.dev/*'
		]);
	});

	it('accepts AI design previews but not other Workers', () => {
		const matches = appMatches('production');
		expect(
			isAppOrigin('https://feat-payments-ui-cadbos-ui.cadbos-cloudflare.workers.dev', matches)
		).toBe(true);
		expect(isAppOrigin('https://cadbos-ui.attacker.workers.dev', matches)).toBe(false);
		expect(isAppOrigin('https://cadbos-cloudflare.workers.dev.attacker.com', matches)).toBe(false);
	});

	it('adds the local dev server only to development builds', () => {
		expect(appMatches('development')).toContain('http://localhost/*');
		expect(appMatches('production')).not.toContain('http://localhost/*');
	});
});
