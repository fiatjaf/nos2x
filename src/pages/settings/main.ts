/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { account } from '../../lib/state/account.svelte';
import { mountPage } from '../../lib/ui/mount-page';
import Settings from './Settings.svelte';

async function start(): Promise<void> {
	await account.load();
	await mountPage(Settings, {});
}

start().catch((error: unknown) => console.error('Settings failed to start:', error));
