<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1

AI Design Signer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { LockKeyhole } from '@lucide/svelte';
	import { t } from '../i18n/index.svelte';
	import { unlock } from '../keystore';

	let password = $state('');
	let error = $state<'password.wrong' | 'unlock.failed' | null>(null);
	let busy = $state(false);

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		busy = true;
		error = null;
		try {
			if ((await unlock(password)) === 'wrong_password') {
				error = 'password.wrong';
				password = '';
			}
		} catch (unlockError) {
			console.error('Unlocking the key failed:', unlockError);
			error = 'unlock.failed';
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
				aria-invalid={error === 'password.wrong'}
				required
			/>
		</span>
	</label>
	{#if error}
		<p class="error" role="alert">{t(error)}</p>
	{/if}
	<button type="submit" class="button primary" disabled={busy || password.length === 0}>
		{t('unlock.submit')}
	</button>
</form>
