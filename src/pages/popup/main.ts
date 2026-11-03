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
import Popup from './Popup.svelte';

async function start(): Promise<void> {
	await account.load();
	await mountPage(Popup, {});
}

start().catch((error: unknown) => console.error('Popup failed to start:', error));
