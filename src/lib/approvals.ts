/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

// Origins the user allowed to sign in with a given account. Keyed by pubkey so
// replacing the account never carries earlier approvals over to the new key.

const APPROVALS_KEY = 'approvedOrigins';

type Approvals = Record<string, string[]>;

async function readApprovals(): Promise<Approvals> {
	const value = (await chrome.storage.local.get(APPROVALS_KEY))[APPROVALS_KEY];
	return typeof value === 'object' && value !== null ? (value as Approvals) : {};
}

export async function isApproved(pubkey: string, origin: string): Promise<boolean> {
	return (await readApprovals())[pubkey]?.includes(origin) ?? false;
}

export async function approve(pubkey: string, origin: string): Promise<void> {
	const approvals = await readApprovals();
	const origins = approvals[pubkey] ?? [];
	if (origins.includes(origin)) return;
	await chrome.storage.local.set({
		[APPROVALS_KEY]: { ...approvals, [pubkey]: [...origins, origin] }
	});
}

export async function approvedOrigins(pubkey: string): Promise<string[]> {
	return (await readApprovals())[pubkey] ?? [];
}

export async function revoke(pubkey: string, origin: string): Promise<void> {
	const approvals = await readApprovals();
	await chrome.storage.local.set({
		[APPROVALS_KEY]: {
			...approvals,
			[pubkey]: (approvals[pubkey] ?? []).filter((item) => item !== origin)
		}
	});
}

export async function forgetApprovals(): Promise<void> {
	await chrome.storage.local.remove(APPROVALS_KEY);
}
