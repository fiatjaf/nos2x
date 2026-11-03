/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

export interface AccountKeyFile {
	title: string;
	publicLabel: string;
	publicKey: string;
	secretLabel: string;
	secretKey: string;
	warning: string;
}

// The same layout AI design uses for its key file, so a file from either one
// can be imported into the other.
export function formatAccountKeyFile(file: AccountKeyFile): string {
	return [
		file.title,
		'',
		file.publicLabel,
		file.publicKey,
		'',
		file.secretLabel,
		file.secretKey,
		'',
		file.warning,
		''
	].join('\n');
}

export function downloadTextFile(fileName: string, contents: string): void {
	const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
