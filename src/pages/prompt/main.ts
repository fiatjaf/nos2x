/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
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
	const page = card?.parentElement;
	if (!card || !page) return;
	// The page centres the card, so the window needs the card plus the page's
	// vertical padding, not the card's offset from the top.
	const fit = (): void => {
		const { paddingTop, paddingBottom } = getComputedStyle(page);
		const content =
			card.getBoundingClientRect().height + parseFloat(paddingTop) + parseFloat(paddingBottom);
		const height = Math.ceil(content) + window.outerHeight - window.innerHeight;
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
