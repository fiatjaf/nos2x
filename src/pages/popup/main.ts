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

import { account } from '../../lib/state/account.svelte';
import { mountPage } from '../../lib/ui/mount-page';
import Popup from './Popup.svelte';

async function start(): Promise<void> {
	await account.load();
	await mountPage(Popup, {});
}

start().catch((error: unknown) => console.error('Popup failed to start:', error));
