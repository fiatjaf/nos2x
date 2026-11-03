<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { LockKeyhole } from '@lucide/svelte';
	import { t } from '../i18n/index.svelte';
	import { unlock } from '../keystore';

	let password = $state('');
	let wrongPassword = $state(false);
	let busy = $state(false);

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		busy = true;
		wrongPassword = false;
		try {
			if ((await unlock(password)) === 'wrong_password') wrongPassword = true;
			password = '';
		} catch (error) {
			console.error('Unlocking the key failed:', error);
		} finally {
			busy = false;
		}
	}
</script>

<form class="stack" onsubmit={submit}>
	<label class="field">
		<span>{t('unlock.label')}</span>
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
	<button type="submit" class="button primary" disabled={busy || password.length === 0}>
		{t('unlock.submit')}
	</button>
</form>
