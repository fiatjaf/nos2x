<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1

AI Design Signer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { ArrowUpRight, ChevronRight, KeyRound } from '@lucide/svelte';
	import { t } from '../../lib/i18n/index.svelte';
	import { returnOrigin } from './return-origin.svelte';

	interface Props {
		onimport: () => void;
	}

	let { onimport }: Props = $props();

	// Accounts are created in AI design; `?auth=signup` opens its account setup.
	const signupUrl = $derived(`${returnOrigin.value ?? 'https://app.cadbos.com'}/?auth=signup`);
</script>

<section class="stack">
	<h1>{t('welcome.title')}</h1>
	<p class="lead">{t('welcome.description')}</p>

	<div class="choices">
		<button type="button" class="choice primary" onclick={onimport}>
			<span class="icon"><KeyRound size={18} strokeWidth={1.8} aria-hidden="true" /></span>
			<span class="label">
				<span class="title">{t('welcome.import')}</span>
				<span class="hint">{t('welcome.importHint')}</span>
			</span>
			<ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</button>
		<a class="choice" href={signupUrl} target="_blank" rel="noopener">
			<span class="icon"><ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" /></span>
			<span class="label">
				<span class="title">{t('welcome.create')}</span>
				<span class="hint">{t('welcome.createHint')}</span>
			</span>
		</a>
	</div>
</section>

<style>
	.lead {
		margin-bottom: 8px;
		color: var(--color-muted);
	}

	.choices {
		display: grid;
		gap: 10px;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
		color: var(--color-text);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.choice:hover,
	.choice:focus-visible {
		border-color: var(--color-border-focus);
		background: var(--color-surface-hover);
	}

	.choice.primary {
		border-color: transparent;
		background: var(--color-accent);
		color: var(--color-accent-contrast);
	}

	.choice.primary:hover,
	.choice.primary:focus-visible {
		background: var(--color-accent-hover);
	}

	.icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: rgb(47 111 79 / 0.1);
		color: var(--color-accent-text);
	}

	.primary .icon {
		background: rgb(255 255 255 / 0.16);
		color: inherit;
	}

	.label {
		display: grid;
		flex: 1;
		min-width: 0;
	}

	.title {
		font-weight: 600;
	}

	.hint {
		font-size: 12px;
		opacity: 0.75;
	}

	.primary .hint {
		opacity: 1;
	}
</style>
