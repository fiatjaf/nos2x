/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import type { EventTemplate } from 'nostr-tools/pure';

// NIP-98 HTTP-Auth, the only event kind AI design asks the signer for.
export const LOGIN_EVENT_KIND = 27235;
const MAX_CLOCK_SKEW_SECONDS = 10 * 60;

export type LoginEventError =
	'unsupported_kind' | 'foreign_url' | 'missing_method' | 'unexpected_content' | 'stale_timestamp';

// A URL matches a manifest match pattern (`scheme://host/*`, where host may
// start with `*.`). Ports are ignored, as in Chrome's own matching.
export function matchesPattern(url: URL, pattern: string): boolean {
	const match = /^(https?):\/\/([^/]+)\/\*$/.exec(pattern);
	if (!match) throw new Error(`Unsupported match pattern: ${pattern}`);
	const [, scheme, host] = match;
	if (url.protocol !== `${scheme}:`) return false;
	if (host.startsWith('*.')) return url.hostname.endsWith(host.slice(1));
	return url.hostname === host;
}

export function isAppOrigin(origin: string, patterns: readonly string[]): boolean {
	let url: URL;
	try {
		url = new URL(origin);
	} catch {
		return false;
	}
	return patterns.some((pattern) => matchesPattern(url, pattern));
}

function tagValue(event: EventTemplate, name: string): string | undefined {
	return event.tags.find((tag) => tag[0] === name)?.[1];
}

// Only sign what an AI design sign-in needs: a NIP-98 event whose `u` tag
// points back at the requesting origin, so a signature can never be replayed
// against another host.
export function checkLoginEvent(
	event: EventTemplate,
	origin: string,
	nowSeconds: number
): LoginEventError | null {
	if (event.kind !== LOGIN_EVENT_KIND) return 'unsupported_kind';
	if (event.content !== '') return 'unexpected_content';
	const u = tagValue(event, 'u');
	let target: URL;
	try {
		target = new URL(u ?? '');
	} catch {
		return 'foreign_url';
	}
	if (target.origin !== origin) return 'foreign_url';
	if (!tagValue(event, 'method')) return 'missing_method';
	if (Math.abs(event.created_at - nowSeconds) > MAX_CLOCK_SKEW_SECONDS) return 'stale_timestamp';
	return null;
}

export function isEventTemplate(value: unknown): value is EventTemplate {
	if (typeof value !== 'object' || value === null) return false;
	const event = value as Partial<EventTemplate>;
	return (
		Number.isInteger(event.kind) &&
		Number.isInteger(event.created_at) &&
		typeof event.content === 'string' &&
		Array.isArray(event.tags) &&
		event.tags.every((tag) => Array.isArray(tag) && tag.every((part) => typeof part === 'string'))
	);
}
