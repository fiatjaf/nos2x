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
	import { Upload } from '@lucide/svelte';
	import { decrypt } from 'nostr-tools/nip49';
	import { t } from '../../lib/i18n/index.svelte';
	import { parseKeyInput } from '../../lib/key-input';
	import StepHeader from './StepHeader.svelte';

	interface Props {
		progress: { current: number; total: number };
		onback: () => void;
		onkey: (secretKey: Uint8Array) => void;
		onsave: (secretKey: Uint8Array, password: string) => Promise<void>;
	}

	let { progress, onback, onkey, onsave }: Props = $props();

	let text = $state('');
	let error = $state<'import.invalid' | 'import.fileFailed' | 'password.wrong' | null>(null);
	let ncryptsec = $state<string | null>(null);
	let password = $state('');
	let busy = $state(false);

	function submitKey(event: SubmitEvent): void {
		event.preventDefault();
		const parsed = parseKeyInput(text);
		if (!parsed) {
			error = 'import.invalid';
			return;
		}
		error = null;
		if (parsed.kind === 'secret') onkey(parsed.secretKey);
		else ncryptsec = parsed.ncryptsec;
	}

	async function readFile(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = '';
		if (!file) return;
		try {
			text = await file.text();
			error = parseKeyInput(text) ? null : 'import.invalid';
		} catch (readError) {
			console.error('Reading the key file failed:', readError);
			error = 'import.fileFailed';
		}
	}

	async function submitPassword(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!ncryptsec) return;
		busy = true;
		error = null;
		let secretKey: Uint8Array;
		try {
			secretKey = decrypt(ncryptsec, password);
		} catch {
			// NIP-49 decryption of a well-formed ncryptsec fails only on a wrong password.
			error = 'password.wrong';
			busy = false;
			return;
		}
		try {
			// The key keeps the password it already had.
			await onsave(secretKey, password);
		} catch (saveError) {
			console.error('Saving the imported key failed:', saveError);
			error = 'import.invalid';
		} finally {
			busy = false;
		}
	}
</script>

<section class="stack">
	<StepHeader {progress} title={t('import.title')} />

	{#if ncryptsec}
		<form class="stack" onsubmit={submitPassword}>
			<p>{t('import.encrypted')}</p>
			<label class="field">
				<span>{t('password.new')}</span>
				<input
					class="text-input"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					oninput={() => (error = null)}
					aria-invalid={error === 'password.wrong'}
					required
				/>
			</label>
			{#if error}
				<p class="error" role="alert">{t(error)}</p>
			{/if}
			<div class="actions">
				<button type="button" class="button secondary" onclick={() => (ncryptsec = null)}>
					{t('common.back')}
				</button>
				<button type="submit" class="button primary" disabled={busy || password.length === 0}>
					{busy ? t('password.encrypting') : t('import.decrypt')}
				</button>
			</div>
		</form>
	{:else}
		<form class="stack" onsubmit={submitKey}>
			<p class="muted">{t('import.description')}</p>
			<label class="field">
				<span>{t('import.label')}</span>
				<textarea
					class="text-input key-input"
					rows="3"
					spellcheck="false"
					autocomplete="off"
					placeholder="nsec1…"
					bind:value={text}
					oninput={() => (error = null)}
					aria-invalid={error === 'import.invalid'}></textarea>
			</label>
			<label class="button secondary upload">
				<Upload size={16} strokeWidth={1.8} aria-hidden="true" />
				{t('import.upload')}
				<input class="visually-hidden" type="file" accept=".txt,text/plain" onchange={readFile} />
			</label>
			{#if error}
				<p class="error" role="alert">{t(error)}</p>
			{/if}
			<div class="actions">
				<button type="button" class="button secondary" onclick={onback}>{t('common.back')}</button>
				<button type="submit" class="button primary" disabled={text.trim().length === 0}>
					{t('common.next')}
				</button>
			</div>
		</form>
	{/if}
</section>

<style>
	.key-input {
		resize: vertical;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		word-break: break-all;
	}

	.upload:focus-within {
		border-color: var(--color-border-focus);
	}
</style>
