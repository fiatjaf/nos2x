/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import { hexToBytes } from 'nostr-tools/utils';
import { appMatches } from '../manifest';
import { accountStatus, signingKey } from '../lib/keystore';
import { isApproved } from '../lib/approvals';
import { checkLoginEvent, isAppOrigin, isEventTemplate } from '../lib/policy';
import type {
	OnboardingMessage,
	PromptMessage,
	RpcMethod,
	RpcMethods,
	RpcRequest,
	RpcResponse,
	SignerErrorCode
} from '../lib/protocol';
import { answerPrompt, promptDetails, requestPrompt } from './prompts';

const ONBOARDING_PATH = 'pages/onboarding/index.html';
const allowedPatterns = appMatches(import.meta.env.MODE);

// Readiness checks run one at a time: a request that arrives while a prompt is
// open waits for it and then re-checks what it still needs, so one answer
// serves every request queued behind it.
let readiness: Promise<unknown> = Promise.resolve();

class SignerError extends Error {
	readonly code: SignerErrorCode;

	constructor(code: SignerErrorCode) {
		super(code);
		this.code = code;
	}
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason !== chrome.runtime.OnInstalledReason.INSTALL) return;
	openOnboarding().catch((error: unknown) =>
		console.error('Opening onboarding after install failed:', error)
	);
});

chrome.runtime.onMessage.addListener(
	(message: RpcRequest | PromptMessage, sender, sendResponse) => {
		if (message.kind === 'rpc') {
			handleRpc(message, sender).then(sendResponse);
			return true;
		}
		// Prompt messages are accepted only from the extension's own pages, never
		// from content scripts running inside a website.
		if (!sender.url?.startsWith(chrome.runtime.getURL(''))) return false;
		if (message.kind === 'prompt:details') {
			sendResponse(promptDetails(message.promptId));
			return false;
		}
		if (message.kind === 'prompt:answer') {
			answerPrompt(message.promptId, message.approved, message.password)
				.then(sendResponse)
				.catch((error: unknown) => {
					console.error('Answering the prompt failed:', error);
					sendResponse({ ok: true });
				});
			return true;
		}
		return false;
	}
);

async function handleRpc(
	request: RpcRequest,
	sender: chrome.runtime.MessageSender
): Promise<RpcResponse> {
	const origin = sender.origin;
	if (!origin || !sender.tab || !isAppOrigin(origin, allowedPatterns)) {
		return { ok: false, error: 'forbidden_origin' };
	}
	try {
		return { ok: true, result: await dispatch(request.method, request.params, origin) };
	} catch (error) {
		if (error instanceof SignerError) return { ok: false, error: error.code };
		console.error(`Signer request ${request.method} failed:`, error);
		return { ok: false, error: 'internal' };
	}
}

async function dispatch(
	method: RpcMethod,
	params: unknown,
	origin: string
): Promise<RpcMethods[RpcMethod]['result']> {
	switch (method) {
		case 'status': {
			const status = await accountStatus();
			return { hasAccount: status.state !== 'none', locked: status.state === 'locked' };
		}
		case 'openOnboarding':
			await openOnboarding(origin);
			return null;
		case 'getPublicKey':
			return ensureReady(origin);
		case 'importKey': {
			const secretKey = (params as { secretKey?: unknown } | null)?.secretKey;
			if (typeof secretKey !== 'string' || !/^[0-9a-f]{64}$/.test(secretKey)) {
				throw new SignerError('invalid_key');
			}
			return serialized(() => importKey(hexToBytes(secretKey), origin));
		}
		case 'signEvent': {
			const event = (params as { event?: unknown } | null)?.event;
			if (!isEventTemplate(event)) throw new SignerError('invalid_event');
			if (checkLoginEvent(event, origin, Math.floor(Date.now() / 1000))) {
				throw new SignerError('invalid_event');
			}
			const pubkey = await ensureReady(origin);
			// The key may have been replaced since the readiness check; only the
			// approved account signs for this origin.
			const secretKey = await signingKey();
			if (!secretKey || getPublicKey(secretKey) !== pubkey) throw new SignerError('locked');
			return finalizeEvent(event, secretKey);
		}
		default:
			throw new SignerError('internal');
	}
}

function ensureReady(origin: string): Promise<string> {
	return serialized(() => checkReady(origin));
}

function serialized<T>(task: () => Promise<T>): Promise<T> {
	const run = readiness.then(task);
	// The caller receives run's failure; the chain only needs to move on.
	readiness = run.catch(() => undefined);
	return run;
}

// Makes sure the account exists, this origin is approved and the key is
// unlocked, asking the user once in a single prompt window when it is not.
async function checkReady(origin: string): Promise<string> {
	const status = await accountStatus();
	if (status.state === 'none') {
		await openOnboarding(origin);
		throw new SignerError('no_account');
	}
	const approve = !(await isApproved(status.pubkey, origin));
	const unlock = status.state === 'locked';
	if (approve || unlock) {
		const approved = await requestPrompt(
			{ kind: 'connect', origin, approve, unlock },
			status.pubkey
		);
		if (!approved) throw new SignerError('rejected');
	}
	return status.pubkey;
}

// Saves a key AI design created for the user, after they confirm it in the
// extension. The same key already saved only needs the usual readiness check;
// a different one is never overwritten from a website.
async function importKey(secretKey: Uint8Array, origin: string): Promise<string> {
	const pubkey = getPublicKey(secretKey);
	const status = await accountStatus();
	if (status.state !== 'none') {
		if (status.pubkey !== pubkey) throw new SignerError('account_exists');
		return checkReady(origin);
	}
	const saved = await requestPrompt({ kind: 'import', origin, pubkey }, pubkey, secretKey);
	if (!saved) throw new SignerError('rejected');
	return pubkey;
}

// Opens onboarding, or focuses it when already open. When an AI design page
// asked for it, onboarding offers the way back to that page once the account
// is ready.
async function openOnboarding(returnOrigin?: string): Promise<void> {
	const base = chrome.runtime.getURL(ONBOARDING_PATH);
	const contexts = await chrome.runtime.getContexts({
		contextTypes: [chrome.runtime.ContextType.TAB]
	});
	const existing = contexts.find((context) => context.documentUrl?.startsWith(base));
	if (existing) {
		await chrome.tabs.update(existing.tabId, { active: true });
		await chrome.windows.update(existing.windowId, { focused: true });
		if (returnOrigin) {
			await chrome.runtime.sendMessage<OnboardingMessage>({
				kind: 'onboarding:return',
				origin: returnOrigin
			});
		}
		return;
	}
	const url = returnOrigin ? `${base}?${new URLSearchParams({ return: returnOrigin })}` : base;
	await chrome.tabs.create({ url });
}
