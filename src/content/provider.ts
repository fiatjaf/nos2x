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

import type { EventTemplate, VerifiedEvent } from 'nostr-tools/pure';
import {
	ACCOUNT_CHANGE_EVENT,
	BRIDGE_CHANNEL,
	PAGE_CHANNEL,
	type BridgeMessage,
	type PageRequest,
	type RpcMethod,
	type RpcMethods,
	type SignerErrorCode
} from '../lib/protocol';

// Runs in the page's main world on AI design origins. `window.nostr` is the
// standard NIP-07 surface; `window.aiDesignSigner` is the same signer under a
// name no other extension overwrites, plus the calls AI design uses to make
// the app ↔ extension hand-off seamless.

class SignerRequestError extends Error {
	readonly code: SignerErrorCode;

	constructor(code: SignerErrorCode) {
		super(code);
		this.name = 'SignerRequestError';
		this.code = code;
	}
}

const waiting = new Map<
	string,
	{ resolve: (value: unknown) => void; reject: (error: Error) => void }
>();

window.addEventListener('message', (event: MessageEvent<BridgeMessage>) => {
	if (event.source !== window || event.data?.channel !== BRIDGE_CHANNEL) return;
	if (event.data.kind === 'accountchange') {
		window.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));
		return;
	}
	const request = waiting.get(event.data.id);
	if (!request) return;
	waiting.delete(event.data.id);
	const { response } = event.data;
	if (response.ok) request.resolve(response.result);
	else request.reject(new SignerRequestError(response.error));
});

function call<M extends RpcMethod>(
	method: M,
	params: RpcMethods[M]['params']
): Promise<RpcMethods[M]['result']> {
	const id = crypto.randomUUID();
	return new Promise((resolve, reject) => {
		waiting.set(id, { resolve: resolve as (value: unknown) => void, reject });
		window.postMessage(
			{ channel: PAGE_CHANNEL, id, method, params } satisfies PageRequest,
			location.origin
		);
	});
}

const nostr = {
	getPublicKey: (): Promise<string> => call('getPublicKey', {}),
	signEvent: (event: EventTemplate): Promise<VerifiedEvent> => call('signEvent', { event })
};

const aiDesignSigner = Object.freeze({
	...nostr,
	status: () => call('status', {}),
	openOnboarding: () => call('openOnboarding', {}),
	importKey: (secretKey: string) => call('importKey', { secretKey })
});

Object.defineProperty(window, 'aiDesignSigner', { value: aiDesignSigner, enumerable: false });
Object.assign(window, { nostr });
