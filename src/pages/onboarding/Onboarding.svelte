<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import PageShell from '../../lib/ui/PageShell.svelte';
	import { account } from '../../lib/state/account.svelte';
	import { accountStatus, saveAccount } from '../../lib/keystore';
	import { approve } from '../../lib/approvals';
	import WelcomeStep from './WelcomeStep.svelte';
	import ImportStep from './ImportStep.svelte';
	import PasswordStep from './PasswordStep.svelte';
	import DoneStep from './DoneStep.svelte';
	import { returnOrigin } from './return-origin.svelte';

	type Step = 'welcome' | 'import' | 'password' | 'done';

	let step = $state<Step>('welcome');
	let secretKey = $state<Uint8Array | null>(null);

	// Onboarding reopened with an account already in place goes straight to
	// the finished state; replacing a key is done from the settings page.
	const view = $derived<Step>(
		step === 'welcome' && account.status !== null && account.status.state !== 'none' ? 'done' : step
	);
	const progress = $derived({ total: 2, current: view === 'import' ? 1 : 2 });

	function keyReady(key: Uint8Array): void {
		secretKey = key;
		step = 'password';
	}

	async function save(key: Uint8Array, password: string | null): Promise<void> {
		// AI design may have saved a key through its own prompt while onboarding
		// was open; that key is kept, never replaced from here.
		if ((await accountStatus()).state === 'none') {
			const pubkey = await saveAccount(key, password ?? undefined);
			// The user came here from this AI design page to sign in, so signing in
			// there right after onboarding needs no extra confirmation.
			if (returnOrigin.value) await approve(pubkey, returnOrigin.value);
		}
		secretKey = null;
		step = 'done';
	}

	async function savePassword(password: string | null): Promise<void> {
		if (secretKey) await save(secretKey, password);
	}

	function backToWelcome(): void {
		secretKey = null;
		step = 'welcome';
	}
</script>

<PageShell>
	{#if account.status === null}
		<div class="loading" aria-busy="true"></div>
	{:else if view === 'welcome'}
		<WelcomeStep onimport={() => (step = 'import')} />
	{:else if view === 'import'}
		<ImportStep {progress} onback={backToWelcome} onkey={keyReady} onsave={save} />
	{:else if view === 'password' && secretKey}
		<PasswordStep {progress} onback={() => (step = 'import')} onsave={savePassword} />
	{:else}
		<DoneStep />
	{/if}
</PageShell>

<style>
	.loading {
		min-height: 240px;
	}
</style>
