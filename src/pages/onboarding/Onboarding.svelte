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
	import PageShell from '../../lib/ui/PageShell.svelte';
	import { account } from '../../lib/state/account.svelte';
	import { generateSecretKey } from 'nostr-tools/pure';
	import { saveAccount } from '../../lib/keystore';
	import { approve } from '../../lib/approvals';
	import WelcomeStep from './WelcomeStep.svelte';
	import CreateIntroStep from './CreateIntroStep.svelte';
	import CreateKeysStep from './CreateKeysStep.svelte';
	import ImportStep from './ImportStep.svelte';
	import PasswordStep from './PasswordStep.svelte';
	import DoneStep from './DoneStep.svelte';
	import { returnOrigin } from './return-origin.svelte';

	type Step = 'welcome' | 'create-intro' | 'create-keys' | 'import' | 'password' | 'done';

	let step = $state<Step>('welcome');
	let flow = $state<'create' | 'import'>('create');
	let secretKey = $state<Uint8Array | null>(null);

	// Onboarding reopened with an account already in place goes straight to
	// the finished state; replacing a key is done from the settings page.
	const view = $derived<Step>(
		step === 'welcome' && account.status !== null && account.status.state !== 'none' ? 'done' : step
	);
	const progress = $derived(
		flow === 'create'
			? { total: 3, current: view === 'create-intro' ? 1 : view === 'create-keys' ? 2 : 3 }
			: { total: 2, current: view === 'import' ? 1 : 2 }
	);

	function start(next: 'create' | 'import'): void {
		flow = next;
		step = next === 'create' ? 'create-intro' : 'import';
	}

	function generate(): void {
		secretKey = generateSecretKey();
		step = 'create-keys';
	}

	function keyReady(key: Uint8Array): void {
		secretKey = key;
		step = 'password';
	}

	async function save(key: Uint8Array, password: string | null): Promise<void> {
		const pubkey = await saveAccount(key, password ?? undefined);
		// The user came here from this AI design page to sign in, so signing in
		// there right after onboarding needs no extra confirmation.
		if (returnOrigin.value) await approve(pubkey, returnOrigin.value);
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
		<WelcomeStep onstart={start} />
	{:else if view === 'create-intro'}
		<CreateIntroStep {progress} onback={backToWelcome} oncreate={generate} />
	{:else if view === 'create-keys' && secretKey}
		<CreateKeysStep
			{progress}
			{secretKey}
			onback={() => (step = 'create-intro')}
			onnext={() => (step = 'password')}
		/>
	{:else if view === 'import'}
		<ImportStep {progress} onback={backToWelcome} onkey={keyReady} onsave={save} />
	{:else if view === 'password' && secretKey}
		<PasswordStep
			{progress}
			onback={() => (step = flow === 'create' ? 'create-keys' : 'import')}
			onsave={savePassword}
		/>
	{:else}
		<DoneStep />
	{/if}
</PageShell>

<style>
	.loading {
		min-height: 240px;
	}
</style>
