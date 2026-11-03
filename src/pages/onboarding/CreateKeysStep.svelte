<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { Download } from '@lucide/svelte';
	import { npubEncode, nsecEncode } from 'nostr-tools/nip19';
	import { getPublicKey } from 'nostr-tools/pure';
	import { t } from '../../lib/i18n/index.svelte';
	import { downloadTextFile, formatAccountKeyFile } from '../../lib/account-file';
	import KeyRows from '../../lib/ui/KeyRows.svelte';
	import StepHeader from './StepHeader.svelte';

	interface Props {
		progress: { current: number; total: number };
		secretKey: Uint8Array;
		onback: () => void;
		onnext: () => void;
	}

	let { progress, secretKey, onback, onnext }: Props = $props();

	let ackDownloaded = $state(false);
	let ackSecretSaved = $state(false);
	let ackProtected = $state(false);

	const npub = $derived(npubEncode(getPublicKey(secretKey)));
	const nsec = $derived(nsecEncode(secretKey));
	const canContinue = $derived(ackDownloaded && ackSecretSaved && ackProtected);
	const rows = $derived([
		{
			kind: 'public' as const,
			label: t('auth.setup.publicLabel'),
			value: npub,
			copy: t('auth.setup.copyPublic'),
			done: t('auth.setup.copiedPublic')
		},
		{
			kind: 'secret' as const,
			label: t('auth.setup.secretLabel'),
			value: nsec,
			copy: t('auth.setup.copySecret'),
			done: t('auth.setup.copiedSecret')
		}
	]);

	function download(): void {
		downloadTextFile(
			t('auth.setup.fileName'),
			formatAccountKeyFile({
				title: t('auth.setup.fileTitle'),
				publicLabel: t('auth.setup.publicLabel'),
				publicKey: npub,
				secretLabel: t('auth.setup.secretLabel'),
				secretKey: nsec,
				warning: t('auth.setup.fileWarning')
			})
		);
	}
</script>

<section class="stack">
	<StepHeader {progress} title={t('auth.setup.title')} />
	<h2>{t('auth.setup.keysTitle')}</h2>
	<p class="muted">{t('auth.setup.keysDescription')}</p>
	<KeyRows {rows} />
	<p class="notice">{t('auth.setup.keysWarning')}</p>
	<button
		type="button"
		class="button secondary"
		title={t('auth.setup.downloadHint')}
		onclick={download}
	>
		<Download size={16} strokeWidth={1.8} aria-hidden="true" />
		{t('auth.setup.download')}
	</button>
	<div class="acks">
		<label class="checkbox">
			<input type="checkbox" bind:checked={ackDownloaded} />
			<span>{t('auth.setup.ackDownloaded')}</span>
		</label>
		<label class="checkbox">
			<input type="checkbox" bind:checked={ackSecretSaved} />
			<span>{t('auth.setup.ackSecretSaved')}</span>
		</label>
		<label class="checkbox">
			<input type="checkbox" bind:checked={ackProtected} />
			<span>{t('auth.setup.ackProtected')}</span>
		</label>
	</div>
	<div class="actions">
		<button type="button" class="button secondary" onclick={onback}>{t('common.back')}</button>
		<button type="button" class="button primary" disabled={!canContinue} onclick={onnext}>
			{t('common.next')}
		</button>
	</div>
</section>

<style>
	.acks {
		display: grid;
		gap: 10px;
		padding: 4px 0;
	}
</style>
