/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

import { appMatches } from '../../manifest';
import { isAppOrigin } from '../../lib/policy';
import type { OnboardingMessage } from '../../lib/protocol';

// The AI design page that sent the user to onboarding, to return to once the
// account is ready. It arrives in the URL when onboarding opens, or by message
// when an already open onboarding tab is brought back by another sign-in.
class ReturnOrigin {
	value = $state<string | null>(null);

	listen(): void {
		this.accept(new URLSearchParams(location.search).get('return'));
		chrome.runtime.onMessage.addListener((message: OnboardingMessage) => {
			if (message.kind === 'onboarding:return') this.accept(message.origin);
		});
	}

	accept(origin: string | null): void {
		if (origin && isAppOrigin(origin, appMatches(import.meta.env.MODE))) this.value = origin;
	}
}

export const returnOrigin = new ReturnOrigin();
