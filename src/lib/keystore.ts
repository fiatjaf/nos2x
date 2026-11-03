/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { decrypt, encrypt } from 'nostr-tools/nip49';
import { getPublicKey } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from 'nostr-tools/utils';

// One account per extension. Without a password the secret key is stored as
// hex; with one it is stored as a NIP-49 `ncryptsec`, and the decrypted key is
// kept in session storage until the browser restarts or the user locks it.
// Session storage is not exposed to content scripts, so the decrypted key
// never leaves the extension's own pages and service worker.

export const ACCOUNT_KEY = 'account';
const UNLOCKED_KEY = 'unlockedSecret';

type StoredSecret = { kind: 'plain'; hex: string } | { kind: 'encrypted'; ncryptsec: string };

interface StoredAccount {
	pubkey: string;
	secret: StoredSecret;
}

export type AccountStatus =
	| { state: 'none' }
	| { state: 'locked'; pubkey: string }
	| { state: 'ready'; pubkey: string; passwordProtected: boolean };

export type UnlockResult = 'unlocked' | 'wrong_password';

const hex32 = /^[0-9a-f]{64}$/;

function isStoredAccount(value: unknown): value is StoredAccount {
	if (typeof value !== 'object' || value === null) return false;
	const { pubkey, secret } = value as Partial<StoredAccount>;
	if (typeof pubkey !== 'string' || !hex32.test(pubkey)) return false;
	if (typeof secret !== 'object' || secret === null) return false;
	if (secret.kind === 'plain') return typeof secret.hex === 'string' && hex32.test(secret.hex);
	if (secret.kind === 'encrypted') {
		return typeof secret.ncryptsec === 'string' && secret.ncryptsec.startsWith('ncryptsec1');
	}
	return false;
}

async function readAccount(): Promise<StoredAccount | null> {
	const value = (await chrome.storage.local.get(ACCOUNT_KEY))[ACCOUNT_KEY];
	if (value === undefined) return null;
	if (!isStoredAccount(value)) throw new Error('Stored account has an unexpected shape');
	return value;
}

async function readUnlocked(): Promise<string | null> {
	const value = (await chrome.storage.session.get(UNLOCKED_KEY))[UNLOCKED_KEY];
	return typeof value === 'string' && hex32.test(value) ? value : null;
}

export async function accountStatus(): Promise<AccountStatus> {
	const account = await readAccount();
	if (!account) return { state: 'none' };
	if (account.secret.kind === 'plain') {
		return { state: 'ready', pubkey: account.pubkey, passwordProtected: false };
	}
	return (await readUnlocked())
		? { state: 'ready', pubkey: account.pubkey, passwordProtected: true }
		: { state: 'locked', pubkey: account.pubkey };
}

export async function saveAccount(secretKey: Uint8Array, password?: string): Promise<string> {
	const pubkey = getPublicKey(secretKey);
	const secret: StoredSecret = password
		? { kind: 'encrypted', ncryptsec: encrypt(secretKey, password) }
		: { kind: 'plain', hex: bytesToHex(secretKey) };
	await chrome.storage.local.set({ [ACCOUNT_KEY]: { pubkey, secret } satisfies StoredAccount });
	if (password) await chrome.storage.session.set({ [UNLOCKED_KEY]: bytesToHex(secretKey) });
	else await chrome.storage.session.remove(UNLOCKED_KEY);
	return pubkey;
}

// Saves the key only when no account exists yet, and returns null otherwise.
// Onboarding and the service worker's import prompt can both add a key; the
// Web Lock spans every extension context, so one of them never overwrites the
// key the other has just saved.
export async function addAccount(secretKey: Uint8Array, password?: string): Promise<string | null> {
	return navigator.locks.request('account', async () =>
		(await readAccount()) ? null : saveAccount(secretKey, password)
	);
}

export async function unlock(password: string): Promise<UnlockResult> {
	const account = await readAccount();
	if (!account) throw new Error('No account to unlock');
	if (account.secret.kind === 'plain') return 'unlocked';
	let secretKey: Uint8Array;
	try {
		secretKey = decrypt(account.secret.ncryptsec, password);
	} catch {
		// NIP-49 decryption fails only with a wrong password for a well-formed ncryptsec.
		return 'wrong_password';
	}
	if (getPublicKey(secretKey) !== account.pubkey) return 'wrong_password';
	await chrome.storage.session.set({ [UNLOCKED_KEY]: bytesToHex(secretKey) });
	return 'unlocked';
}

export async function lock(): Promise<void> {
	await chrome.storage.session.remove(UNLOCKED_KEY);
}

export async function signingKey(): Promise<Uint8Array | null> {
	const account = await readAccount();
	if (!account) return null;
	if (account.secret.kind === 'plain') return hexToBytes(account.secret.hex);
	const unlocked = await readUnlocked();
	return unlocked ? hexToBytes(unlocked) : null;
}

// Sets, changes or (with null) removes the password. Needs the key unlocked.
export async function setPassword(password: string | null): Promise<void> {
	const secretKey = await signingKey();
	if (!secretKey) throw new Error('The key must be unlocked to change its password');
	await saveAccount(secretKey, password ?? undefined);
}

export async function removeAccount(): Promise<void> {
	await chrome.storage.local.remove(ACCOUNT_KEY);
	await chrome.storage.session.remove(UNLOCKED_KEY);
}
