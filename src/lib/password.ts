/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordProblem = 'password.tooShort' | 'password.mismatch';

export function passwordProblem(password: string, repeat: string): PasswordProblem | null {
	if (password.length < MIN_PASSWORD_LENGTH) return 'password.tooShort';
	if (password !== repeat) return 'password.mismatch';
	return null;
}
