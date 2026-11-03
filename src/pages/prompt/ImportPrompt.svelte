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
	import { npubEncode } from 'nostr-tools/nip19';
	import { t } from '../../lib/i18n/index.svelte';
	import { passwordProblem } from '../../lib/password';
	import type { PromptAnswerResponse } from '../../lib/protocol';
	import KeyRows from '../../lib/ui/KeyRows.svelte';
	import PasswordFields from '../../lib/ui/PasswordFields.svelte';
	import OriginPill from './OriginPill.svelte';

	interface Props {
		origin: string;
		pubkey: string;
		onanswer: (approved: boolean, password?: string) => Promise<PromptAnswerResponse>;
	}

	let { origin, pubkey, onanswer }: Props = $props();

	let password = $state('');
	let repeat = $state('');
	let attempted = $state(false);
	let busy = $state(false);

	const withPassword = $derived(password.length > 0 || repeat.length > 0);
	const rows = $derived([
		{
			kind: 'public' as const,
			label: t('auth.setup.publicLabel'),
			value: npubEncode(pubkey),
			copy: t('auth.setup.copyPublic'),
			done: t('auth.setup.copiedPublic')
		}
	]);

	async function answer(approved: boolean): Promise<void> {
		if (approved && withPassword) {
			attempted = true;
			if (passwordProblem(password, repeat)) return;
		}
		busy = true;
		try {
			await onanswer(approved, approved && withPassword ? password : undefined);
		} finally {
			busy = false;
		}
	}

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		void answer(true);
	}
</script>

<form class="stack" onsubmit={submit}>
	<h1>{t('prompt.importTitle')}</h1>
	<p>{t('prompt.importText')}</p>
	<OriginPill {origin} />
	<KeyRows {rows} />
	<p class="muted">{t('prompt.importPassword')}</p>
	<PasswordFields bind:password bind:repeat showProblems={attempted} />

	<div class="actions">
		<button
			type="button"
			class="button secondary"
			disabled={busy}
			onclick={() => void answer(false)}
		>
			{t('prompt.deny')}
		</button>
		<button type="submit" class="button primary" disabled={busy}>
			{busy && withPassword ? t('password.encrypting') : t('prompt.importSave')}
		</button>
	</div>
</form>
