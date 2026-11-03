<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1

AI Design Signer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { t, ti } from '../i18n/index.svelte';
	import { MIN_PASSWORD_LENGTH, passwordProblem } from '../password';

	interface Props {
		password: string;
		repeat: string;
		showProblems: boolean;
	}

	let { password = $bindable(), repeat = $bindable(), showProblems }: Props = $props();

	const problem = $derived(showProblems ? passwordProblem(password, repeat) : null);
</script>

<label class="field">
	<span>{t('password.new')}</span>
	<input
		class="text-input"
		type="password"
		autocomplete="new-password"
		minlength={MIN_PASSWORD_LENGTH}
		bind:value={password}
		aria-invalid={problem === 'password.tooShort'}
	/>
</label>
<label class="field">
	<span>{t('password.repeat')}</span>
	<input
		class="text-input"
		type="password"
		autocomplete="new-password"
		bind:value={repeat}
		aria-invalid={problem === 'password.mismatch'}
	/>
</label>
{#if problem}
	<p class="error" role="alert">{ti(problem, { min: MIN_PASSWORD_LENGTH })}</p>
{/if}
