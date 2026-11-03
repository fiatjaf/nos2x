<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-Cadbos-BSL-1.1

Cadbos Interior Design AI is licensed under the Business Source License 1.1.
Access is limited to automated analysis tools for analysis of this repository.
This code is not open for contribution or usage except under a separate written
agreement with Cadbos company.

Commercial use in Interior Design & AEC Generative AI Services is prohibited
before the Change Date. See LICENSE for complete terms.
-->

<script lang="ts">
	import { KeyRound, Lock, Settings, ShieldCheck } from '@lucide/svelte';
	import Brand from '../../lib/ui/Brand.svelte';
	import LocaleSwitch from '../../lib/ui/LocaleSwitch.svelte';
	import KeyRows from '../../lib/ui/KeyRows.svelte';
	import UnlockForm from '../../lib/ui/UnlockForm.svelte';
	import { account } from '../../lib/state/account.svelte';
	import { lock } from '../../lib/keystore';
	import { t } from '../../lib/i18n/index.svelte';

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

	function openOnboarding(): void {
		chrome.tabs
			.create({ url: chrome.runtime.getURL('pages/onboarding/index.html') })
			.then(() => window.close())
			.catch((error: unknown) => console.error('Opening onboarding failed:', error));
	}

	function openSettings(): void {
		chrome.runtime
			.openOptionsPage()
			.then(() => window.close())
			.catch((error: unknown) => console.error('Opening settings failed:', error));
	}
</script>

<main class="popup">
	<h1 class="visually-hidden">{t('brand.name')}</h1>
	<header class="header">
		<Brand />
		<LocaleSwitch />
	</header>

	{#if account.status?.state === 'none'}
		<section class="body empty">
			<span class="icon"><KeyRound size={20} strokeWidth={1.8} aria-hidden="true" /></span>
			<p class="muted">{t('popup.noAccount')}</p>
			<button type="button" class="button primary wide" onclick={openOnboarding}>
				{t('popup.start')}
			</button>
		</section>
	{:else if account.status?.state === 'locked'}
		<section class="body stack">
			<p class="state locked">
				<Lock size={16} strokeWidth={1.8} aria-hidden="true" />
				{t('popup.locked')}
			</p>
			<KeyRows {rows} />
			<UnlockForm />
		</section>
	{:else if account.status?.state === 'ready'}
		<section class="body stack">
			<p class="state ready">
				<ShieldCheck size={16} strokeWidth={1.8} aria-hidden="true" />
				{t('popup.ready')}
			</p>
			<KeyRows {rows} />
			{#if account.status.passwordProtected}
				<button
					type="button"
					class="button secondary"
					onclick={() =>
						lock().catch((error: unknown) => console.error('Locking the key failed:', error))}
				>
					<Lock size={16} strokeWidth={1.8} aria-hidden="true" />
					{t('popup.lock')}
				</button>
			{/if}
		</section>
	{/if}

	{#if account.status && account.status.state !== 'none'}
		<footer class="footer">
			<button type="button" class="link" onclick={openSettings}>
				<Settings size={14} strokeWidth={1.8} aria-hidden="true" />
				{t('popup.settings')}
			</button>
		</footer>
	{/if}
</main>

<style>
	.popup {
		width: 360px;
		background: var(--color-surface);
		border-top: 4px solid var(--logo-green);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid var(--color-border);
	}

	.body {
		padding: 16px;
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: 12px;
		padding: 24px 16px;
		text-align: center;
	}

	.wide {
		width: 100%;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgb(47 111 79 / 0.1);
		color: var(--color-accent-text);
	}

	.state {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}

	.state.ready {
		color: var(--color-accent-text);
	}

	.state.locked {
		color: var(--color-muted);
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		padding: 0 16px 14px;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 0;
		border: none;
		background: transparent;
		color: var(--color-muted);
		font-size: 13px;
		cursor: pointer;
	}

	.link:hover,
	.link:focus-visible {
		color: var(--color-text);
	}
</style>
