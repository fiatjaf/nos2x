/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { npubEncode } from 'nostr-tools/nip19';
import { accountStatus, type AccountStatus } from '../keystore';
import { approvedOrigins } from '../approvals';

// The account as the extension pages see it — the single source of truth for
// popup, onboarding and settings. Storage is the real owner, so any change
// (another window, the service worker after an unlock) triggers a re-read.
class AccountState {
	status = $state<AccountStatus | null>(null);
	approvedOrigins = $state<string[]>([]);

	npub = $derived(
		this.status && this.status.state !== 'none' ? npubEncode(this.status.pubkey) : null
	);

	#latestRefresh = 0;

	// Listening starts before the first read, so a change during it still
	// triggers a later refresh.
	async load(): Promise<void> {
		chrome.storage.onChanged.addListener((_, area) => {
			if (area !== 'local' && area !== 'session') return;
			this.refresh().catch((error: unknown) =>
				console.error('Refreshing the account state failed:', error)
			);
		});
		await this.refresh();
	}

	// One storage update can fire several changes in a row; only the refresh
	// started last may write, so a slower earlier read never wins.
	async refresh(): Promise<void> {
		const request = ++this.#latestRefresh;
		const status = await accountStatus();
		const origins = status.state === 'none' ? [] : await approvedOrigins(status.pubkey);
		if (request !== this.#latestRefresh) return;
		this.approvedOrigins = origins;
		this.status = status;
	}
}

export const account = new AccountState();
