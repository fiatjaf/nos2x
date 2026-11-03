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

import { vi } from 'vitest';

type Area = Map<string, unknown>;

function storageArea(area: Area): Pick<chrome.storage.StorageArea, 'get' | 'set' | 'remove'> {
	return {
		get: vi.fn(async (key: string) => (area.has(key) ? { [key]: area.get(key) } : {})),
		set: vi.fn(async (items: Record<string, unknown>) => {
			for (const [key, value] of Object.entries(items)) area.set(key, structuredClone(value));
		}),
		remove: vi.fn(async (key: string) => {
			area.delete(key);
		})
	} as unknown as Pick<chrome.storage.StorageArea, 'get' | 'set' | 'remove'>;
}

// In-memory `chrome.storage.local` and `chrome.storage.session` for unit tests.
export function stubChromeStorage(): { local: Area; session: Area } {
	const local: Area = new Map();
	const session: Area = new Map();
	vi.stubGlobal('chrome', {
		storage: { local: storageArea(local), session: storageArea(session) }
	});
	return { local, session };
}
