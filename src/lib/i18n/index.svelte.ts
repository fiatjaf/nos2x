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

import { en, ru, type Dictionary } from './locales';

export type Locale = 'ru' | 'en';
export type TranslationKey = keyof Dictionary;

const dictionaries: Record<Locale, Dictionary> = { ru, en };
const STORAGE_KEY = 'locale';

function isLocale(value: unknown): value is Locale {
	return value === 'ru' || value === 'en';
}

function browserLocale(): Locale {
	return chrome.i18n.getUILanguage().toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

let locale = $state<Locale>(browserLocale());

function apply(next: Locale): void {
	locale = next;
	document.documentElement.lang = next;
}

export function getLocale(): Locale {
	return locale;
}

// The choice lives in extension storage so the popup, onboarding and prompt
// windows agree, and a change in one window reaches the others.
export async function loadLocale(): Promise<void> {
	const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
	apply(isLocale(stored) ? stored : locale);
	chrome.storage.local.onChanged.addListener((changes) => {
		const next = changes[STORAGE_KEY]?.newValue;
		if (isLocale(next)) apply(next);
	});
}

export async function setLocale(next: Locale): Promise<void> {
	apply(next);
	await chrome.storage.local.set({ [STORAGE_KEY]: next });
}

export function t(key: TranslationKey): string {
	return dictionaries[locale][key];
}

export function ti(key: TranslationKey, params: Record<string, string | number>): string {
	return t(key).replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
}
