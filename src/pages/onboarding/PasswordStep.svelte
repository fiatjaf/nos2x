<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { t } from '../../lib/i18n/index.svelte';
	import { passwordProblem } from '../../lib/password';
	import PasswordFields from '../../lib/ui/PasswordFields.svelte';
	import StepHeader from './StepHeader.svelte';

	interface Props {
		progress: { current: number; total: number };
		onback: () => void;
		onsave: (password: string | null) => Promise<void>;
	}

	let { progress, onback, onsave }: Props = $props();

	let password = $state('');
	let repeat = $state('');
	let attempted = $state(false);
	let busy = $state<'password' | 'plain' | null>(null);
	let failed = $state(false);

	async function save(withPassword: boolean): Promise<void> {
		if (withPassword) {
			attempted = true;
			if (passwordProblem(password, repeat)) return;
		}
		busy = withPassword ? 'password' : 'plain';
		failed = false;
		try {
			await onsave(withPassword ? password : null);
		} catch (error) {
			console.error('Saving the key failed:', error);
			failed = true;
		} finally {
			busy = null;
		}
	}

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		void save(true);
	}
</script>

<form class="stack" onsubmit={submit}>
	<StepHeader {progress} title={t('password.title')} />
	<p>{t('password.description')}</p>
	<PasswordFields bind:password bind:repeat showProblems={attempted} />
	<p class="muted">{t('password.hint')}</p>
	{#if failed}
		<p class="error" role="alert">{t('password.saveFailed')}</p>
	{/if}
	<button type="submit" class="button primary" disabled={busy !== null}>
		{busy === 'password' ? t('password.encrypting') : t('password.save')}
	</button>
	<div class="actions">
		<button type="button" class="button secondary" disabled={busy !== null} onclick={onback}>
			{t('common.back')}
		</button>
		<button
			type="button"
			class="button secondary"
			disabled={busy !== null}
			onclick={() => void save(false)}
		>
			{t('password.skip')}
		</button>
	</div>
</form>
