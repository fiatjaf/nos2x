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
	import { LockKeyhole } from '@lucide/svelte';
	import { t } from '../../lib/i18n/index.svelte';
	import type { PromptAnswerResponse } from '../../lib/protocol';
	import OriginPill from './OriginPill.svelte';

	interface Props {
		origin: string;
		approve: boolean;
		unlock: boolean;
		onanswer: (approved: boolean, password?: string) => Promise<PromptAnswerResponse>;
	}

	let { origin, approve, unlock, onanswer }: Props = $props();

	let password = $state('');
	let wrongPassword = $state(false);
	let busy = $state(false);

	async function answer(approved: boolean): Promise<void> {
		busy = true;
		wrongPassword = false;
		try {
			const response = await onanswer(approved, unlock ? password : undefined);
			if (!response.ok) {
				wrongPassword = true;
				password = '';
			}
		} finally {
			busy = false;
		}
	}

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		void answer(true);
	}
</script>

<form class="stack" onsubmit={submit}>
	<h1>{approve ? t('prompt.connectTitle') : t('prompt.unlockTitle')}</h1>

	{#if approve}
		<p>{t('prompt.connectText')}</p>
		<OriginPill {origin} />
		<p class="muted">{t('prompt.connectSafe')}</p>
	{/if}

	{#if unlock}
		<label class="field">
			<span>{approve ? t('password.new') : t('prompt.unlockText')}</span>
			<span class="icon-input">
				<LockKeyhole size={16} strokeWidth={1.8} aria-hidden="true" />
				<input
					type="password"
					autocomplete="current-password"
					bind:value={password}
					aria-invalid={wrongPassword}
					required
				/>
			</span>
		</label>
		{#if wrongPassword}
			<p class="error" role="alert">{t('password.wrong')}</p>
		{/if}
	{/if}

	<div class="actions">
		<button
			type="button"
			class="button secondary"
			disabled={busy}
			onclick={() => void answer(false)}
		>
			{t('prompt.deny')}
		</button>
		<button type="submit" class="button primary" disabled={busy}>
			{approve ? t('prompt.allow') : t('unlock.submit')}
		</button>
	</div>
</form>
