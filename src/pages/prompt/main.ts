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

import type { PromptDetails, PromptMessage } from '../../lib/protocol';
import { mountPage } from '../../lib/ui/mount-page';
import Prompt from './Prompt.svelte';

async function start(): Promise<void> {
	const promptId = new URLSearchParams(location.search).get('id') ?? '';
	const details = await chrome.runtime.sendMessage<PromptMessage, PromptDetails | null>({
		kind: 'prompt:details',
		promptId
	});
	await mountPage(Prompt, { promptId, details });
	fitWindowToCard();
}

// The window opens tall enough for the largest prompt, then follows the card's
// height, including when an error message appears under a field.
function fitWindowToCard(): void {
	const card = document.querySelector('main');
	if (!card) return;
	const fit = (): void => {
		const { top, bottom } = card.getBoundingClientRect();
		const height = Math.ceil(bottom + top) + window.outerHeight - window.innerHeight;
		chrome.windows
			.getCurrent()
			.then((current) =>
				current.id !== undefined && current.height !== height
					? chrome.windows.update(current.id, { height })
					: undefined
			)
			.catch((error: unknown) => console.error('Fitting the prompt window failed:', error));
	};
	new ResizeObserver(fit).observe(card);
}

start().catch((error: unknown) => console.error('Prompt failed to start:', error));
