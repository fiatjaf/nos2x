<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';
	import { t } from '../../lib/i18n/index.svelte';
	import { account } from '../../lib/state/account.svelte';
	import KeyRows from '../../lib/ui/KeyRows.svelte';
	import { returnOrigin } from './return-origin.svelte';

	const rows = $derived(
		account.npub
			? [
					{
						kind: 'public' as const,
						label: t('auth.setup.publicLabel'),
						value: account.npub,
						copy: t('auth.setup.copyPublic'),
						done: t('auth.setup.copiedPublic')
					}
				]
			: []
	);

	// Brings back the AI design tab that sent the user here, or opens AI design
	// at that address, and closes onboarding.
	async function returnToApp(): Promise<void> {
		const origin = returnOrigin.value;
		if (!origin) return;
		const [appTab] = await chrome.tabs.query({ url: `${origin}/*` });
		if (appTab?.id !== undefined) {
			await chrome.tabs.update(appTab.id, { active: true });
			if (appTab.windowId !== undefined) {
				await chrome.windows.update(appTab.windowId, { focused: true });
			}
		} else {
			await chrome.tabs.create({ url: origin });
		}
		const current = await chrome.tabs.getCurrent();
		if (current?.id !== undefined) await chrome.tabs.remove(current.id);
	}
</script>

<section class="stack done">
	<span class="badge"><CircleCheck size={28} strokeWidth={1.8} aria-hidden="true" /></span>
	<h1>{t('done.title')}</h1>
	<p class="muted">{t('done.description')}</p>
	<KeyRows {rows} />
	{#if returnOrigin.value}
		<button
			type="button"
			class="button primary"
			onclick={() =>
				returnToApp().catch((error: unknown) =>
					console.error('Returning to AI design failed:', error)
				)}
		>
			{t('auth.setup.finish')}
		</button>
	{:else}
		<p class="notice">{t('done.openApp')}</p>
		<button type="button" class="button secondary" onclick={() => window.close()}>
			{t('common.close')}
		</button>
	{/if}
</section>

<style>
	.done {
		justify-items: stretch;
	}

	.badge {
		display: grid;
		place-items: center;
		width: 52px;
		height: 52px;
		border-radius: 16px;
		background: rgb(47 111 79 / 0.12);
		color: var(--color-accent-text);
	}
</style>
