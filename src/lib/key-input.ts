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

import { decode } from 'nostr-tools/nip19';
import { hexToBytes } from 'nostr-tools/utils';

export type KeyInput =
	{ kind: 'secret'; secretKey: Uint8Array } | { kind: 'encrypted'; ncryptsec: string };

const nsecPattern = /\bnsec1[02-9ac-hj-np-z]{58}\b/;
const ncryptsecPattern = /\bncryptsec1[02-9ac-hj-np-z]+\b/;
const hexPattern = /^[0-9a-fA-F]{64}$/;

// Reads a secret key typed or pasted by the user, or the contents of the key
// file AI design and this extension download: an `nsec`, a 64-character hex
// key, or a password-protected NIP-49 `ncryptsec`.
export function parseKeyInput(text: string): KeyInput | null {
	const trimmed = text.trim();
	if (hexPattern.test(trimmed)) {
		return { kind: 'secret', secretKey: hexToBytes(trimmed.toLowerCase()) };
	}

	const ncryptsec = ncryptsecPattern.exec(trimmed)?.[0];
	if (ncryptsec) return { kind: 'encrypted', ncryptsec };

	const nsec = nsecPattern.exec(trimmed)?.[0];
	if (!nsec) return null;
	try {
		const decoded = decode(nsec);
		return decoded.type === 'nsec' ? { kind: 'secret', secretKey: decoded.data } : null;
	} catch {
		// A checksum mismatch means the key was mistyped; the caller shows that as invalid input.
		return null;
	}
}
