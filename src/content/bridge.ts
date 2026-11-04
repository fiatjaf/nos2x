/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { ACCOUNT_KEY } from '../lib/keystore';
import {
	BRIDGE_CHANNEL,
	PAGE_CHANNEL,
	type BridgeMessage,
	type PageRequest,
	type RpcRequest,
	type RpcResponse
} from '../lib/protocol';

// Isolated-world relay between the page provider and the service worker.

window.addEventListener('message', (event: MessageEvent<PageRequest>) => {
	if (event.source !== window || event.data?.channel !== PAGE_CHANNEL) return;
	const { id, method, params } = event.data;
	// After the extension is reloaded or updated, this script stays in already
	// open tabs and `sendMessage` throws synchronously; the page must still get
	// an answer instead of waiting forever.
	Promise.resolve()
		.then(() =>
			chrome.runtime.sendMessage<RpcRequest, RpcResponse>({ kind: 'rpc', method, params })
		)
		.catch((error: unknown): RpcResponse => {
			console.error('AI Design Signer could not reach its service worker:', error);
			return { ok: false, error: 'disconnected' };
		})
		.then((response) => {
			window.postMessage(
				{ channel: BRIDGE_CHANNEL, kind: 'response', id, response } satisfies BridgeMessage,
				location.origin
			);
		});
});

// Lets AI design sign in as soon as a key is saved, e.g. when onboarding
// finishes in another tab.
chrome.storage.local.onChanged.addListener((changes) => {
	if (!(ACCOUNT_KEY in changes)) return;
	window.postMessage(
		{ channel: BRIDGE_CHANNEL, kind: 'accountchange' } satisfies BridgeMessage,
		location.origin
	);
});
