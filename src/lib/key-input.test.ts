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
import { encrypt } from 'nostr-tools/nip49';
import { nsecEncode } from 'nostr-tools/nip19';
import { generateSecretKey } from 'nostr-tools/pure';
import { bytesToHex } from 'nostr-tools/utils';
import { parseKeyInput } from './key-input';

describe('parseKeyInput', () => {
	const secretKey = generateSecretKey();
	const nsec = nsecEncode(secretKey);

	it('reads an nsec with surrounding whitespace', () => {
		expect(parseKeyInput(`  ${nsec}\n`)).toEqual({ kind: 'secret', secretKey });
	});

	it('reads a hex key in either case', () => {
		expect(parseKeyInput(bytesToHex(secretKey).toUpperCase())).toEqual({
			kind: 'secret',
			secretKey
		});
	});

	it('finds the secret key inside the downloaded key file', () => {
		const file = [
			'AI design account key',
			'',
			'Public key',
			'npub1xyz',
			'',
			'Secret key',
			nsec
		].join('\n');
		expect(parseKeyInput(file)).toEqual({ kind: 'secret', secretKey });
	});

	it('recognises a password-protected key', () => {
		const ncryptsec = encrypt(secretKey, 'pw', 8);
		expect(parseKeyInput(ncryptsec)).toEqual({ kind: 'encrypted', ncryptsec });
	});

	it('rejects a mistyped nsec and unrelated text', () => {
		const typo = nsec.slice(0, -1) + (nsec.endsWith('q') ? 'p' : 'q');
		expect(parseKeyInput(typo)).toBeNull();
		expect(parseKeyInput('npub1abc')).toBeNull();
		expect(parseKeyInput('')).toBeNull();
	});
});
