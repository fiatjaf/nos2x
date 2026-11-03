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

import { describe, expect, it } from 'vitest';
import type { EventTemplate } from 'nostr-tools/pure';
import { checkLoginEvent, isAppOrigin, isEventTemplate, matchesPattern } from './policy';

const patterns = ['https://cadbos.com/*', 'https://*.cadbos.com/*'];
const now = 1_800_000_000;

function loginEvent(overrides: Partial<EventTemplate> = {}): EventTemplate {
	return {
		kind: 27235,
		created_at: now,
		content: '',
		tags: [
			['u', 'https://app.cadbos.com/auth/verify'],
			['method', 'POST'],
			['challenge', 'abc']
		],
		...overrides
	};
}

describe('origin matching', () => {
	it('accepts AI design hosts and their subdomains', () => {
		expect(isAppOrigin('https://cadbos.com', patterns)).toBe(true);
		expect(isAppOrigin('https://app.cadbos.com', patterns)).toBe(true);
		expect(isAppOrigin('https://staging.app.cadbos.com', patterns)).toBe(true);
	});

	it('rejects look-alike hosts and plain http', () => {
		expect(isAppOrigin('https://evilcadbos.com', patterns)).toBe(false);
		expect(isAppOrigin('https://cadbos.com.evil.io', patterns)).toBe(false);
		expect(isAppOrigin('http://app.cadbos.com', patterns)).toBe(false);
		expect(isAppOrigin('not a url', patterns)).toBe(false);
	});

	it('ignores ports for localhost patterns', () => {
		expect(matchesPattern(new URL('http://localhost:5173'), 'http://localhost/*')).toBe(true);
	});
});

describe('login event policy', () => {
	it('accepts a NIP-98 sign-in for the requesting origin', () => {
		expect(checkLoginEvent(loginEvent(), 'https://app.cadbos.com', now)).toBeNull();
	});

	it('rejects other event kinds', () => {
		expect(checkLoginEvent(loginEvent({ kind: 1 }), 'https://app.cadbos.com', now)).toBe(
			'unsupported_kind'
		);
	});

	it('rejects a u tag that points at another origin', () => {
		expect(checkLoginEvent(loginEvent(), 'https://preview.cadbos.com', now)).toBe('foreign_url');
	});

	it('rejects content, missing method and stale timestamps', () => {
		const origin = 'https://app.cadbos.com';
		expect(checkLoginEvent(loginEvent({ content: 'x' }), origin, now)).toBe('unexpected_content');
		expect(
			checkLoginEvent(loginEvent({ tags: [['u', `${origin}/auth/verify`]] }), origin, now)
		).toBe('missing_method');
		expect(checkLoginEvent(loginEvent({ created_at: now - 3600 }), origin, now)).toBe(
			'stale_timestamp'
		);
	});

	it('validates the event template shape', () => {
		expect(isEventTemplate(loginEvent())).toBe(true);
		expect(isEventTemplate({ ...loginEvent(), tags: [[1]] })).toBe(false);
		expect(isEventTemplate(null)).toBe(false);
	});
});
