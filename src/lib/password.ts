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

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordProblem = 'password.tooShort' | 'password.mismatch';

export function passwordProblem(password: string, repeat: string): PasswordProblem | null {
	if (password.length < MIN_PASSWORD_LENGTH) return 'password.tooShort';
	if (password !== repeat) return 'password.mismatch';
	return null;
}
