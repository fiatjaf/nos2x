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
	chrome.runtime
		.sendMessage<RpcRequest, RpcResponse>({ kind: 'rpc', method, params })
		.catch((error: unknown): RpcResponse => {
			console.error('AI Design Singer could not reach its service worker:', error);
			return { ok: false, error: 'internal' };
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
