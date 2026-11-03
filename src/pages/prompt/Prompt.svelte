<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import PageShell from '../../lib/ui/PageShell.svelte';
	import { t } from '../../lib/i18n/index.svelte';
	import type { PromptAnswerResponse, PromptDetails, PromptMessage } from '../../lib/protocol';
	import ConnectPrompt from './ConnectPrompt.svelte';
	import ImportPrompt from './ImportPrompt.svelte';

	interface Props {
		promptId: string;
		details: PromptDetails | null;
	}

	let { promptId, details }: Props = $props();

	async function answer(approved: boolean, password?: string): Promise<PromptAnswerResponse> {
		try {
			return await chrome.runtime.sendMessage<PromptMessage, PromptAnswerResponse>({
				kind: 'prompt:answer',
				promptId,
				approved,
				password
			});
		} catch (error) {
			console.error('Sending the prompt answer failed:', error);
			return { ok: true };
		}
	}
</script>

<PageShell>
	{#if details?.kind === 'connect'}
		<ConnectPrompt
			origin={details.origin}
			approve={details.approve}
			unlock={details.unlock}
			onanswer={answer}
		/>
	{:else if details?.kind === 'import'}
		<ImportPrompt origin={details.origin} pubkey={details.pubkey} onanswer={answer} />
	{:else}
		<div class="stack">
			<p class="muted">{t('prompt.expired')}</p>
			<button type="button" class="button secondary" onclick={() => window.close()}>
				{t('common.close')}
			</button>
		</div>
	{/if}
</PageShell>
