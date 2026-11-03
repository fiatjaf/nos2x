/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import type { PromptAnswerResponse, PromptDetails } from '../lib/protocol';
import { addAccount, unlock } from '../lib/keystore';
import { approve } from '../lib/approvals';

const WIDTH = 400;
// The import prompt adds the public key and the optional password fields.
const HEIGHTS: Record<PromptDetails['kind'], number> = { connect: 640, import: 740 };

interface PendingPrompt {
	details: PromptDetails;
	pubkey: string;
	secretKey: Uint8Array | null;
	windowId: number | null;
	settle: (approved: boolean) => void;
}

const pending = new Map<string, PendingPrompt>();

export function promptDetails(promptId: string): PromptDetails | null {
	return pending.get(promptId)?.details ?? null;
}

export async function answerPrompt(
	promptId: string,
	approved: boolean,
	password: string | undefined
): Promise<PromptAnswerResponse> {
	const prompt = pending.get(promptId);
	if (!prompt) return { ok: false, error: 'expired' };
	if (!approved) {
		finish(promptId, false, true);
		return { ok: true };
	}
	const { details } = prompt;
	if (details.kind === 'import') {
		// Onboarding may have saved another key while this prompt was open.
		const saved = prompt.secretKey && (await addAccount(prompt.secretKey, password || undefined));
		if (!saved) {
			finish(promptId, false, true);
			return { ok: true };
		}
		await approve(prompt.pubkey, details.origin);
	} else {
		if (details.unlock && (await unlock(password ?? '')) === 'wrong_password') {
			return { ok: false, error: 'wrong_password' };
		}
		if (details.approve) await approve(prompt.pubkey, details.origin);
	}
	finish(promptId, true, true);
	return { ok: true };
}

chrome.windows.onRemoved.addListener((windowId) => {
	for (const [promptId, prompt] of pending) {
		if (prompt.windowId === windowId) finish(promptId, false, false);
	}
});

function finish(promptId: string, approved: boolean, closeWindow: boolean): void {
	const prompt = pending.get(promptId);
	if (!prompt) return;
	pending.delete(promptId);
	prompt.settle(approved);
	if (closeWindow && prompt.windowId !== null) {
		chrome.windows
			.remove(prompt.windowId)
			.catch((error: unknown) => console.error('Closing the prompt window failed:', error));
	}
}

// The secret key of an import prompt stays in the service worker; the prompt
// window only receives the public key to show.
export async function requestPrompt(
	details: PromptDetails,
	pubkey: string,
	secretKey: Uint8Array | null = null
): Promise<boolean> {
	const promptId = crypto.randomUUID();
	const result = new Promise<boolean>((settle) => {
		pending.set(promptId, { details, pubkey, secretKey, windowId: null, settle });
	});
	try {
		const anchor = await chrome.windows.getLastFocused();
		const left = (anchor.left ?? 0) + Math.max(0, ((anchor.width ?? WIDTH) - WIDTH) / 2);
		const height = HEIGHTS[details.kind];
		const top = (anchor.top ?? 0) + Math.max(0, ((anchor.height ?? height) - height) / 3);
		const created = await chrome.windows.create({
			url: chrome.runtime.getURL(`pages/prompt/index.html?id=${promptId}`),
			type: 'popup',
			width: WIDTH,
			height,
			left: Math.round(left),
			top: Math.round(top),
			focused: true
		});
		const prompt = pending.get(promptId);
		if (prompt) prompt.windowId = created?.id ?? null;
	} catch (error) {
		pending.delete(promptId);
		throw error;
	}
	return result;
}
