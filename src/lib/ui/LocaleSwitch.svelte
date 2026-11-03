<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { Languages } from '@lucide/svelte';
	import { getLocale, setLocale, t } from '../i18n/index.svelte';

	function toggle(): void {
		setLocale(getLocale() === 'ru' ? 'en' : 'ru').catch((error: unknown) =>
			console.error('Saving the locale failed:', error)
		);
	}
</script>

<button type="button" class="locale" onclick={toggle}>
	<Languages size={14} strokeWidth={1.8} aria-hidden="true" />
	{t('locale.switch')}
</button>

<style>
	.locale {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: transparent;
		color: var(--color-muted);
		font-size: 12px;
		cursor: pointer;
	}

	.locale:hover,
	.locale:focus-visible {
		color: var(--color-text);
		border-color: var(--color-border-focus);
	}
</style>
