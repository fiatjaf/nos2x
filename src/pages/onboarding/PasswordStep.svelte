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

	async function save(withPassword: boolean): Promise<void> {
		if (withPassword) {
			attempted = true;
			if (passwordProblem(password, repeat)) return;
		}
		busy = withPassword ? 'password' : 'plain';
		try {
			await onsave(withPassword ? password : null);
		} catch (error) {
			console.error('Saving the key failed:', error);
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
