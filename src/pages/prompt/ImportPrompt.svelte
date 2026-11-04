<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1

AI Design Signer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { t } from '../../lib/i18n/index.svelte';
	import type { PromptAnswerResponse } from '../../lib/protocol';
	import PasswordStep from '../../lib/ui/PasswordStep.svelte';
	import StepHeader from '../../lib/ui/StepHeader.svelte';
	import OriginPill from './OriginPill.svelte';

	interface Props {
		origin: string;
		onanswer: (approved: boolean, password?: string) => Promise<PromptAnswerResponse>;
	}

	let { origin, onanswer }: Props = $props();

	// The same two steps as adding a key in onboarding: confirm, then the
	// optional password.
	let step = $state<'confirm' | 'password'>('confirm');
	let rejecting = $state(false);

	async function reject(): Promise<void> {
		rejecting = true;
		try {
			await onanswer(false);
		} finally {
			rejecting = false;
		}
	}

	async function save(password: string | null): Promise<void> {
		await onanswer(true, password ?? undefined);
	}
</script>

{#if step === 'confirm'}
	<section class="stack">
		<StepHeader progress={{ current: 1, total: 2 }} title={t('prompt.importTitle')} />
		<p>{t('prompt.importText')}</p>
		<OriginPill {origin} />
		<div class="actions">
			<button
				type="button"
				class="button secondary"
				disabled={rejecting}
				onclick={() => void reject()}
			>
				{t('prompt.reject')}
			</button>
			<button
				type="button"
				class="button primary"
				disabled={rejecting}
				onclick={() => (step = 'password')}
			>
				{t('common.next')}
			</button>
		</div>
	</section>
{:else}
	<PasswordStep
		progress={{ current: 2, total: 2 }}
		onback={() => (step = 'confirm')}
		onsave={save}
	/>
{/if}
