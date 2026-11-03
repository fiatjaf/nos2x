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
