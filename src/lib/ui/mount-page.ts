/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { mount, type Component } from 'svelte';
import { loadLocale } from '../i18n/index.svelte';
import './theme.css';

export async function mountPage<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props: Props
): Promise<void> {
	await loadLocale();
	const target = document.getElementById('app');
	if (!target) throw new Error('Page root #app is missing');
	mount(component, { target, props });
}
