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

// Messages between the page provider (main world), the content bridge
// (isolated world) and the service worker.

export const PAGE_CHANNEL = 'ai-design-signer:page';
export const BRIDGE_CHANNEL = 'ai-design-signer:bridge';
// Dispatched on `window` when a key is added to or removed from the extension.
export const ACCOUNT_CHANGE_EVENT = 'ai-design-signer:accountchange';

export type SignerErrorCode =
	| 'no_account'
	| 'account_exists'
	| 'locked'
	| 'rejected'
	| 'forbidden_origin'
	| 'invalid_event'
	| 'invalid_key'
	| 'busy'
	| 'internal';

export interface SignerStatus {
	hasAccount: boolean;
	locked: boolean;
}

export interface RpcMethods {
	status: { params: Record<string, never>; result: SignerStatus };
	getPublicKey: { params: Record<string, never>; result: string };
	signEvent: { params: { event: EventTemplate }; result: VerifiedEvent };
	openOnboarding: { params: Record<string, never>; result: null };
	importKey: { params: { secretKey: string }; result: string };
}

export type RpcMethod = keyof RpcMethods;

export type RpcResponse<M extends RpcMethod = RpcMethod> =
	{ ok: true; result: RpcMethods[M]['result'] } | { ok: false; error: SignerErrorCode };

export interface RpcRequest {
	kind: 'rpc';
	method: RpcMethod;
	params: unknown;
}

export interface PageRequest {
	channel: typeof PAGE_CHANNEL;
	id: string;
	method: RpcMethod;
	params: unknown;
}

export type BridgeMessage =
	| { channel: typeof BRIDGE_CHANNEL; kind: 'response'; id: string; response: RpcResponse }
	| { channel: typeof BRIDGE_CHANNEL; kind: 'accountchange' };

// Prompt window ↔ service worker. A connect prompt covers both a first
// connection from an origin and unlocking a password-protected key; an import
// prompt confirms saving a key AI design created and offers a password.
export type PromptDetails =
	| { kind: 'connect'; origin: string; approve: boolean; unlock: boolean }
	| { kind: 'import'; origin: string; pubkey: string };

export type PromptMessage =
	| { kind: 'prompt:details'; promptId: string }
	| { kind: 'prompt:answer'; promptId: string; approved: boolean; password?: string };

export type PromptAnswerResponse = { ok: true } | { ok: false; error: 'wrong_password' };

// Service worker → an already open onboarding tab.
export interface OnboardingMessage {
	kind: 'onboarding:return';
	origin: string;
}
