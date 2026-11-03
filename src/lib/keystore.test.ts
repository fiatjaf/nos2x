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

import { beforeEach, describe, expect, it } from 'vitest';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { stubChromeStorage } from '../test/chrome-storage';
import {
	accountStatus,
	lock,
	removeAccount,
	saveAccount,
	setPassword,
	signingKey,
	unlock
} from './keystore';

let storage: ReturnType<typeof stubChromeStorage>;

beforeEach(() => {
	storage = stubChromeStorage();
});

describe('keystore', () => {
	it('reports no account until one is saved', async () => {
		expect(await accountStatus()).toEqual({ state: 'none' });
		expect(await signingKey()).toBeNull();
	});

	it('stores a key without a password and signs right away', async () => {
		const secretKey = generateSecretKey();
		const pubkey = await saveAccount(secretKey);
		expect(pubkey).toBe(getPublicKey(secretKey));
		expect(await accountStatus()).toEqual({ state: 'ready', pubkey, passwordProtected: false });
		expect(await signingKey()).toEqual(secretKey);
	});

	it('never stores a password-protected key in plain form', async () => {
		const secretKey = generateSecretKey();
		await saveAccount(secretKey, 'correct horse');
		expect(JSON.stringify(storage.local.get('account'))).toContain('ncryptsec1');
		expect(JSON.stringify([...storage.local.values()])).not.toContain(
			Buffer.from(secretKey).toString('hex')
		);
	});

	it('locks a password-protected key and unlocks it only with the right password', async () => {
		const secretKey = generateSecretKey();
		const pubkey = await saveAccount(secretKey, 'correct horse');
		await lock();
		expect(await accountStatus()).toEqual({ state: 'locked', pubkey });
		expect(await signingKey()).toBeNull();

		expect(await unlock('wrong')).toBe('wrong_password');
		expect(await accountStatus()).toEqual({ state: 'locked', pubkey });

		expect(await unlock('correct horse')).toBe('unlocked');
		expect(await signingKey()).toEqual(secretKey);
	});

	it('adds, changes and removes the password of an unlocked key', async () => {
		const secretKey = generateSecretKey();
		const pubkey = await saveAccount(secretKey);
		await setPassword('first');
		await lock();
		expect(await unlock('first')).toBe('unlocked');
		await setPassword(null);
		expect(await accountStatus()).toEqual({ state: 'ready', pubkey, passwordProtected: false });
		expect(await signingKey()).toEqual(secretKey);
	});

	it('refuses to change the password of a locked key', async () => {
		await saveAccount(generateSecretKey(), 'pw');
		await lock();
		await expect(setPassword('new')).rejects.toThrow();
	});

	it('forgets the key and its unlocked copy on removal', async () => {
		await saveAccount(generateSecretKey(), 'pw');
		await removeAccount();
		expect(await accountStatus()).toEqual({ state: 'none' });
		expect(storage.session.size).toBe(0);
	});
});
