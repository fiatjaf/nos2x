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

	async load(): Promise<void> {
		await this.refresh();
		chrome.storage.onChanged.addListener((_, area) => {
			if (area !== 'local' && area !== 'session') return;
			this.refresh().catch((error: unknown) =>
				console.error('Refreshing the account state failed:', error)
			);
		});
	}

	async refresh(): Promise<void> {
		const status = await accountStatus();
		this.approvedOrigins = status.state === 'none' ? [] : await approvedOrigins(status.pubkey);
		this.status = status;
	}
}

export const account = new AccountState();
